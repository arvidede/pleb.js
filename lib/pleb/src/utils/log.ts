import chalk from 'chalk'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'
type Logger = (message?: any, ...optionalParams: any[]) => void

const PREFIX = '[pleb] '
let currentLogLevel: LogLevel = 'warn'

const withPrefix = (message?: any) => PREFIX + message

export const info: Logger = (message, ...optionalParams) =>
    console.info(chalk.green(withPrefix(message), ...optionalParams))

export const warn: Logger = (message, ...optionalParams) =>
    console.warn(chalk.yellow(withPrefix(message), ...optionalParams))

export const error: Logger = (message, ...optionalParams) =>
    console.error(chalk.red(withPrefix(message), ...optionalParams))

export const debug: Logger = (message, ...optionalParams) =>
    console.log(chalk.blueBright(withPrefix(message), ...optionalParams))

const getLogLevel = () => {
    return currentLogLevel
}

const setLogLevel = (logLevel?: LogLevel) => {
    if (logLevel) {
        currentLogLevel = logLevel
    }
}

const mute = (logger: Logger): Logger => {
    return function (...args) {
        const logLevel = getLogLevel()
        if (logLevel === 'silent') {
            return
        }

        if (logLevel === 'debug') {
            return logger(...args)
        }

        if (logger === info && logLevel == 'info') {
            return logger(...args)
        }

        if (logger === warn && (logLevel === 'warn' || logLevel == 'info')) {
            return logger(...args)
        }

        if (logger === error && logLevel === 'error') {
            return logger(...args)
        }
    }
}

const getLogger = (logLevel?: LogLevel) => {
    setLogLevel(logLevel)
    return {
        debug: mute(debug),
        info: mute(info),
        warn: mute(warn),
        error: mute(error),
    }
}
export default getLogger
