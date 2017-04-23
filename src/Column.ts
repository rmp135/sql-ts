import Table from './Table'

const types = {
  number: ['int', 'numeric', 'integer', 'real', 'smallint', 'decimal', 'float', 'double precision', 'double', 'dec', 'fixed', 'year', 'serial', 'bigserial'],
  Date: ['datetime', 'timestamp', 'date', 'time', 'timestamp'],
  boolean: ['bit', 'boolean', 'bool'],
  Object: ['json']
}

export default class {
  name: string
  nullable: boolean
  type: string
  table: Table
  constructor (name: string, nullable: boolean, type: string, table: Table) {
    this.name = name
    this.nullable = nullable
    this.type = type
    this.table = table
  }
  nullableString () {
    return this.nullable ? ' | null' : ''
  }
  convertType (): string {
    const overrides = this.table.database.config.typeOverrides || {}
    const fullName = `${this.table.name}.${this.name}`
    let type = undefined
    if (overrides[fullName] != null) {
      type = overrides[fullName]
    } else {
      type = Object.keys(types).find(t => types[t].includes(this.type))
    }
    if (type == null) {
      return 'string'
    } else {
      return type
    }
  }
  stringify (): string {
    return `${this.name}?: ${this.convertType()}${this.nullableString()}`
  }
}
