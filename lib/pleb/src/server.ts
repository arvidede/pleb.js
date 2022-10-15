import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import getRouter, { Router } from './router'
import { render } from './render/server'
import getLogger, { LogLevel } from './utils/log'
import { filePathToSlug, fileExtensionToHTML } from './utils/files'
import { loaders, __clientDir, __dirname } from './constants'
import type { BuildManifest } from './types'
import esbuild from 'esbuild'

const log = getLogger('debug')
interface Options {
    buildDirectory: string
    pagesDirectory: string
    isProd: boolean
    logLevel: LogLevel
    publicDirectory: string
}

export type ServerOptions = Partial<Options>

const DEFAULT_OPTIONS: Options = {
    buildDirectory: './.pleb',
    pagesDirectory: './pages',
    publicDirectory: './public',
    isProd: true, //process.env.NODE_ENV === 'production',
    logLevel: 'debug',
}
class Server {
    router!: Router
    options!: Options
    buildManifest!: BuildManifest

    constructor(options?: ServerOptions) {
        this.options = { ...DEFAULT_OPTIONS, ...options }
        log.debug(
            'Starting pleb server with options',
            JSON.stringify(this.options, null, 2)
        )
        this.init()
    }

    private async init() {
        await this.build()
        this.setupRouter()
    }

    private async build() {
        this.createBuildDirectory()
        await this.buildStaticPages()
        this.copyPublicDirectory()
        // this.copyClientScripts()
        this.createClientBundle()
    }
    private setupRouter() {
        log.debug('Initializing router...')

        this.router = getRouter({
            pageHandler: this.pageHandler || this.devPageHandler,
            isProd: this.options.isProd,
            staticDirectory: this.staticDirectory,
        })

        this.router.listen()
        log.debug('Router initialized')
    }

    private get pageDirectory() {
        return path.resolve(__clientDir, this.options.pagesDirectory)
    }

    private get buildDirectory() {
        return path.resolve(__clientDir, this.options.buildDirectory)
    }

    private get publicDirectory() {
        return path.resolve(__clientDir, this.options.publicDirectory)
    }

    private get staticDirectory() {
        return path.resolve(this.buildDirectory, 'static')
    }

    private get serverDirectory() {
        return path.resolve(this.buildDirectory, 'server')
    }

    private get host() {
        return 'http://localhost:3000'
    }

    createBuildDirectory() {
        if (fs.existsSync(this.buildDirectory)) {
            log.debug('Removing existing build output')
            fs.rmSync(this.buildDirectory, {
                recursive: true,
                force: true,
            })
        }
        fs.mkdirSync(this.buildDirectory)
        fs.mkdirSync(this.staticDirectory)
        fs.mkdirSync(this.serverDirectory)
    }

    copyPublicDirectory() {
        log.debug(
            `Copying public assets from ${this.publicDirectory} to ${this.staticDirectory}`
        )
        fs.readdirSync(this.publicDirectory).forEach((file) => {
            fs.copyFileSync(
                path.resolve(this.publicDirectory, file),
                path.resolve(this.staticDirectory, file)
            )
        })
    }

    copyClientScripts() {
        log.debug(`Copying client.js to ${this.buildDirectory}`)
        fs.copyFileSync(
            path.resolve(__dirname, 'client.js'),
            path.resolve(this.staticDirectory, 'client.js')
        )
    }

    createClientBundle() {
        return esbuild
            .build({
                bundle: true,
                format: 'iife',
                loader: loaders,
                jsx: 'automatic',
                treeShaking: true,
                platform: 'browser',
                outdir: this.staticDirectory,
                publicPath: '/__pleb/static',
                tsconfig: __dirname + '/tsconfig.json',
                mainFields: ['browser', 'module', 'main'],
                entryPoints: [path.resolve(__dirname, 'client.js')],
                external: ['react', 'react-dom', 'path', './utils/log'],
            })
            .catch((err) => log.error(`Error compiling page: ${err}`))
    }

    async compilePage(path: string, file: string) {
        return esbuild
            .build({
                entryPoints: [path],
                bundle: true,
                outfile: `${this.staticDirectory}/${file.replace(
                    /tsx|ts/,
                    'js'
                )}`,
                tsconfig: __dirname + '/tsconfig.json',
                external: ['react', 'react-dom'],
                jsx: 'automatic',
                format: 'iife',
                target: 'es2020',
            })
            .catch((err) => log.error(`Error compiling page: ${err}`))
    }

    async compileSSRPage(path: string, file: string) {
        return esbuild
            .build({
                entryPoints: [path],
                bundle: true,
                outfile: `${this.serverDirectory}/${file.replace(
                    /tsx|ts/,
                    'js'
                )}`,
                tsconfig: __dirname + '/tsconfig.json',
                external: ['react', 'react-dom'],
                jsx: 'automatic',
                format: 'esm',
                target: 'es2020',
            })
            .catch((err) => log.error(`Error compiling page: ${err}`))
    }

    async buildStaticPages() {
        if (!fs.existsSync(this.pageDirectory)) {
            log.warn(`No 'pages' directory found at ${this.pageDirectory}`)
            this.exit()
        }

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

            await Promise.all([
                this.compilePage(pagePath, page),
                this.compileSSRPage(pagePath, page),
            ])

            const renderStream = render(slug, {
                onShellError: log.error,
                onError: log.error,
                onAllReady() {
                    const outFile = fs.createWriteStream(
                        path.resolve(buildDirectory, htmlPage)
                    )
                    renderStream.pipe(outFile)
                },
            })
            buildManifest.pages[slug] = {
                markup: htmlPage,
                script: page,
            }

            fs.copyFileSync(pagePath, path.resolve(this.buildDirectory, page))
        }

        fs.writeFileSync(
            path.resolve(this.staticDirectory, 'buildManifest.json'),
            JSON.stringify(buildManifest)
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

    private devPageHandler = async (req: Request, res: Response) => {
        try {
            const { slug, pagePath } = this.getPagePathFromRequest(req)
            log.debug(`${req.method.toUpperCase()}: ${slug} ${req.originalUrl}`)
            if (!fs.existsSync(pagePath)) return res.status(404).end()
            const renderStream = render(slug, {
                onShellReady() {},
                onShellError(error) {
                    log.error(error)
                    res.statusCode = 500
                    res.send('<!doctype html><p>Loading...</p>')
                },
                onAllReady() {
                    res.statusCode = 200
                    res.setHeader('Content-type', 'text/html; charset=UTF-8')
                    renderStream.pipe(res)
                },
                onError(err) {
                    console.error(err)
                },
            })
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
