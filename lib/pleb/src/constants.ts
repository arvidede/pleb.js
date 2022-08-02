import path from 'path'

export const isSSR = typeof window === 'undefined'
export const __filename = new URL('', import.meta.url).pathname
export const __dirname = new URL('.', import.meta.url).pathname
export const __clientDir = isSSR ? process.env.PWD! : '/'
export const __clientPagesDir = path.resolve(__clientDir, 'pages') // TODO: from config
export const __clientBuildDir = path.resolve(__clientDir, '.pleb') // TODO: from config

console.log({
    __filename,
    __dirname,
    __clientDir,
    __clientBuildDir,
    __clientPagesDir,
})
