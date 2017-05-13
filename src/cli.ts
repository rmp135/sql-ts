import * as knex from 'knex'
import { buildDatabase } from './DatabaseFactory'
import * as fs from 'fs'
import * as yargs from 'yargs'
import * as path from 'path'
import sqlts, { Config } from './index'

const args = yargs(process.argv)
.alias('c', 'config')
.describe('c', 'Config file.')
.demandOption(['c'])
.argv

const configPath = path.join(process.cwd(), args.config) 

const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Config

const db = knex(config)

;(async () => {
  try {
    const asString = await sqlts.generate(config)
    const outFile = path.join(process.cwd(), 'Database.ts')
    fs.writeFileSync(outFile, asString)
    console.log(`Definition file written as ${outFile}.`)
  }
  catch (err) {
    throw err
  }
  finally {
    db.destroy()
  }
})()
