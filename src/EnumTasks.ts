import * as AdapterFactory from './AdapterFactory'
import { Knex } from 'knex'
import { Config, Enum } from './Typings'
import * as SharedTasks from './SharedTasks'
import * as EnumTasks from './EnumTasks'

export async function getAllEnums (db: Knex, config: Config): Promise<Enum[]> {
  const adapter = AdapterFactory.buildAdapter(config)
  const allEnums = (await adapter.getAllEnums(db, config))
  return allEnums.map(e => ({
    name: e.name,
    schema: e.schema,
    convertedName: EnumTasks.generateEnumName(e.name, config),
    values: Object.keys(e.values).map(ee => ({
      originalKey: ee,
      convertedKey: ee.replace(/ /g, ''),
      value: e.values[ee]
    }))
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
