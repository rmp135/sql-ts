import * as knex from 'knex'
import { buildDatabase } from './DatabaseFactory'
import * as fs from 'fs'

const config = require('../config.json') as Config

export interface Config extends knex.Config {
  tables?: string[],
  typeOverrides?: {
    [key: string]: string
  }
}

;(async () => {
  const db = knex(config)
  try {
    const database = await buildDatabase(db, config)
    const a = database.stringify()
    fs.writeFileSync('Database.ts', a)
    console.log(a)
  } catch (error) {
    console.log(error)
  } finally {
    await db.destroy()
  }
})()