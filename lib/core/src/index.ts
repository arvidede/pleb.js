import { Request, RequestHandler } from 'express'
import fs from 'fs'
import path from 'path'
import getRouter, { Router } from './router'
import { renderPageToString } from './render'
import * as log from './utils/log'
import { pageBuildExtension } from './utils/files'
interface Options {
    buildDirectory: string
    pagesDirectory: string
}

const DEFAULT_OPTIONS = {
    buildDirectory: './.pleb',
    pagesDirectory: './examples',
}
class Server {
    router!: Router
    options!: Options

    constructor(options: Options = DEFAULT_OPTIONS) {
        this.options = options
        this.init()
    }

    init() {
        this.buildPages()
        const handler = this.createPageHandler()
        this.router = getRouter(handler)
    }

    get pageDirectory() {
        return path.join(__dirname, this.options.pagesDirectory)
    }

    get buildDirectory() {
        return path.join(__dirname, this.options.buildDirectory)
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

    async buildPages() {
        if (!fs.existsSync(this.pageDirectory)) {
            log.warn(`No 'pages' directory found at ${this.pageDirectory}`)
            this.exit()
        }

        this.createBuildDirectory()

        const pages = fs.readdirSync(this.pageDirectory)

        let currentPage = 1
        const numPages = pages.length

        log.info('Compiling pages...')
        for (const page of pages) {
            const pagePath = path.join(this.pageDirectory, page)
            log.info(`- (${currentPage++}/${numPages}): ${pagePath}`)
            const jsx = require(pagePath)
            const markup = renderPageToString(jsx.default)
            fs.writeFileSync(
                path.join(this.buildDirectory, pageBuildExtension(page)),
                markup
            )
        }
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
                log.info(`${req.method.toUpperCase()}: ${pagePath}`)

                if (!fs.existsSync(pagePath)) return res.status(404).end()

                res.set('Content-Type', 'text/html; charset=UTF-8')
                return res.status(200).sendFile(pagePath)
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
