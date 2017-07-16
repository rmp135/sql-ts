import Table from './Table'

const types = {
  number: ['int', 'numeric', 'integer', 'real', 'smallint', 'decimal', 'float', 'double precision', 'double', 'dec', 'fixed', 'year', 'serial', 'bigserial'],
  Date: ['datetime', 'timestamp', 'date', 'time', 'timestamp'],
  boolean: ['bit', 'boolean', 'bool'],
  Object: ['json']
}

export default class {
  /**
   * The name of this Column.
   * 
   * @type {string}
   */
  name: string
  /**
   * Whether this Column is nullable.
   * 
   * @type {boolean}
   */
  nullable: boolean
  /**
   * The type of this Column, as dictated in the database schema.
   * 
   * @type {string}
   */
  type: string
  /**
   * The Table that this Column belongs to.
   * 
   * @type {Table}
   */
  jsType: string 
  /**
   * A representation of a database column.
   * 
   * @param name     The name of this table.
   * @param nullable Whether this column is nullable.
   * @param type     The type of this column, as retrieved from the database schema.
   * @param table    The Table that this column belongs to.
   */
  constructor (name: string, nullable: boolean, type: string, table: Table) {
    this.name = name
    this.nullable = nullable
    this.type = type
    const overrides = table.database.config.typeOverrides || {}
    const fullName = `${table.name}.${this.name}`
    let convertedType = undefined
    if (overrides[fullName] != null) {
      convertedType = overrides[fullName]
    } else {
      convertedType = Object.keys(types).find(t => types[t].includes(this.type))
    }
    this.jsType = convertedType === undefined ? 'string' : convertedType
  }
  /**
   * This Column as a TypeScript type definition.
   * 
   * @returns {string} 
   */
  stringify (): string {
    return `${this.name}?: ${this.jsType}${this.nullable ? ' | null' : ''}`
  }
  /**
   * This Column as a plain JavaScript object. 
   * 
   * @returns
   */
  toObject () {
    return {
      name: this.name,
      type: this.type,
      jsType: this.jsType,
      nullable: this.nullable
    }
  }
}
