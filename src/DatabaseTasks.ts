import { Config, Database, Table, Enum } from './Typings'
import * as handlebars from 'handlebars'
import * as fs from 'fs'

interface Template {
  [key:string]: {
    tables: Table[]
    enums: Enum[]
  }
}

/**
 * Converts a Database definition to TypeScript.
 * 
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns A TypeScript definition, optionally wrapped in a namespace.
 */
export function stringifyDatabase (database: Database, config: Config): string {
  const templateString = fs.readFileSync(config.template, 'utf-8')
  const compiler = handlebars.compile(templateString)
  database.tables.sort((tableA, tableB) => tableA.name.localeCompare(tableB.name))
  database.enums.sort((enumA, enumB) => enumB.name.localeCompare(enumA.name))
  const template: Template = {}
  for (let table of database.tables) {
    if (template[table.schema] === undefined) {
      template[table.schema] = { tables: [], enums: [] }
    }
    template[table.schema].tables.push(table)
  }
  for (let enumm of database.enums) {
    if (template[enumm.schema] === undefined) {
      template[enumm.schema] = { tables: [], enums: [] }
    }
    template[enumm.schema].enums.push(enumm)
  }
  return compiler({
    grouped: template,
    config
  })
}
