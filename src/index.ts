import * as knex from 'knex'
import { buildDatabase } from './DatabaseFactory'
import { Config } from './Typings'

async function generate (config: Config): Promise<String> {
  const db = knex(config)
  let asString = ''
  try {
    const database = await buildDatabase(db, config)
    asString = database.stringify()
  }
  catch (err) {
    throw err
  }
  finally {
    db.destroy()
  }
  return asString
}

export default {
  generate
}

export {
  generate,
  Config
}