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
    options!: Options
    constructor(options: Options) {
        this.options = options
        this.createRouter()
        this.buildRoutes()
        this.listen()
    }

    get publicDir() {
        return this.options.publicDir || path.join(__dirname, 'public')
    }

    get port() {
        return this.options.port || 3000
    }

    createRouter() {
        this.app = express()
    }

    buildRoutes() {
        this.app.use(express.static(this.publicDir))
        this.app.use('*', this.options.pageHandler)
    }

    listen() {
        this.app.listen(this.port, () => {
            log.info(`Listening at ${this.port}`)
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
