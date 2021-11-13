import * as fs from 'fs'
import * as yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as path from 'path'
import sqlts, { Config } from './index'

const args = yargs(hideBin(process.argv))
.alias('c', 'config')
.describe('c', 'Config file.')
.demandOption(['c'])
.argv as any

const config = JSON.parse(fs.readFileSync(args.config, 'utf8')) as Config

;(async () => {
  const output = await sqlts.toTypeScript(config)
  const fileName = `${config.filename ?? 'Database'}.ts`
  const directory = config.folder ?? '.'
  const outFile = path.join(directory, fileName)
  fs.writeFileSync(outFile, output)
  console.log(`Definition file written as ${outFile}`)
})()
