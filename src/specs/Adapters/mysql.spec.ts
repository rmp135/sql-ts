import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql'
import mysql from '../../Adapters/mysql'
import { vi, expect, it, describe, beforeAll, afterAll, beforeEach } from 'vitest'
import { Knex, knex } from 'knex'
import { Config } from '../../Typings'
import { ColumnDefinition, EnumDefinition, TableDefinition } from '../../Adapters/AdapterInterface'
import { URL } from 'url'
import * as SharedAdapterTasks from '../../Adapters/SharedAdapterTasks'

vi.mock('../../Adapters/SharedAdapterTasks')

let sqlContainer: StartedMySqlContainer
let db: Knex

beforeEach(() => {
  vi.restoreAllMocks()
})

beforeAll(async () => {
  sqlContainer = await new MySqlContainer().start()
  
  // Requires root user to create databases which act as schemas for our purposes
  const connectionString = sqlContainer.getConnectionUri().replace('test:', 'root:')
  const connectionDetails = new URL(connectionString)

  const config = {
    client: 'mysql2',
    connection: {
      host: connectionDetails.hostname,
      user: connectionDetails.username,
      password: connectionDetails.password,
      port: parseInt(connectionDetails.port)
    }
  }

  db = knex(config)

  await db.raw('DROP DATABASE IF EXISTS schema_one')
  await db.raw('DROP DATABASE IF EXISTS schema_two')

  await db.raw('CREATE DATABASE schema_one')
  await db.raw('CREATE DATABASE schema_two')

  await db.raw(`
    CREATE TABLE schema_one.table_one (
      id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'schema_one.id comment',
      name VARCHAR(255),
      enum_column ENUM('enum_one', 'enum_two')
    ) COMMENT 'schema_one.table_one comment';
  `);

  await db.raw(`
    CREATE TABLE schema_two.table_two (
      id INT PRIMARY KEY
    );
  `);
}, 60000)

afterAll(async () => {
  await db?.destroy()
  await sqlContainer.stop();
})

describe('getAllTables', () => {
  it('should return all schemas if not specified', async () => {
    const tables = await mysql.getAllTables(db, [])

    expect(tables.length).toEqual(2)
    expect(tables).toEqual<TableDefinition[]>([
      {
        name: 'table_one',
        schema: 'schema_one',
        comment: 'schema_one.table_one comment'
      },
      {
        name: 'table_two',
        schema: 'schema_two',
        comment: ''
      }
    ])
  })

  it('should return only specified schemas', async () => {
    const tables = await mysql.getAllTables(db, ['schema_one'])

    expect(tables.length).toEqual(1)
    expect(tables[0]).toEqual<TableDefinition>({
      name: 'table_one',
      schema: 'schema_one',
      comment: 'schema_one.table_one comment'
    })
  })
})

describe('getAllColumns', () => {
  it('should return all columns for the specified table and schema', async () => {
    const config: Config = {
      schemas: []
    }
    const columns = await mysql.getAllColumns(db, config, 'table_one', 'schema_one')

    expect(columns.length).toEqual(3)
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
    }, {
      name: 'enum_column',
      type: 'enum',
      nullable: true,
      defaultValue: null,
      comment: '',
      columnType: 'StringEnum',
      stringEnumValues: ['enum_one', 'enum_two'],
      isPrimaryKey: false,
      optional: true
    }])
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
    
    const enums = await mysql.getAllEnums(db, config)

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

describe('parseEnumString', () => {
  it('should parse simple values', () => {
    expect(mysql.parseEnumString(`enum('one'','two')`)).toEqual(['one', 'two'])
  })
  it('should parse various complex values', () => {
    expect(mysql.parseEnumString(`enum('ac''tive','inac,ti.ve',' pen"#d ing','valid')`)).toEqual(['ac\'tive', 'inac,ti.ve', ' pen"#d ing', 'valid'])
  })
})