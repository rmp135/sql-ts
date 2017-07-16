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
  constructor (name: string, database: Database) {
    this.name = name
    this.database = database
    const interfaceNamePattern = database.config.interfaceNameFormat || '${table}Entity'
    this.interfaceName = interfaceNamePattern.replace('${table}', this.name.replace(' ', '_'))
  }
  /**
   * Queries the database and generates the Column definitions for this table.
   * 
   */
  async generateColumns () {
    const def = await this.database.db(this.name).columnInfo()
    for (let key in def) {
      const value = def[key]
      this.columns.push(new Column(key, value.nullable, value.type, this))
    }
  }
  safeFileName (): string {

    return ''
  }
  /**
   * This Table as an exported TypeScript interface definition.
   * Contains all Columns as types.
   * 
   * @returns {string} 
   */
  stringify (): string {
    return `export interface ${this.interfaceName} {
${this.columns.map(c => '  ' + c.stringify()).join('\n')}
}`
  }
  /**
   * This Table as a plain JavaScript object.
   * 
   * @returns
   */
  toObject () {
    return {
      name: this.name,
      columns: this.columns.map(c => c.toObject())
    }
  }
}
