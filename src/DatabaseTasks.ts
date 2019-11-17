import { Config, Database, Table, DecoratedDatabase } from './Typings';
import * as TableTasks from './TableTasks';
import * as handlebars from 'handlebars'
import * as fs from 'fs'
import * as path from 'path'
import * as ColumnTasks from './ColumnTasks';

/**
 * Converts a Database definition to TypeScript.
 * 
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns A TypeScript definition, optionally wrapped in a namespace.
 */
export function stringifyDatabase (database: Database, config: Config): string {
  let template = fs.readFileSync(path.join(__dirname, './template.handlebars'), 'utf-8')
  if (config.template !== undefined)
    template = fs.readFileSync(config.template, 'utf-8')
  const compiler = handlebars.compile(template)
  database.tables.sort((tableA, tableB) => tableA.name.localeCompare(tableB.name));
  const grouped : {[key:string]: Table[]} = {}
  for (let t of database.tables) {
    if (grouped[t.schema] === undefined) {
      grouped[t.schema] = []
    }
    grouped[t.schema].push(t)
  }
  return compiler({ grouped, tables: database.tables, config })
}

/**
 * Decorates the database object before sending to template compiler.
 *
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns The decorated database definition.
 */
export function decorateDatabase(database: Database, config: Config): DecoratedDatabase {
  return {
    tables: database.tables.map(t => {
      return {
        ...t,
        interfaceName: TableTasks.generateInterfaceName(t.name, config),
        columns: t.columns.map(c => {
          return {
            ...c,
            propertyName: c.name.replace(/ /g,''),
            propertyType: ColumnTasks.convertType(t.name, t.schema, c.name, c.type, config)
          }
        })
      }
    })  
  }
}