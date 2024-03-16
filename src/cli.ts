import * as fs from 'fs/promises'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { Config } from './index.js'
import { Client } from './Client.js'

const args = yargs(hideBin(process.argv))
.alias('c', 'config')
.describe('c', 'Config file.')
.demandOption(['c'])
.argv as any

const config = JSON.parse(await fs.readFile(args.config, 'utf8')) as Config

const output = await Client.fromConfig(config).fetchDatabase().toTypescript()
const fileName = `${config.filename ?? 'Database'}.ts`
await fs.writeFile(fileName, output)
console.log(`Definition file written as ${fileName}`)
