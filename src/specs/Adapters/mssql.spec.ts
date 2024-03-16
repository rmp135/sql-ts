import { MSSQLServerContainer, StartedMSSQLServerContainer } from '@testcontainers/mssqlserver'
import mssql from '../../Adapters/mssql'
import { vi, expect, it, describe, beforeAll, afterAll, beforeEach } from 'vitest'
import { Knex, knex } from 'knex'
import { Config } from '../../Typings'
import { ColumnDefinition, EnumDefinition } from '../../Adapters/AdapterInterface'
import ConnectionPoolMethods from 'mssql/lib/base/connection-pool.js'
import * as SharedAdapterTasks from '../../Adapters/SharedAdapterTasks'

vi.mock('../../Adapters/SharedAdapterTasks')

let sqlContainer: StartedMSSQLServerContainer
let db: Knex

beforeEach(() => {
  vi.restoreAllMocks()
})

beforeAll(async () => {
  sqlContainer = await new MSSQLServerContainer().acceptLicense().start()
  
  const config = {
    client:"mssql",
    connection: ConnectionPoolMethods.parseConnectionString(sqlContainer.getConnectionUri())
  }

  db = knex(config as Config)

  await db.raw(`CREATE SCHEMA schema_one`);
  await db.raw(`CREATE SCHEMA schema_two`);
  
  await db.raw(`
    CREATE TABLE schema_one.table_one (
      id INT PRIMARY KEY IDENTITY(1,1),
      name VARCHAR(255)
    );
  `);

  await db.raw(`
    CREATE TABLE schema_two.table_two (
      id INT PRIMARY KEY,
      name NVARCHAR(255)
    );
  `);

  await db.raw(`
    EXEC sp_addextendedproperty 
      @name = N'MS_Description', 
      @value = N'schema_one.users comment', 
      @level0type = N'SCHEMA', 
      @level0name = N'schema_one', 
      @level1type = N'TABLE', 
      @level1name = N'table_one';
  `);
  await db.raw(`
    EXEC sp_addextendedproperty 
      @name = N'MS_Description', 
      @value = N'schema_one.id comment', 
      @level0type = N'SCHEMA', 
      @level0name = N'schema_one', 
      @level1type = N'TABLE', 
      @level1name = N'table_one',
      @level2type = N'COLUMN',
      @level2name = N'id';
  `);
}, 60000)

afterAll(async () => {
  await db?.destroy()
  await sqlContainer.stop();
})

describe('getAllTables', () => {
  it('should return all schemas if not specified', async () => {
    const tables = await mssql.getAllTables(db, [])

    // Some system tables are returned. We don't care about these as long as our tables are returned.
    expect(tables.length).toBeGreaterThanOrEqual(2)
    const ourTables = tables.filter(t => t.schema === 'schema_one' || t.schema === 'schema_two')
    expect(ourTables.length).toEqual(2)
    expect(ourTables).toEqual([
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
    const tables = await mssql.getAllTables(db, ['schema_one'])

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
      schemas: []
    }
    const columns = await mssql.getAllColumns(db, config, 'table_one', 'schema_one')

    expect(columns.length).toEqual(2)
    expect(columns).toEqual<ColumnDefinition[]>([{
      name: 'id',
      type: 'int',
      nullable: false,
      defaultValue: null,
      comment: 'schema_one.id comment',
      columnType: 'Standard',
      isPrimaryKey: true,
      optional: true
    }, {
      name: 'name',
      type: 'varchar',
      nullable: true,
      defaultValue: null,
      comment: '',
      columnType: 'Standard',
      isPrimaryKey: false,
      optional: true
    }] as ColumnDefinition[])
  })
})

describe('getAllEnums', () => {
  it('should return only table based schemas', async () => {
    const config: Config = { }

    var mockedGetTableEnums = vi.mocked(SharedAdapterTasks.getTableEnums).mockResolvedValue([{
      name: 'table_one',
      schema: 'schema_one',
      values: {
        enum_column: 'enum_one'
      }
    }])
    
    const enums = await mssql.getAllEnums(db, config)

    expect(mockedGetTableEnums).toHaveBeenCalledWith(db, config)
    
    expect(enums.length).toEqual(1)
    expect(enums).toEqual([{
      name: 'table_one',
      schema: 'schema_one',
      values: {
        enum_column: 'enum_one'
      }
    }] as EnumDefinition[])
  })
})
