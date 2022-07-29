import express, { RequestHandler, Application } from 'express'
import path from 'path'
import * as log from './utils/log'

interface Options {
    pageHandler: RequestHandler
    port?: number
    publicDir?: string
}

export class Router {
    app!: Application
    private options!: Options
    constructor(options: Options) {
        this.options = options
        this.createRouter()
        this.buildRoutes()
    }

    private get publicDir() {
        return this.options.publicDir || path.join(process.cwd(), 'public')
    }

    private get port() {
        return this.options.port || 3000
    }

    private createRouter() {
        this.app = express()
    }

    private buildRoutes() {
        this.app.use(express.static(this.publicDir))
        // this.app.use('*', this.options.pageHandler)
    }

    listen() {
        this.app.listen(this.port, () => {
            log.info(`Listening at http://localhost:${this.port}`)
        })
    }
}

let router: Router

export default function getRouter(pageHandler: RequestHandler) {
    if (!router) {
        router = new Router({ pageHandler })
    }
    return router
}
