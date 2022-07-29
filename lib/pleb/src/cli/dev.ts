import createServer, { ServerOptions } from '../server'

interface Args {
    entry: string
}

const action = (arg: Args) => {
    const options: ServerOptions = {
        buildDirectory: './.pleb', // TODO: Get from config
        pagesDirectory: './pages', // TODO: Get from config
        isProd: false,
    }
    createServer(options)
}

export default action
