import { describe, vi, it, expect, beforeEach } from 'vitest'
import { Client } from '../Client'
import { Config, Database } from '../Typings'
import * as ConfigTasks from '../ConfigTasks.js'
import * as DatabaseTasks from '../DatabaseTasks.js'
import knex from 'knex'

vi.mock('../ConfigTasks')
vi.mock('../DatabaseTasks')
vi.mock('knex')

beforeEach(() => {
  vi.resetAllMocks()
})

it('should output typescript from a database', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        namespaceName: 'public',
        tables: [],
        enums: [],
      }
    ]
  }

  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockConvert = vi.mocked(DatabaseTasks.convertDatabaseToTypescript).mockReturnValue('export interface Database {}')
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)

  const result = await Client.fromObject(mockDatabase, config).toTypescript()
  expect(mockGenerate).not.toHaveBeenCalled()
  expect(mockConvert).toHaveBeenCalledWith(mockDatabase, appliedConfig)

  expect(result).toEqual(`export interface Database {}`)
})
it('should skip database generation if provided', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        namespaceName: 'public',
        tables: [],
        enums: [],
      }
    ]
  }

  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)

  const result = await Client.fromObject(mockDatabase, config).toObject()
  expect(mockGenerate).not.toHaveBeenCalled()

  expect(result).toEqual(mockDatabase)
})
it('should fetch a database object with no provided db', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDb = {
    destroy: vi.fn()
  }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        namespaceName: 'public',
        tables: [],
        enums: [],
      }
    ]
  }

  vi.mocked(knex).mockReturnValue(mockDb as any)
  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)

  const result = await Client.fromConfig(config).fetchDatabase().toObject()

  expect(mockDb.destroy).toHaveBeenCalled()
  expect(mockGenerate).toHaveBeenCalledWith(appliedConfig, mockDb)
  expect(result).toEqual(mockDatabase)
})
it('should fetch a database object with a provided db', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDb = {
    destroy: vi.fn()
  }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        namespaceName: 'public',
        tables: [],
        enums: [],
      }
    ]
  }

  // vi.mocked(knex).mockReturnValue(mockDb as any)
  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)

  const result = await Client.fromConfig(config).fetchDatabase(mockDb as any).toObject()

  expect(mockDb.destroy).not.toHaveBeenCalled()
  expect(mockGenerate).toHaveBeenCalled()
  expect(result).toEqual(mockDatabase)
})
it('should apply mappings to all tables', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDb = {
    destroy: vi.fn()
  }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        tables: [{ name: 'users', columns: [] }, { name: 'posts', columns: [] }],
        enums: [],
      },
    ]
  } as any as Database

  vi.mocked(knex).mockReturnValue(mockDb as any)
  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)
  
  const mockFn = vi.fn(t => t)

  const result = await Client.fromConfig(config).fetchDatabase().mapTables(mockFn).toObject()

  expect(mockFn).toHaveBeenCalledTimes(2)
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[0].tables[0], mockDatabase.schemas[0])
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[0].tables[1], mockDatabase.schemas[0])
  expect(mockDb.destroy).toHaveBeenCalled()
  expect(mockGenerate).toHaveBeenCalledWith(appliedConfig, mockDb)
  expect(result).toEqual(mockDatabase)
})
it('should apply mappings to a specified table', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDb = {
    destroy: vi.fn()
  }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        tables: [{ name: 'users', columns: [] }, { name: 'posts', columns: [] }],
        enums: [],
      },
    ]
  } as any as Database

  vi.mocked(knex).mockReturnValue(mockDb as any)
  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)
  
  const mockFn = vi.fn(t => t)

  const result = await Client.fromConfig(config).fetchDatabase().mapTable('public.users', mockFn).toObject()

  expect(mockFn).toHaveBeenCalledTimes(1)
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[0].tables[0], mockDatabase.schemas[0])
  expect(mockDb.destroy).toHaveBeenCalled()
  expect(mockGenerate).toHaveBeenCalledWith(appliedConfig, mockDb)
  expect(result).toEqual(mockDatabase)
})
it('should apply mappings to all schemas', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDb = {
    destroy: vi.fn()
  }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        namespaceName: 'public_one',
        tables: [{ name: 'users', columns: [] }, { name: 'posts', columns: [] }],
        enums: [],
      },
      {
        name: 'public 2',
        namespaceName: 'public_two',
        tables: [{ name: 'users', columns: [] }, { name: 'posts', columns: [] }],
        enums: [],
      },
    ]
  } as any as Database

  vi.mocked(knex).mockReturnValue(mockDb as any)
  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)
  
  const mockFn = vi.fn(t => t)

  const result = await Client.fromConfig(config).fetchDatabase().mapSchemas(mockFn).toObject()

  expect(mockFn).toHaveBeenCalledTimes(2)
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[0])
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[1])
  expect(mockDb.destroy).toHaveBeenCalled()
  expect(mockGenerate).toHaveBeenCalledWith(appliedConfig, mockDb)
  expect(result).toEqual(mockDatabase)
})
it('should apply mappings to specified schema', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDb = {
    destroy: vi.fn()
  }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        namespaceName: 'public_one',
        tables: [{ name: 'users', columns: [] }, { name: 'posts', columns: [] }],
        enums: [],
      },
      {
        name: 'public 2',
        namespaceName: 'public_two',
        tables: [{ name: 'users', columns: [] }, { name: 'posts', columns: [] }],
        enums: [],
      },
    ]
  } as any as Database

  vi.mocked(knex).mockReturnValue(mockDb as any)
  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)
  
  const mockFn = vi.fn(t => t)

  const result = await Client.fromConfig(config).fetchDatabase().mapSchema('public', mockFn).toObject()

  expect(mockFn).toHaveBeenCalledTimes(1)
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[0])
  expect(mockDb.destroy).toHaveBeenCalled()
  expect(mockGenerate).toHaveBeenCalledWith(appliedConfig, mockDb)
  expect(result).toEqual(mockDatabase)
})
it('should apply mappings to all columns', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDb = {
    destroy: vi.fn()
  }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        tables: [{ name: 'users', columns: [{ name: 'id' }] }, { name: 'posts', columns: [{ name: 'col' }] }],
        enums: [],
      },
      {
        name: 'public 2',
        tables: [{ name: 'users', columns: [{ name: 'id 2' }] }, { name: 'posts', columns: [{ name: 'col' }] }],
        enums: [],
      },
    ]
  } as any as Database

  vi.mocked(knex).mockReturnValue(mockDb as any)
  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)
  
  const mockFn = vi.fn(t => t)

  const result = await Client.fromConfig(config).fetchDatabase().mapColumns(mockFn).toObject()

  expect(mockFn).toHaveBeenCalledTimes(4)
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[0].tables[0].columns[0], mockDatabase.schemas[0].tables[0], mockDatabase.schemas[0])
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[0].tables[1].columns[0], mockDatabase.schemas[0].tables[1], mockDatabase.schemas[0])
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[1].tables[0].columns[0], mockDatabase.schemas[1].tables[0], mockDatabase.schemas[1])
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[1].tables[1].columns[0], mockDatabase.schemas[1].tables[1], mockDatabase.schemas[1])
  expect(mockDb.destroy).toHaveBeenCalled()
  expect(mockGenerate).toHaveBeenCalledWith(appliedConfig, mockDb)
  expect(result).toEqual(mockDatabase)
})
it('should apply mappings to specified column', async () => {
  const config: Config = { }
  const appliedConfig: Config = { }

  const mockDb = {
    destroy: vi.fn()
  }

  const mockDatabase: Database = {
    schemas: [
      {
        name: 'public',
        tables: [{ name: 'users', columns: [{ name: 'id' }] }, { name: 'posts', columns: [{ name: 'col' }] }],
        enums: [],
      },
      {
        name: 'public 2',
        tables: [{ name: 'users', columns: [{ name: 'id 2' }] }, { name: 'posts', columns: [{ name: 'col' }] }],
        enums: [],
      },
    ]
  } as any as Database

  vi.mocked(knex).mockReturnValue(mockDb as any)
  vi.mocked(ConfigTasks.applyConfigDefaults).mockReturnValue(appliedConfig)
  const mockGenerate = vi.mocked(DatabaseTasks.generateDatabase).mockResolvedValue(mockDatabase)
  
  const mockFn = vi.fn(t => t)

  const result = await Client.fromConfig(config).fetchDatabase().mapColumn('public.users.id', mockFn).toObject()

  expect(mockFn).toHaveBeenCalledTimes(1)
  expect(mockFn).toHaveBeenCalledWith(mockDatabase.schemas[0].tables[0].columns[0], mockDatabase.schemas[0].tables[0], mockDatabase.schemas[0])
  expect(mockDb.destroy).toHaveBeenCalled()
  expect(mockGenerate).toHaveBeenCalledWith(appliedConfig, mockDb)
  expect(result).toEqual(mockDatabase)
})