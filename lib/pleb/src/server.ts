import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import getRouter, { Router } from './router'
import { render } from './render/server'
import * as log from './utils/log'
import { filePathToSlug, fileExtensionToHTML } from './utils/files'
import compression from 'compression'
import { __clientDir, __dirname } from './constants'
import type { BuildManifest } from './types'
import esbuild from 'esbuild'
import Webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { getConfig } from './webpack.config.js'

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
    buildManifest!: BuildManifest

    constructor(options?: ServerOptions) {
        this.options = { ...DEFAULT_OPTIONS, ...options }
        this.init()
    }

    async init() {
        await this.setupRouter()
        this.buildStaticPages()
    }

    private async setupRouter() {
        this.router = getRouter(this.pageHandler)

        if (this.options.isProd) {
            this.router.app.use(compression)
            this.router.app.use('*', this.pageHandler)
        } else {
            this.router.app.use('*', this.devPageHandler)
        }

        this.router.listen()
    }

    startDevServer() {
        const webpackConfig = getConfig('server')
        const compiler = Webpack(webpackConfig)
        const devServerOptions = {
            ...webpackConfig.devServer, // serverConfig
            open: true,
        }
        const server = new WebpackDevServer(devServerOptions, compiler)
        server.start()
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

    async compilePage(path: string, file: string) {
        return esbuild
            .build({
                entryPoints: [path],
                bundle: true,
                outfile: `${this.buildDirectory}/${file.replace('tsx', 'mjs')}`,
                tsconfig: __dirname + '/tsconfig.json',
                jsx: 'automatic',
                format: 'esm',
                platform: 'node',
            })
            .catch(log.error)
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
        const buildDirectory = this.buildDirectory
        log.info('Compiling pages...')
        for (const page of pages) {
            const pagePath = path.resolve(this.pageDirectory, page)
            log.info(`- (${currentPage++}/${numPages}): ${pagePath}`)
            const slug = filePathToSlug(page)
            const htmlPage = fileExtensionToHTML(page)

            await this.compilePage(pagePath, page)

            const renderStream = render(page, {
                onShellError: log.error,
                onError: log.error,
                onAllReady() {
                    const outFile = fs.createWriteStream(
                        path.resolve(buildDirectory, htmlPage)
                    )
                    renderStream.pipe(outFile)
                },
            })
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

        const publicDir = path.join(__clientDir, '/public')
        console.log(publicDir)
        fs.readdirSync(publicDir).forEach((file) => {
            fs.copyFileSync(
                path.resolve(publicDir, file),
                path.resolve(this.buildDirectory, file)
            )
        })

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

        return res
            .status(200)
            .set('Content-Type', 'text/html; charset=UTF-8')
            .end(template)
    }

    private serveDynamicPage = async (req: Request, res: Response) => {
        const { pagePath } = this.getPagePathFromRequest(req)
        let template = fs.readFileSync(pagePath, 'utf-8')

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

            // const renderStream = render(page, {
            //     onShellReady() {
            //         res.statusCode = 200
            //         res.setHeader('Content-type', 'text/html; charset=UTF-8')
            //         renderStream.pipe(res)
            //     },
            //     onShellError(error) {
            //         log.error(error)
            //         res.statusCode = 500
            //         res.send('<!doctype html><p>Loading...</p>')
            //     },
            //     onAllReady() {
            //         res.statusCode = 200
            //         res.setHeader('Content-type', 'text/html; charset=UTF-8')
            //         renderStream.pipe(res)
            //     },
            //     onError(err) {
            //         console.error(err)
            //     },
            // })

            // const transformedMarkup = await this.vite.transformIndexHtml(
            //     req.originalUrl,
            //     markup
            // )

            return res
                .status(200)
                .set('Content-Type', 'text/html; charset=UTF-8')
                .sendFile(__clientDir + '/.pleb/index.html')
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
