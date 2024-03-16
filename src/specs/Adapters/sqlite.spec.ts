import { describe, expect, vi, it, beforeAll } from 'vitest'
import * as SharedAdapterTasks from '../../Adapters/SharedAdapterTasks'
import sqlite from '../../Adapters/sqlite'
import knex, { Knex } from 'knex'
import { Config } from '../../Typings'
import { EnumDefinition, TableDefinition, ColumnDefinition } from '../../Adapters/AdapterInterface'
import { beforeEach } from 'node:test'

vi.mock('../../Adapters/SharedAdapterTasks')

let db: Knex

beforeEach(() => {
  vi.restoreAllMocks()
})

beforeAll(async () => {
  const config = {
    client: 'better-sqlite3',
    connection: {
      filename: ':memory:'
    }
  }

  db = knex(config as Config)
  await db.raw(`
  CREATE TABLE table_one (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT DEFAULT def_val,
    numcol NUMERIC
  );
`)
  await db.raw(`
  CREATE TABLE table_two (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT(100)
  );
`)
})

describe('getAllTables', () => {
  it('should return all tables', async () => {
    const tables = await sqlite.getAllTables(db, [])
    expect(tables).toEqual<TableDefinition[]>([
      {
        name: 'table_one',
        schema: 'main',
        comment: ''
      },
      {
        name: 'table_two',
        schema: 'main',
        comment: ''
      },
    ])
  })
})

describe('getAllColumns', () => {
  it('should return all columns for specified table', async () => {
    const tables = await sqlite.getAllColumns(db, {}, 'table_one', '')
    expect(tables).toEqual<ColumnDefinition[]>([
      {
        name: 'id',
        columnType: 'Standard',
        comment: '',
        defaultValue: null,
        isPrimaryKey: true,
        nullable: false,
        optional: true,
        type: 'integer'
      },
      {
        columnType: 'Standard',
        comment: '',
        defaultValue: 'def_val',
        isPrimaryKey: false,
        name: 'name',
        nullable: true,
        optional: true,
        type: 'text',
      },
      {
        columnType: 'Standard',
        comment: '',
        defaultValue: null,
        isPrimaryKey: false,
        name: 'numcol',
        nullable: true,
        optional: true,
        type: 'numeric',
      },
    ])
  })
})

describe('getAllEnums', () => {
  it('should return only table based schemas', async () => {
    const db = {} as unknown as Knex
    const config: Config = { }

    var mockedGetTableEnums = vi.mocked(SharedAdapterTasks.getTableEnums).mockResolvedValue([{
      name: 'table_one',
      schema: 'schema_one',
      values: {
        enum_column: 'enum_one'
      }
    }])
    
    const enums = await sqlite.getAllEnums(db, config)

    expect(mockedGetTableEnums).toHaveBeenCalledWith(db, config)
    
    expect(enums.length).toEqual(1)
    expect(enums).toEqual<EnumDefinition[]>([{
      name: 'table_one',
      schema: 'schema_one',
      values: {
        enum_column: 'enum_one'
      }
    }])
  })
})

