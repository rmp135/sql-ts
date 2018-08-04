import { Config, Database, Table } from './Typings';
import * as TableTasks from './TableTasks';
import * as handlebars from 'handlebars'
import * as _ from 'lodash'
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
export function stringifyDatabase (database: Database, config: Config) {
  let template = fs.readFileSync(path.join(__dirname, './template.handlebars'), 'utf-8')
  if (config.template !== undefined)
    template = fs.readFileSync(config.template, 'utf-8')
  const compiler = handlebars.compile(template)
  const tables = database.tables.map(t => {
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
  const grouped = _.groupBy(tables, t => t.schema)
  return compiler({ grouped, tables, config })
}