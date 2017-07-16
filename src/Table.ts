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
   * A representation of a Database Table.
   * 
   * @param name     The name of the Table.
   * @param database The Database that this Table belongs to.
   */
  constructor (name: string, database: Database) {
    this.name = name
    this.database = database
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
  /**
   * This Table as an exported TypeScript interface definition.
   * Contains all Columns as types.
   * 
   * @returns {string} 
   */
  stringify (): string {
    return `export interface ${this.name.replace(' ', '_')}Entity {
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
