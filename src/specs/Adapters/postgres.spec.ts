import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import postgres from '../../Adapters/postgres'
import { vi, expect, it, describe, beforeAll, afterAll, beforeEach } from 'vitest'
import { Knex, knex } from 'knex'
import { Config } from '../../Typings'
import { ColumnDefinition, EnumDefinition } from '../../Adapters/AdapterInterface'
import * as SharedAdapterTasks from '../../Adapters/SharedAdapterTasks'

vi.mock('../../Adapters/SharedAdapterTasks')

let postgresContainer: StartedPostgreSqlContainer
let db: Knex

beforeEach(() => {
  vi.restoreAllMocks()
})

beforeAll(async () => {
  postgresContainer = await new PostgreSqlContainer().start()

  const config = {
    client:"pg",
    connection: postgresContainer.getConnectionUri()
  }

  db = knex(config) 
  
  await db.raw(`CREATE SCHEMA schema_one`);
  await db.raw(`CREATE SCHEMA schema_two`);
  
  await db.raw(`
    CREATE TYPE schema_one.enum_one AS ENUM ('one', 'two', 'three');

    CREATE TYPE schema_two.enum_two AS ENUM ('four', 'five', 'six');

    CREATE TABLE schema_one.table_one (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      enum_column schema_one.enum_one
    );

    COMMENT ON COLUMN schema_one.table_one.id IS 'schema_one.id comment';

    COMMENT ON TABLE schema_one.table_one IS 'schema_one.users comment';

    CREATE TABLE schema_two.table_two (
    );
  `);
}, 60000)

afterAll(async () => {
  await db?.destroy()
  await postgresContainer.stop();
})

describe('getAllTables', () => {
  it('should return all schemas if not specified', async () => {
    const tables = await postgres.getAllTables(db, [])

    expect(tables.length).toEqual(2)
    expect(tables).toEqual([
      {
        name: 'table_one',
        schema: 'schema_one',
        comment: 'schema_one.users comment'
      },
      {
        name: 'table_two',
        schema: 'schema_two',
        comment: ''
      }
    ])
  })

  it('should return only specified schemas', async () => {
    const tables = await postgres.getAllTables(db, ['schema_one'])

    expect(tables.length).toEqual(1)
    expect(tables[0]).toEqual({
      name: 'table_one',
      schema: 'schema_one',
      comment: 'schema_one.users comment'
    })
  })
})

describe('getAllColumns', () => {
  it('should return all columns', async () => {
    const config: Config = {
      schemas: [],
      tableEnums: {}
    }
    const columns = await postgres.getAllColumns(db, config, 'table_one', 'schema_one')

    expect(columns.length).toEqual(3)
    expect(columns).toEqual<ColumnDefinition[]>([{
      name: 'id',
      type: 'int4',
      nullable: false,
      defaultValue: 'nextval(\'schema_one.table_one_id_seq\'::regclass)', // <- required?
      comment: 'schema_one.id comment',
      columnType: 'Standard',
      isPrimaryKey: true,
      optional: true,
      enumSchema: 'pg_catalog' // <- should be undefined / null
    }, {
      name: 'name',
      type: 'varchar',
      nullable: true,
      defaultValue: null,
      comment: '',
      columnType: 'Standard',
      isPrimaryKey: false,
      optional: true,
      enumSchema: 'pg_catalog' // <- should be undefined / null
    }, {
      name: 'enum_column',
      type: 'enum_one', // <- should contain the enum schema
      nullable: true,
      defaultValue: null,
      comment: '',
      columnType: 'NumericEnum',
      isPrimaryKey: false,
      optional: true,
      enumSchema: 'schema_one' // <- should be undefined / null
    }])
  })
})

describe('getAllEnums', () => {
  it('should return all enums when schema not specified', async () => {
    const config: Config = {
      schemas: []
    }

    var mockedGetTableEnums = vi.mocked(SharedAdapterTasks.getTableEnums).mockResolvedValue([{
      name: 'table_one',
      schema: 'schema_one',
      values: {
        enum_column: 'enum_one'
      }
    }])
    
    const enums = await postgres.getAllEnums(db, config)

    expect(mockedGetTableEnums).toHaveBeenCalledWith(db, config)
    
    expect(enums.length).toEqual(3)
    expect(enums).toEqual([{
      name: 'enum_one',
      schema: 'schema_one',
      values: {
        one: 'one',
        two: 'two',
        three: 'three'
      }
    }, {
      name: 'enum_two',
      schema: 'schema_two',
      values: {
        four: 'four',
        five: 'five',
        six: 'six'
      }
    }, {
      name: 'table_one',
      schema: 'schema_one',
      values: {
        enum_column: 'enum_one'
      }
    }] as EnumDefinition[])
  })
  it('should return enums for the specified schema', async () => {
    const config: Config = {
      schemas: ['schema_one']
    }

    var mockedGetTableEnums = vi.mocked(SharedAdapterTasks.getTableEnums).mockResolvedValue([{
      name: 'table_one',
      schema: 'schema_one',
      values: {
        enum_column: 'enum_one'
      }
    }])
    
    const enums = await postgres.getAllEnums(db, config)

    expect(mockedGetTableEnums).toHaveBeenCalledWith(db, config)
    
    expect(enums.length).toEqual(2)
    expect(enums).toEqual([{
      name: 'enum_one',
      schema: 'schema_one',
      values: {
        one: 'one',
        two: 'two',
        three: 'three'
      }
    }, {
      name: 'table_one',
      schema: 'schema_one',
      values: {
        enum_column: 'enum_one'
      }
    }] as EnumDefinition[])
  })
})
