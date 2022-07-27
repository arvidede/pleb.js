import { Request, Response, RequestHandler } from 'express'
import fs from 'fs'
import path from 'path'
import getRouter, { Router } from './router'
import { render } from './render/server'
import * as log from './utils/log'
import { pageBuildExtension } from './utils/files'
import { createServer, ViteDevServer } from 'vite'
import compression from 'compression'

interface Options {
    buildDirectory: string
    pagesDirectory: string
    isProd: boolean
    logLevel?: 'warn' | 'info'
}

interface BuildManifest {
    pages: string[]
}

const DEFAULT_OPTIONS: Options = {
    buildDirectory: './.pleb',
    pagesDirectory: './examples',
    isProd: process.env.NODE_ENV === 'production',
    logLevel: 'info',
}
class Server {
    router!: Router
    options!: Options
    vite!: ViteDevServer
    buildManifest!: BuildManifest

    constructor(options: Options = DEFAULT_OPTIONS) {
        this.options = options
        this.init()
    }

    async init() {
        this.buildStaticPages()
        const handler = this.createPageHandler()
        this.router = getRouter(handler)
        if (this.options.isProd) await this.setupProdEnv()
        if (!this.options.isProd) await this.setupVite()
        this.router.listen()
    }

    private setupProdEnv() {
        this.router.app.use(compression)
    }

    private async setupVite() {
        this.vite = await createServer({
            root: __dirname,
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
        this.router.app.use(this.vite.middlewares)
        this.router.app.use('*', this.createPageHandler())
    }

    get pageDirectory() {
        return path.resolve(__dirname, this.options.pagesDirectory)
    }

    get buildDirectory() {
        return path.resolve(__dirname, this.options.buildDirectory)
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

        const pages = fs.readdirSync(this.pageDirectory)

        let currentPage = 1
        const numPages = pages.length

        const buildManifest: BuildManifest = {
            pages: [],
        }

        log.info('Compiling pages...')
        for (const page of pages) {
            const pagePath = path.resolve(this.pageDirectory, page)
            log.info(`- (${currentPage++}/${numPages}): ${pagePath}`)
            const jsx = require(pagePath)
            const markup = render(jsx.default)
            const pageWithExtension = pageBuildExtension(page)
            fs.writeFileSync(
                path.resolve(this.buildDirectory, pageWithExtension),
                markup
            )
            buildManifest.pages.push(pageWithExtension)
        }
        fs.writeFileSync(
            path.resolve(this.buildDirectory, 'buildManifest.json'),
            JSON.stringify(buildManifest)
        )

        this.buildManifest = buildManifest
        log.info(`Compiled ${currentPage - 1} pages.`)
    }

    private getPagePathFromRequest<T>(req: Request<T>) {
        const url = new URL(req.originalUrl, 'http://localhost:3000')
        if (url.pathname === '/') url.pathname = 'index'
        return path.join(this.buildDirectory, url.pathname + '.html')
    }

    private async serveStaticPage(req: Request, res: Response) {
        const pagePath = this.getPagePathFromRequest(req)
        let template = fs.readFileSync(pagePath, 'utf-8')
        template = await this.vite.transformIndexHtml(req.originalUrl, template)

        return res
            .status(200)
            .set('Content-Type', 'text/html; charset=UTF-8')
            .end(template)
    }

    private async serveDynamicPage(req: Request, res: Response) {
        const pagePath = this.getPagePathFromRequest(req)
        let template = fs.readFileSync(pagePath, 'utf-8')
        template = await this.vite.transformIndexHtml(req.originalUrl, template)

        return res
            .status(200)
            .set('Content-Type', 'text/html; charset=UTF-8')
            .end(template)
    }

    private createPageHandler(): RequestHandler {
        return async (req, res) => {
            try {
                const pagePath = this.getPagePathFromRequest(req)
                log.info(
                    `${req.method.toUpperCase()}: ${pagePath} ${
                        req.originalUrl
                    }`
                )

                if (!fs.existsSync(pagePath)) return res.status(404).end()

                const handler = this.buildManifest.pages.includes(pagePath)
                    ? this.serveStaticPage
                    : this.serveDynamicPage

                return handler(req, res)
            } catch (error: unknown) {
                log.error(error, req.url)
                return res.status(500).end()
            }
        }
    }

    private exit() {
        log.info('Exiting...')
        process.exit(1)
    }
}

export default new Server()
