import * as AdapterFactory from './AdapterFactory';
import * as knex from 'knex';
import { Column, Config, EnumTable, Table } from './Typings';
import * as EnumSubTasks from './EnumSubTasks'

/**
 * Retrieves enum data for all tables given specified in the configuration.
 * 
 * @export
 * @param {knex} db The knex context to use.
 * @param {Config} config The configuration to use.
 * @returns All enum data as specified in the config.
 */
export async function getAllEnumTables(db: knex, config: Config) {
  const enumTables = config.enumTables || {}
  const adapter = AdapterFactory.buildAdapter(config.dialect)
  const allEnums = 
    await Promise.all(Object.keys(enumTables)
      .map(schema => {
        return Object.keys(enumTables[schema])
          .map(async table => await adapter.getEnumsForTable(db, schema, table, 'id', enumTables[schema][table]))
  })
  .reduce((a1, a2) => a1.concat(a2)))
  return allEnums.map(enumDefinition => ({
    table: enumDefinition.table,
    schema: enumDefinition.schema,
    enums: enumDefinition.enums.map(e => ({ id: e.id, value: e.value.replace(/\W/g, '') }))
  }))
}

/**
 * Converts given enum data into a TypeScript enum type.
 * 
 * @export
 * @param {EnumTable} enumDefinition The enumeration data from a table.
 * @param {Config} config The configuration specifying stringification options.
 * @returns The TypeScript enum type as a string.
 */
export function stringifyEnum(enumDefinition: EnumTable, config: Config) {
  return `enum ${EnumSubTasks.generateEnumName(enumDefinition.table, config)} {\n  ${enumDefinition.enums.map(e => `${e.value} = ${e.id}`).join(',\n  ')}\n}`
}
