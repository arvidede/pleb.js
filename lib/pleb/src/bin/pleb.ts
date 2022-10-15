#!/usr/bin/env node --no-warnings --experimental-specifier-resolution=node
import { program } from 'commander'
import { warn } from '../utils/log'
import dev from '../cli/dev'
import start from '../cli/start'
import { createRequire } from 'module'
const __require =
    typeof require === 'undefined' ? createRequire(import.meta.url) : require

;['react', 'react-dom'].forEach((dependency) => {
    try {
        __require.resolve(dependency)
    } catch (err) {
        warn(`Install ${dependency} you pleb`)
    }
})

program
    .name('pleb-cli')
    .description('CLI to run pleb.js applications')
    .version('0.0.1')

program
    .command('dev')
    .description('Run server in development')
    .option('-v, --verbose', 'verbose', true)
    .option('-e, --entry <entry>', 'entry point', 'src/index.ts')
    .action(dev)

program
    .command('start')
    .description('Run server in production')
    .option('-v, --verbose', 'verbose', true)
    .option('-e, --entry <entry>', 'entry point', 'src/index.ts')
    .action(start)

program.parse(process.argv)
