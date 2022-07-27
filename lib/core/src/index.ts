import { Request, RequestHandler } from 'express'
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

        const buildManifest = {
            pages: [] as string[],
        }

        log.info('Compiling pages...')
        for (const page of pages) {
            const pagePath = path.resolve(this.pageDirectory, page)
            log.info(`- (${currentPage++}/${numPages}): ${pagePath}`)
            const jsx = require(pagePath)
            const markup = render(jsx.default)
            fs.writeFileSync(
                path.resolve(this.buildDirectory, pageBuildExtension(page)),
                markup
            )
            buildManifest.pages.push(page.replace(/\..+/, ''))
        }
        fs.writeFileSync(
            path.resolve(this.buildDirectory, 'buildManifest.json'),
            JSON.stringify(buildManifest)
        )
        log.info(`Compiled ${currentPage - 1} pages.`)
    }

    private getPagePathFromRequest<T>(req: Request<T>) {
        const url = new URL(req.originalUrl, 'http://localhost:3000')
        if (url.pathname === '/') url.pathname = 'index'
        return path.join(this.buildDirectory, url.pathname + '.html')
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

                let template = fs.readFileSync(pagePath, 'utf-8')
                template = await this.vite.transformIndexHtml(
                    req.originalUrl,
                    template
                )

                return res
                    .status(200)
                    .set('Content-Type', 'text/html; charset=UTF-8')
                    .end(template)
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
