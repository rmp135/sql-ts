import Column from './Column'
import Database from './Database'

export default class {
  name: string
  columns: Column[] = []
  database: Database
  constructor (name: string, database: Database) {
    this.name = name
    this.database = database
  }
  async generateColumns () {
    const def = await this.database.db(this.name).columnInfo()
    for (let key in def) {
      const value = def[key]
      this.columns.push(new Column(key, value.nullable, value.type, this))
    }
  }
  stringify (): string {
    return `export interface ${this.name.replace(' ', '_')}Entity {
${this.columns.map(c => '  ' + c.stringify()).join('\n')}
}`
  }
}
