import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import getRouter, { Router } from './router'
import { render } from './render/server'
import * as log from './utils/log'
import { filePathToSlug, fileExtensionToHTML } from './utils/files'
import { createServer as createViteServer, ViteDevServer } from 'vite'
import compression from 'compression'
import { __clientDir, __dirname } from './constants'
import type { BuildManifest } from '../types'

interface Options {
    buildDirectory: string
    pagesDirectory: string
    isProd: boolean
    logLevel: 'warn' | 'info'
}

export type ServerOptions = Partial<Options>

const DEFAULT_OPTIONS: Options = {
    buildDirectory: './.pleb',
    pagesDirectory: './pages',
    isProd: process.env.NODE_ENV === 'production',
    logLevel: 'info',
}
class Server {
    router!: Router
    options!: Options
    vite!: ViteDevServer
    buildManifest!: BuildManifest

    constructor(options?: ServerOptions) {
        this.options = { ...DEFAULT_OPTIONS, ...options }
        this.init()
    }

    async init() {
        await this.setupRouter()
        this.buildStaticPages()
    }

    private async setupVite() {
        this.vite = await createViteServer({
            root: this.buildDirectory,
            logLevel: this.options.logLevel,
            server: {
                middlewareMode: true,
                watch: {
                    usePolling: true,
                    interval: 100,
                },
                hmr: {
                    port: undefined,
                },
            },
            appType: 'custom',
        })
    }

    private async setupRouter() {
        this.router = getRouter(this.pageHandler)

        if (this.options.isProd) {
            this.router.app.use(compression)
            this.router.app.use('*', this.pageHandler)
        } else {
            await this.setupVite()
            this.router.app.use(this.vite.middlewares)
            this.router.app.use('*', this.devPageHandler)
        }

        this.router.listen()
    }

    get pageDirectory() {
        return path.resolve(__clientDir, this.options.pagesDirectory)
    }

    get buildDirectory() {
        return path.resolve(__clientDir, this.options.buildDirectory)
    }

    private get host() {
        return 'http://localhost:3000'
    }

    createBuildDirectory() {
        if (fs.existsSync(this.buildDirectory)) {
            log.info('Removing existing build output')
            fs.rmSync(this.buildDirectory, {
                recursive: true,
                force: true,
            })
        }
        fs.mkdirSync(this.buildDirectory)
    }

    async buildStaticPages() {
        if (!fs.existsSync(this.pageDirectory)) {
            log.warn(`No 'pages' directory found at ${this.pageDirectory}`)
            this.exit()
        }

        this.createBuildDirectory()

        const pages = fs
            .readdirSync(this.pageDirectory)
            .filter((page) => !/_app.tsx|api/.test(page))

        let currentPage = 1
        const numPages = pages.length

        const buildManifest: BuildManifest = {
            pages: {},
        }

        log.info('Compiling pages...')
        for (const page of pages) {
            const pagePath = path.resolve(this.pageDirectory, page)
            log.info(`- (${currentPage++}/${numPages}): ${pagePath}`)
            const slug = filePathToSlug(page)
            const htmlPage = fileExtensionToHTML(page)
            const outFile = fs.createWriteStream(
                path.resolve(this.buildDirectory, htmlPage)
            )
            render(slug).pipe(outFile)
            fs.copyFileSync(pagePath, path.resolve(this.buildDirectory, page))
            buildManifest.pages[slug] = {
                markup: htmlPage,
                script: page,
            }
        }
        fs.writeFileSync(
            path.resolve(this.buildDirectory, 'buildManifest.json'),
            JSON.stringify(buildManifest)
        )
        fs.copyFileSync(
            path.resolve(__dirname, 'client.js'),
            path.resolve(this.buildDirectory, 'client.js')
        )

        this.buildManifest = buildManifest
        log.info(`Compiled ${currentPage - 1} pages.`)
    }

    private getPagePathFromRequest<T>(req: Request<T>) {
        const url = new URL(req.originalUrl, this.host)
        const slug = url.pathname
        if (url.pathname === '/') url.pathname = 'index'
        const pagePath = path.join(this.buildDirectory, url.pathname + '.html')
        return { slug, pagePath }
    }

    private serveStaticPage = async (req: Request, res: Response) => {
        const { pagePath } = this.getPagePathFromRequest(req)
        let template = fs.readFileSync(pagePath, 'utf-8')
        template = await this.vite.transformIndexHtml(req.originalUrl, template)

        return res
            .status(200)
            .set('Content-Type', 'text/html; charset=UTF-8')
            .end(template)
    }

    private serveDynamicPage = async (req: Request, res: Response) => {
        const { pagePath } = this.getPagePathFromRequest(req)
        let template = fs.readFileSync(pagePath, 'utf-8')
        template = await this.vite.transformIndexHtml(req.originalUrl, template)

        return res
            .status(200)
            .set('Content-Type', 'text/html; charset=UTF-8')
            .end(template)
    }

    private hasBeenGenerated(slug: string): boolean {
        return slug in this.buildManifest.pages
    }

    private pageHandler = (req: Request, res: Response) => {
        try {
            const { slug, pagePath } = this.getPagePathFromRequest(req)
            log.info(
                `${req.method.toUpperCase()}: ${pagePath} ${req.originalUrl}`
            )

            if (!fs.existsSync(pagePath)) return res.status(404).end()

            const handler = this.hasBeenGenerated(slug)
                ? this.serveStaticPage
                : this.serveDynamicPage

            return handler(req, res)
        } catch (error: unknown) {
            log.error(error, req.url)
            return res.status(500).end()
        }
    }

    private getDevPagePathFromRequest = (req: Request) => {
        const url = new URL(req.originalUrl, this.host)
        if (url.pathname === '/') url.pathname = 'index'
        const file = url.pathname + '.tsx'
        return {
            page: path.join(this.pageDirectory, file),
            script: path.join(this.buildDirectory, file),
        }
    }

    private devPageHandler = async (req: Request, res: Response) => {
        try {
            const { page } = this.getDevPagePathFromRequest(req)
            log.info(`${req.method.toUpperCase()}: ${page} ${req.originalUrl}`)
            if (!fs.existsSync(page)) return res.status(404).end()
            // const markup = render(page)

            // const transformedMarkup = await this.vite.transformIndexHtml(
            //     req.originalUrl,
            //     markup
            // )

            const transformedMarkup = '<div></div>'

            return res
                .status(200)
                .set('Content-Type', 'text/html; charset=UTF-8')
                .end(transformedMarkup)
        } catch (error: unknown) {
            log.error(error, req.url)
            return res.status(500).end()
        }
    }

    private exit() {
        log.info('Exiting...')
        process.exit(1)
    }
}

let server: Server

export default function createServer(options: ServerOptions) {
    if (!server) server = new Server(options)
    return server
}
