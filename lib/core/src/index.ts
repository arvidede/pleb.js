import express, { RequestHandler } from 'express'
import fs from 'fs'
import { renderPageToString } from './render'
interface Options {
    buildDirectory: string
    pagesDirectory: string
}

class Server {
    app!: express.Application
    options!: Options

    constructor(
        options: Options = {
            buildDirectory: './pleb',
            pagesDirectory: './pages',
        }
    ) {
        this.options = options
        this.init()
    }

    init() {
        this.app = express()
        this.buildPages()
        this.buildRoutes()
    }

    createBuildDirectory() {
        fs.mkdirSync(this.options.buildDirectory)
    }

    async buildPages() {
        const pages = fs.readdirSync(this.options.pagesDirectory)

        this.createBuildDirectory()

        await Promise.all(
            pages.map(async (page) => {
                const jsx = await import(page)
                const markup = renderPageToString(jsx)
                fs.writeFileSync(page, markup)
            })
        )
    }

    createPageHandler(): RequestHandler {
        return async (req, res) => {
            const url = new URL(req.url)
            const page = this.options.buildDirectory + url.pathname

            if (!fs.existsSync(page)) return res.status(404).end()

            const markup = await new Promise((resolve, reject) => {
                fs.readFile(page, (err, markup) => {
                    if (err) reject(err)
                    resolve(markup)
                })
            })

            return res.status(200).send(markup)
        }
    }

    buildRoutes() {
        const handler = this.createPageHandler()
        this.app.use('*', handler)
    }

    listen() {
        this.app.listen(3000, () => {})
    }
}

export default new Server()
