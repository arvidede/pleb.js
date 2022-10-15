import path from 'path'
import getLogger from './utils/log'
import type { Loader } from 'esbuild'

const log = getLogger()

export const isSSR = typeof window === 'undefined'
export const __filename = new URL('', import.meta.url).pathname
export const __dirname = new URL('.', import.meta.url).pathname
export const __clientDir = isSSR ? process.env.PWD! : '/'
export const __clientPagesDir = path.resolve(__clientDir, 'pages') // TODO: from config
export const __clientBuildDir = path.resolve(__clientDir, '.pleb') // TODO: from config
export const __clientStaticDir = path.resolve(__clientBuildDir, 'static')
export const __clientServerDir = path.resolve(__clientBuildDir, 'server')

log.debug({
    __filename,
    __dirname,
    __clientDir,
    __clientBuildDir,
    __clientPagesDir,
    __clientStaticDir,
    __clientServerDir,
})

export const loaders: { [ext: string]: Loader } = {
    '.aac': 'file',
    '.avif': 'file',
    '.css': 'file',
    '.eot': 'file',
    '.flac': 'file',
    '.gif': 'file',
    '.gql': 'text',
    '.graphql': 'text',
    '.ico': 'file',
    '.jpeg': 'file',
    '.jpg': 'file',
    '.js': 'jsx',
    '.jsx': 'jsx',
    '.json': 'json',
    '.md': 'jsx',
    '.mdx': 'jsx',
    '.mp3': 'file',
    '.mp4': 'file',
    '.ogg': 'file',
    '.otf': 'file',
    '.png': 'file',
    '.sql': 'text',
    '.svg': 'file',
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.ttf': 'file',
    '.wav': 'file',
    '.webm': 'file',
    '.webmanifest': 'file',
    '.webp': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.zip': 'file',
}
