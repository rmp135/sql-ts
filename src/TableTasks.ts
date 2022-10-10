import * as AdapterFactory from './AdapterFactory'
import { Knex } from 'knex'
import { Config, Table } from './Typings'
import * as ColumnTasks from './ColumnTasks'
import * as TableTasks from './TableTasks'
import * as SharedTasks from './SharedTasks'
import * as SchemaTasks from './SchemaTasks'

/**
 * Returns all tables from a given database using a configuration.
 * 
 * @export
 * @param {knex} db The knex context to use.
 * @param {Config} config The configuration to use.
 * @returns {Promise<Table[]>} 
 */
export async function getAllTables (db: Knex, config: Config): Promise<Table[]> {
  const tables = config.tables
  const excludedTables = config.excludedTables
  const schemas = config.schemas
  const adapter = AdapterFactory.buildAdapter(db.client.dialect)
  const allTables = (await adapter.getAllTables(db, schemas))
    .filter(table => tables.length == 0 || tables.includes(`${table.schema}.${table.name}`))
    .filter(table => {
      if (Array.isArray(excludedTables)) {
        return !excludedTables.includes(`${table.schema}.${table.name}`)
      } else if(typeof excludedTables === 'function') {
        return !excludedTables(table)
      }
    })

  return await Promise.all(allTables.map(async table => ({
    columns: await ColumnTasks.getColumnsForTable(db, table, config),
    interfaceName: TableTasks.generateInterfaceName(table.name, config),
    name: table.name,
    schema: SchemaTasks.generateSchemaName(table.schema),
    additionalProperties: TableTasks.getAdditionalProperties(table.name, table.schema, config),
    extends: TableTasks.getExtends(table.name, table.schema, config),
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
 export function getAdditionalProperties (tableName: string, schemaName: string, config: Config): string[] {
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
export function getExtends (tableName: string, schemaName: string, config: Config): string {
  const fullName = `${schemaName}.${tableName}`
  if (config.extends === undefined) return ""
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
 export function generateInterfaceName (name: string, config: Config): string {
  const interfaceNamePattern = config.interfaceNameFormat
  name = name.replace(/ /g, '_')
  name = SharedTasks.convertCase(name, config.tableNameCasing)
  if (config.singularTableNames) {
    if(name.match(/ies$/)) {
     name = name.replace(/ies$/, 'y')
    } else if(name[name.length - 1] == "s") {
      name = name.substr(0, name.length - 1)
    }
  }
  return interfaceNamePattern.replace('${table}', name)
}
