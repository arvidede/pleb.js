import path from 'path'
import { fileURLToPath } from 'url'

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.resolve(path.dirname(__filename), '..')
export const __clientDir = process.env.PWD!

console.log({ __filename, __dirname, __clientDir })
