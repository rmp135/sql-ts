import { Knex } from 'knex'
import * as AdapterFactory from './AdapterFactory.js'
import { Config, Enum } from './Typings.js'
import * as SharedTasks from './SharedTasks.js'
import * as SchemaTasks from './SchemaTasks.js'

export async function getAllEnums(db: Knex, config: Config): Promise<Enum[]> {
  const adapter = AdapterFactory.buildAdapter(db.client.dialect)
  return (await adapter.getAllEnums(db, config))
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map(e => ({
      name: e.name,
      schema: SchemaTasks.generateSchemaName(e.schema),
      convertedName: generateEnumName(e.name, config),
      values: Object.keys(e.values).toSorted((a, b) => a.localeCompare(b)).map(ee => ({
        originalKey: ee,
        convertedKey: generateEnumKey(ee, config),
        value: e.values[ee]
      }))
    }))
}

/**
 * Generates an enum name, removing invalid characters.
 * 
 * @export
 * @param {string} name The name of the enum.
 * @param {Config} config The configuration to use.
 * @returns 
 */
export function generateEnumName(name: string, config: Config): string {
  let newName =  name
    .replace(/\W/g, '')
    .replace(/^\d+/g, '')
  newName = SharedTasks.convertCase(newName, config.enumNameCasing)
  return config.enumNameFormat.replace('${name}', newName)
}

/**
 * Generates an enum name, removing invalid characters.
 * 
 * @export
 * @param {string} name The name of the enum.
 * @param {Config} config The configuration to use.
 * @returns 
 */
export function generateEnumKey(name: string, config: Config): string {
  const newKey = SharedTasks.convertCase(name, config.enumKeyCasing)
  // Numeric keys are not allowed and must be converted to a suitable format.
  return isNaN(Number(newKey)) ? newKey : config.enumNumericKeyFormat.replace('${key}', newKey)
}
