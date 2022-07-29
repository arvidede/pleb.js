import chalk from 'chalk'

const PREFIX = '[pleb] '

const withPrefix = (message?: any) => PREFIX + message

export const info = (message?: any, ...optionalParams: any[]) =>
    console.info(chalk.green(withPrefix(message), ...optionalParams))

export const warn = (message?: any, ...optionalParams: any[]) =>
    console.warn(chalk.yellow(withPrefix(message), ...optionalParams))

export const error = (message?: any, ...optionalParams: any[]) =>
    console.error(chalk.red(withPrefix(message), ...optionalParams))
