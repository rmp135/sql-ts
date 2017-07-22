import { buildAdapter } from './AdapterFactory';
import * as knex from 'knex';
import { Config } from './Typings';
import Column from './Column'
import Database from './Database'

export default class {
  /**
   * The name of this Table.
   * 
   * @type {string}
   */
  name: string
  /**
   * The Columns that this Table contains.
   * 
   * @type {Column[]}
   */
  schema: string

  columns: Column[] = []
  /**
   * The Database that this Table belongs to.
   * 
   * @type {Database}
   */
  database: Database
  /**
   * The name of the interface that will be generated from this table.
   * 
   * @type {string}
   */
  interfaceName: string
  /**
   * A representation of a Database Table.
   * 
   * @param name     The name of the Table.
   * @param database The Database that this Table belongs to.
   */
  constructor (name: string, schema: string, config: Config) {
    this.name = name
    this.schema = schema
    const interfaceNamePattern = config.interfaceNameFormat || '${table}Entity'
    this.interfaceName = interfaceNamePattern.replace('${table}', this.name.replace(' ', '_'))
  }
  /**
   * Queries the database and generates the Column definitions for this table.
   * 
   */
  async generateColumns (db: knex, config: Config) {
    const adapter = buildAdapter(config.dialect)
    const columns = await adapter.getAllColumns(db, this.name, this.schema)
    columns.forEach(c => this.columns.push(new Column(c.name, c.isNullable, c.type, this, config)))
  }
  /**
   * This Table as an exported TypeScript interface definition.
   * Contains all Columns as types.
   * 
   * @returns {string} 
   */
  stringify (includeSchema: boolean = false): string {
    const schemaSpaces = includeSchema ? '  ' : ''
    return `${schemaSpaces}export interface ${this.interfaceName} {
${this.columns.map(c => `${schemaSpaces}  ` + c.stringify()).join('\n')}
${schemaSpaces}}`
  }
  /**
   * This Table as a plain JavaScript object.
   * 
   * @returns
   */
  toObject () {
    return {
      name: this.name,
      schema: this.schema,
      columns: this.columns.map(c => c.toObject())
    }
  }
}
