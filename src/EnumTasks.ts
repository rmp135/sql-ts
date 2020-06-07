import * as AdapterFactory from './AdapterFactory'
import * as knex from 'knex'
import { Config, Enum } from './Typings'

export async function getAllEnums (db: knex, config: Config): Promise<Enum[]> {
  const adapter = AdapterFactory.buildAdapter(config)
  const allEnums = (await adapter.getAllEnums(db, config))
  return allEnums.map(e => ({
    name: e.name,
    schema: e.schema,
    values: e.values
  } as Enum))
}