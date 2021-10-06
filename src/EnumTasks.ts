import * as AdapterFactory from './AdapterFactory'
import { Knex } from 'knex'
import { Config, Enum } from './Typings'
import * as SharedTasks from './SharedTasks'
import * as SchemaTasks from './SchemaTasks'

export async function getAllEnums (db: Knex, config: Config): Promise<Enum[]> {
  const adapter = AdapterFactory.buildAdapter(db.client.dialect)
  const allEnums = (await adapter.getAllEnums(db, config))
  return allEnums.map(e => ({
    name: e.name,
    schema: SchemaTasks.generateSchemaName(e.schema),
    convertedName: generateEnumName(e.name, config),
    values: Object.keys(e.values).map(ee => ({
      originalKey: ee,
      convertedKey: SharedTasks.convertCase(ee, config.enumKeyCasing),
      value: e.values[ee]
    }))
  } as Enum))
}

/**
 * Generates an enum name, removing invalid characters.
 * 
 * @export
 * @param {string} name The name of the enum.
 * @param {Config} config The configuration to use.
 * @returns 
 */
export function generateEnumName (name: string, config: Config): string {
  const newName =  name
    .replace(/\W/g, '')
    .replace(/^\d+/g, '')
  return SharedTasks.convertCase(newName, config.enumNameCasing)
}
