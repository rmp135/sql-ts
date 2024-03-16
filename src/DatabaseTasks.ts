import { Config, Database } from './Typings.js'
import * as TableTasks from './TableTasks.js'
import * as EnumTasks from './EnumTasks.js'
import Handlebars from 'handlebars'
import * as fs from 'fs'
import { Knex } from 'knex'

/**
 * Converts a Database definition to TypeScript.
 * 
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns A TypeScript definition, optionally wrapped in a namespace.
 */
export function convertDatabaseToTypescript(database: Database, config: Config): string {
  const templateString = fs.readFileSync(config.template, 'utf-8')
  const compiler = Handlebars.compile(templateString, { noEscape: true })
  Handlebars.registerHelper('handleNumeric', handleNumeric)
  return compiler({
    database,
    config
  })
}

/**
 * Converts a string or number into a safe string representation.
 * Used primarily for enum value generation.
 * 
 * @param value A string or number to handle.
 * @returns The string representation of the input.
 */
export function handleNumeric(value: string | number): string {
  return !isNaN(Number(value)) ? value.toString() : new Handlebars.SafeString(`'${value}'`).toString()
}

/**
 * Constructs a database by fetching the tables and enums.
 *
 * @export
 * @param {Config} config The sql-ts config to use.
 * @param {Knex} db The database context to use.
 * @returns {Promise<Database>} The constructed Database.
 */
export async function generateDatabase(config: Config, db: Knex): Promise<Database> {
  const tables = await TableTasks.getAllTables(db, config)
  const enums = await EnumTasks.getAllEnums(db, config)
  const schemas = new Set<string>(tables.map(table => table.schema))
  const database = {
    schemas: Array.from(schemas).map(schema => ({
      name: schema,
      namespaceName: schema,
      tables: tables.filter(table => table.schema === schema),
      enums: enums.filter(enumm => enumm.schema === schema)
    })),
    custom: config.custom
  }
  return database
}
