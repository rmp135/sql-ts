import * as AdapterFactory from './AdapterFactory'
import * as knex from 'knex'
import { Config, Enum } from './Typings'
import * as SharedTasks from './SharedTasks'

export async function getAllEnums (db: knex, config: Config): Promise<Enum[]> {
  const adapter = AdapterFactory.buildAdapter(config)
  const allEnums = (await adapter.getAllEnums(db, config))
  return allEnums.map(e => ({
    name: e.name,
    schema: e.schema,
    values: e.values
  } as Enum))
}

/**
 * Converts an db enum name to an enum name given a configuration.
 * 
 * @export
 * @param {string} name The name of the enum.
 * @param {Config} config The configuration to use.
 * @returns 
 */
export function generateEnumName (name: string, config: Config): string {
  name = name.replace(/ /g, '')
  return SharedTasks.convertCase(name, config.enumNameCasing)
}
