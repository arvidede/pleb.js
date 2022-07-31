import path from 'path'
import nodeExternals from 'webpack-node-externals'
import HtmlWebPackPlugin from 'html-webpack-plugin'

/**
 * @type {Webpack.Configuration}
 */
const config = {
    entry: {
        server: './server.ts',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
    },
    target: 'node',
    node: {
        // Need this when working with express, otherwise the build fails
        __dirname: false, // if you don't put this is, __dirname
        __filename: false, // and __filename return blank or /
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    module: {
        rules: [
            {
                test: /\.([jt]sx?)?$/,
                use: 'swc-loader',
                exclude: /node_modules/,
            },
            {
                // Loads the javacript into html template provided.
                // Entry point is set below in HtmlWebPackPlugin in Plugins
                test: /\.html$/,
                use: [{ loader: 'html-loader' }],
            },
        ],
    },
    devServer: {},
    plugins: [
        new HtmlWebPackPlugin({
            template: './index.html',
            filename: './index.html',
            excludeChunks: ['server'],
        }),
    ],
}

export default config
