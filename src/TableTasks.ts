import { Knex } from 'knex'
import * as AdapterFactory from './AdapterFactory.js'
import { Config, Table } from './Typings.js'
import * as ColumnTasks from './ColumnTasks.js'
import * as SharedTasks from './SharedTasks.js'
import * as SchemaTasks from './SchemaTasks.js'
import pluralize from 'pluralize'

/**
 * Returns all tables from a given database filtered by configuration options.
 * 
 * @export
 * @param {knex} db The knex context to use.
 * @param {Config} config The configuration to use.
 * @returns {Promise<Table[]>} 
 */
export async function getAllTables(db: Knex, config: Config): Promise<Table[]> {
  const adapter = AdapterFactory.buildAdapter(db.client.dialect)
  const allTables = (await adapter.getAllTables(db, config.schemas))
    .filter(table => config.tables.length === 0 || config.tables.includes(`${table.schema}.${table.name}`))
    .filter(table => !config.excludedTables.includes(`${table.schema}.${table.name}`))
    .sort((a, b) => a.name.localeCompare(b.name))
  return await Promise.all(allTables.map(async table => ({
    columns: await ColumnTasks.getColumnsForTable(db, table, config),
    interfaceName: generateInterfaceName(table.name, config),
    name: table.name,
    schema: SchemaTasks.generateSchemaName(table.schema),
    additionalProperties: getAdditionalProperties(table.name, table.schema, config),
    extends: getExtends(table.name, table.schema, config),
    comment: table.comment
  } as Table)))
}

/**
 * Returns the additional properties to add to the interface.
 * 
 * @export
 * @param {string} tableName The name of the table.
 * @param {string} schemaName The schema of the table.
 * @param {Config} config The configuration to use.
 */
 export function getAdditionalProperties(tableName: string, schemaName: string, config: Config): string[] {
  const fullName = `${schemaName}.${tableName}`
  return config.additionalProperties[fullName] ?? []
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
export function getExtends(tableName: string, schemaName: string, config: Config): string {
  const fullName = `${schemaName}.${tableName}`
  if (config.extends === undefined) return ''
  return config.extends[fullName]
}

/**
 * Converts a table name to an interface name given a configuration.
 * 
 * @export
 * @param {string} name The name of the table.
 * @param {Config} config The configuration to use.
 * @returns 
 */
 export function generateInterfaceName(name: string, config: Config): string {
  name = name.replace(/ /g, '_')
  name = SharedTasks.convertCase(name, config.tableNameCasing)
  if (config.singularTableNames) {
    name = pluralize.singular(name)
  }
  return config.interfaceNameFormat.replace('${table}', name)
}
