import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { getConfig } from './webpack.config.js'
import webpackDevMiddleware from 'webpack-dev-middleware'
import { info } from '../utils/log'

let server: WebpackDevServer
export function getDevServer() {
    if (!server) {
        const webpackConfig = getConfig('server')
        const compiler = webpack(webpackConfig)
        const devServerOptions = {
            ...webpackConfig.devServer, // serverConfig
            open: true,
        }
        server = new WebpackDevServer(devServerOptions, compiler)
    }
    return server
}

export function getDevMiddleware() {
    const webpackConfig = getConfig('client')
    const compiler = webpack(webpackConfig, () => {
        info('Yay webpack')
    })
    return webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output?.publicPath,
    })
}
