import { Knex } from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'
import * as SharedAdapterTasks from './SharedAdapterTasks'

const formatDefaultValue = (value:string | null, type: string):null | number | string => {
  if (value === null) return value;

  // From https://www.sqlite.org/datatype3.html
  //
  // Note that DECIMAL(10,5) is also a valid type - this is checked in the
  // conditional below
  const numericTypes = [
    'INT',
    'INTEGER',
    'TINYINT',
    'SMALLINT',
    'MEDIUMINT',
    'BIGINT',
    'UNSIGNED BIG INT',
    'INT2',
    'INT8',
    'REAL',
    'DOUBLE',
    'DOUBLE PRECISION',
    'FLOAT',
    'NUMERIC',
    'BOOLEAN',
    'DATE',
    'DATETIME',
  ];

  // SQLite default values are always surrounded by quote - eg `"3"` (for
  // numeric value 3) or `"example"` (for string `example`). So here we remove
  // the quotes, but to safe we check that they are actually present.
  if (value.length && value[0] === '"') value = value.substr(1);
  if (value.length && value[value.length - 1] === '"') value = value.substr(0, value.length - 1);

  type = type.toUpperCase();

  if (numericTypes.includes(type) || type.startsWith('DECIMAL')) {
    return Number(value);
  } else {
    return value;
  }
}

export default class implements AdapterInterface {
  async getAllEnums(db: Knex, config: Config): Promise<EnumDefinition[]> {
    return await SharedAdapterTasks.getTableEnums(db, config)
  }

  async getAllTables(db: Knex, schemas: string[]): Promise<TableDefinition[]> {
    return (await db('sqlite_master')
    .select('tbl_name AS name')
    .whereNot({ tbl_name: 'sqlite_sequence' })
    .whereIn('type', ['table', 'view']))
    .map((t: { name: string }) => ({ name: t.name, schema: 'main', comment: '' } as TableDefinition))
  }

  async getAllColumns(db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    return (await db.raw(`pragma table_info(${table})`))
    .map((c: SQLiteColumn) => (
      {
        name: c.name,
        nullable: c.notnull === 0,
        type: (c.type.includes('(') ? c.type.split('(')[0] : c.type).toLowerCase(),
        optional: c.dflt_value !== null || c.notnull === 0 || c.pk !== 0,
        isEnum: false,
        isPrimaryKey: c.pk !== 0,
        comment: '',
        defaultValue: formatDefaultValue(c.dflt_value, c.type),
      } as ColumnDefinition
    ))
  }
}

interface SQLiteColumn {
  name: string,
  type: string, 
  notnull: 0 | 1,
  dflt_value: string | null,
  pk: number
}