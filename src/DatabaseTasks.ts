import { Config, Database, EnumTable, Table } from './Typings';
import * as TableTasks from './TableTasks';
import * as EnumTasks from './EnumTasks'

/**
 * Converts a Database definition to TypeScript.
 * 
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns A TypeScript definiion, optionally wrapped in a namespace.
 */
export function stringifyDatabase (database: Database, config: Config) {
  if (config.schemaAsNamespace) {
    const schemaMap = new Map<string, { tables: Table[], enums: EnumTable[] }>()
    for (let table of database.tables) {
      if (!schemaMap.has(table.schema)) {
        schemaMap.set(table.schema, { tables: [], enums: []})
      }
      schemaMap.get(table.schema).tables.push(table)
    }
    for (let enumDefinition of database.enums) {
      if (!schemaMap.has(enumDefinition.schema)) {
        schemaMap.set(enumDefinition.schema, { tables: [], enums: []})
      }
      schemaMap.get(enumDefinition.schema).enums.push(enumDefinition)
    }
    const namespaces: string[] = []
    schemaMap.forEach((map, schema) => {
      namespaces.push(`export namespace ${schema} {
${map.tables.map(t => TableTasks.stringifyTable(t, config).replace(/^(.+)/gm, '  $1')).join('\n\n')}

${map.enums.map(e => EnumTasks.stringifyEnum(e, config).replace(/^(.+)/gm, '  $1')).join('\n\n')}
}`)
    })
    return namespaces.join('\n\n')
  } else {
    return `${database.tables.map(t => TableTasks.stringifyTable(t, config)).join('\n\n')}

${database.enums.map(e => EnumTasks.stringifyEnum(e, config)).join('\n\n')}`
  }
}