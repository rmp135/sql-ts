import { Config } from './Typings'

/**
 * Returns the additional properties to add to the interface.
 * 
 * @export
 * @param {string} tableName The name of the table.
 * @param {string} schemaName The schema of the table.
 * @param {Config} config The configuration to use.
 */
export function getAdditionalProperties (tableName: string, schemaName: string, config: Config): string[] {
  const fullName = `${schemaName}.${tableName}`
  if (config.additionalProperties === undefined) return []
  return config.additionalProperties[fullName]
}

/**
 * Returns any extension that should be applied to the interface.
 *
 * @export
 * @param {string} tableName
 * @param {string} schemaName
 * @param {Config} config
 * @returns {string}
 */
export function getExtends (tableName: string, schemaName: string, config: Config): string {
  const fullName = `${schemaName}.${tableName}`
  if (config.extends === undefined) return ""
  return config.extends[fullName]
}