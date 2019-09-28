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

/**
 * Converts the casing of the table name.
 *
 * @export
 * @param {string} tableName The name of the table.
 * @param {string} caseType The case type to convert the table name into.
 * @returns The converted table name.
 */
export function convertTableCase (tableName: string, caseType: string) {
  const tempName = tableName.split('_').map(s => {
    if (s.length === 0) return s
    return s[0].toUpperCase() + s.substr(1).toLowerCase()
  }).join('')
  if (caseType == 'pascal') {
    return tempName
  }
  else if (caseType == 'camel') {
    return tempName[0].toLowerCase() + tempName.substr(1)
  }
  else if (caseType == null) { }
  else {
    console.warn(`Config option tableNameCasing was supplied with invalid value "${caseType}".`)
  }
  return tableName
}