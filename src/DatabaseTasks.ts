import { Config, Database, Table } from './Typings';
import * as TableTasks from './TableTasks';

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
    const schemaMap = new Map<string, Table[]>()
    for (let table of database.tables) {
      if (!schemaMap.has(table.schema)) {
        schemaMap.set(table.schema, [])
      }
      schemaMap.get(table.schema).push(table)
    }
    const namespaces: string[] = []
    schemaMap.forEach((tables, schema) => {
      namespaces.push(`export namespace ${schema} {
${tables.map(t => TableTasks.stringifyTable(t, config).replace(/^(.+)/gm, '  $1')).join('\n\n')}
}`)
    })
    return namespaces.join('\n\n')
  } else {
    return database.tables.map(t => TableTasks.stringifyTable(t, config)).join('\n\n')
  }
}