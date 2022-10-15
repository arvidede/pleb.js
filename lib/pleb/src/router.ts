import express, { RequestHandler, Application } from 'express'
import { __clientDir } from './constants'
import getLogger from './utils/log'
import { getDevMiddleware } from './webpack/devServer'
import compression from 'compression'

const log = getLogger()
interface Options {
    pageHandler: RequestHandler
    isProd?: boolean
    port?: number
    staticDirectory: string
}

export class Router {
    private app!: Application
    private options!: Options
    constructor(options: Options) {
        this.options = options
        this.createRouter()
        this.buildRoutes()
    }

    private get staticDirectory() {
        return this.options.staticDirectory
    }

    private get port() {
        return this.options.port || 3000
    }

    private createRouter() {
        this.app = express()
    }

    private buildRoutes() {
        if (this.options.isProd) {
            this.app.use(compression())
            this.app.use('/__pleb/static', express.static(this.staticDirectory))
        } else {
            log.debug('Initializing webpack')
            this.app.use(getDevMiddleware())
        }

        this.app.use('*', this.options.pageHandler)
    }

    listen() {
        this.app.listen(this.port, () => {
            log.info(`Pleb available at http://localhost:${this.port}`)
        })
    }
}

let router: Router

export default function getRouter(options: Options) {
    if (!router) {
        router = new Router(options)
    }
    return router
}
