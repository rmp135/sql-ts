import { Column, Config, Database, Schema, Table } from './Typings.js'
import { Knex } from 'knex'
import * as ConfigTasks from './ConfigTasks.js'
import * as DatabaseTasks from './DatabaseTasks.js'
import * as ConnectionFactory from './ConnectionFactory.js'

interface ClientWithConfig {
  /**
   * Fetches the database schema from the database
   * @param db Optional Knex instance to use for fetching the database schema
   */
  fetchDatabase(db?: Knex): ClientWithDatabase
}

interface ClientWithDatabase {
  /**
   * Maps a single table to a new table definition
   * @param identifer <schema>.<table> identifier of the table to map
   * @param func Function to call for this table. The function should return a new table object
   */
  mapTable(identifer: string, func: (table: Table, schema: Schema) => Table): ClientWithDatabase
  /**
   * Maps all tables to a new table definition
   * @param func Function to call for each table. The function should return a new table object
   */
  mapTables(func: (table: Table, schema: Schema) => Table): ClientWithDatabase
  /**
   * Maps a single column to a new column definition
   * @param identifier <schema>.<table>.<column> identifier of the column to map
   * @param func Function to call for this column. The function should return a new column object
   */
  mapColumn(identifier: string, func: (column: Column, table: Table, schema: Schema) => Column): ClientWithDatabase
  /**
   * Maps all columns to a new column definition
   * @param func Function to call for each column. The function should return a new column object
   */
  mapColumns(func: (column: Column, table: Table, schema: Schema) => Column): ClientWithDatabase
  /**
   * Maps a single schema to a new schema definition
   * @param identifier <schema> identifier of the schema to map
   * @param func Function to call for this schema. The function should return a new schema object
   */
  mapSchema(identifer: string, func: (schema: Schema) => Schema): ClientWithDatabase
  /**
   * Maps all schemas to a new schema definition
   * @param func Function to call for each schema. The function should return a new schema object
   */
  mapSchemas(func: (schema: Schema) => Schema): ClientWithDatabase
  /**
   * Asynchronously generates a typescript definition file
   */
  toTypescript(): Promise<string>
  /**
   * Asynchronously generates a database definition object
   */
  toObject(): Promise<Database>
}

export class Client implements ClientWithConfig, ClientWithDatabase {
  private config: Config
  private databaseProvider: () => Promise<Database>
  private databaseMappings: Array<(schema: Database) => void> = []

  private constructor() { }
  
  /**
   * Creates a new Client with the given sql-ts configuration
   * @param config The configuration object for the database
   * @returns A Client with the given configuration
   */
  public static fromConfig(config: Config): ClientWithConfig {
    const client = new Client()
    client.config = ConfigTasks.applyConfigDefaults(config)
    return client
  }

  /**
   * Creates a new Client with the given database definition from {@link ClientWithDatabase.toObject}
   * @param schema The database definition to use
   * @param config The sql-ts configuration object
   * @returns A Client with the given database schema
   */
  public static fromObject(schema: Database, config: Config): ClientWithDatabase {
    const client = new Client()
    client.config = ConfigTasks.applyConfigDefaults(config)
    client.databaseProvider = () => Promise.resolve(schema)
    return client
  }

  public fetchDatabase(db?: Knex): ClientWithDatabase {
    this.databaseProvider = async () => {
      if (db == null) {
        return await ConnectionFactory.createAndRun(
          this.config,
          tempdb => DatabaseTasks.generateDatabase(this.config, tempdb)
        )
      }
      return await DatabaseTasks.generateDatabase(this.config, db)
      
    }
    return this
  }

  public mapTable(identifer: string, func: (table: Table, schema: Schema) => Table): ClientWithDatabase {
    this.databaseMappings.push((database: Database) => {
      for (const schema of database.schemas) {
        schema.tables = schema.tables.map(table => `${schema.name}.${table.name}` === identifer ? func(table, schema) : table)
      }
    })
    return this
  }

  public mapTables(func: (table: Table, schema: Schema) => Table): ClientWithDatabase {
    this.databaseMappings.push((database: Database) => {
      for (const schema of database.schemas) {
        schema.tables = schema.tables.map(table => func(table, schema))
      }
    })
    return this
  }

  public mapColumn(identifier: string, func: (column: Column, table: Table, schema: Schema) => Column): ClientWithDatabase {
    this.databaseMappings.push((database: Database) => {
      for (const schema of database.schemas) {
        for (const table of schema.tables) {
          table.columns = table.columns.map(column => `${schema.name}.${table.name}.${column.name}` === identifier ? func(column, table, schema) : column)
        }
      }
    })
    return this
  }

  public mapColumns(func: (column: Column, table: Table, schema: Schema) => Column): ClientWithDatabase {
    this.databaseMappings.push((database: Database) => {
      for (const schema of database.schemas) {
        for (const table of schema.tables) {
          table.columns = table.columns.map(column => func(column, table, schema))
        }
      }
    })
    return this
  }

  public mapSchema(identifier: string, func: (schema: Schema) => Schema): ClientWithDatabase {
    this.databaseMappings.push((database: Database) => {
      database.schemas = database.schemas.map(schema => schema.name === identifier ? func(schema) : schema)
    })
    return this
  }

  public mapSchemas(func: (schema: Schema) => Schema): ClientWithDatabase {
    this.databaseMappings.push((database: Database) => {
      database.schemas = database.schemas.map(schema => func(schema))
    })
    return this
  }

  public async toTypescript(): Promise<string> {
    const schema = await this.toObject()
    return DatabaseTasks.convertDatabaseToTypescript(schema, this.config)
  }

  public async toObject(): Promise<Database> {
    const database = await this.databaseProvider()
    for (const mapping of this.databaseMappings) {
      mapping(database)
    }
    return database
  }
}
