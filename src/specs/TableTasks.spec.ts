import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Config, Column } from '../Typings'
import * as TableTasks from '../TableTasks'
import * as AdapterFactory from '../AdapterFactory'
import * as ColumnTasks from '../ColumnTasks'

vi.mock('../AdapterFactory')
vi.mock('../ColumnTasks')

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getAllTables', () => {
  it('should return all tables from the database ordered by name', async () => {
    const mockAdapter = {
      getAllTables: vi.fn().mockReturnValue([
        {
          name: 'tableB',
          schema: 'schema',
          comment: ''
        },
        {
          name: 'tableA',
          schema: 'schema',
          comment: ''
        }
      ])
    }
    vi.mocked(AdapterFactory.buildAdapter).mockReturnValue(mockAdapter as any)
    const mockedColumns: Column[] = [
      {
        name: 'column',
        type: 'type',
        columnType: 'Standard',
        comment: '',
        defaultValue: null,
        isPrimaryKey: false,
        nullable: true,
        optional: true,
        propertyName: 'column',
        propertyType: 'type'
      }
    ]
    vi.mocked(ColumnTasks.getColumnsForTable).mockResolvedValue(mockedColumns)
    const db = {
      client: {
        dialect: 'dialect'
      }
    }
    const config: Config = {
      tables: [],
      excludedTables: [],
      additionalProperties: {},
      schemas: [],
      singularTableNames: false,
      interfaceNameFormat: '${table}Entity'
    }
    const result = await TableTasks.getAllTables(db as any, config)
    expect(result).toEqual([
      {
        columns: [
          {
            columnType: 'Standard',
            comment: '',
            defaultValue: null,
            isPrimaryKey: false,
            name: 'column',
            nullable: true,
            optional: true,
            propertyName: 'column',
            propertyType: 'type',
            type: 'type',
          }
        ],
        interfaceName: 'tableAEntity',
        name: 'tableA',
        schema: 'schema',
        additionalProperties: [],
        extends: '',
        comment: ''
      },
      {
        columns: [
          {
            columnType: 'Standard',
            comment: '',
            defaultValue: null,
            isPrimaryKey: false,
            name: 'column',
            nullable: true,
            optional: true,
            propertyName: 'column',
            propertyType: 'type',
            type: 'type',
          }
        ],
        interfaceName: 'tableBEntity',
        name: 'tableB',
        schema: 'schema',
        additionalProperties: [],
        extends: '',
        comment: ''
      },
    ])
  })
  it('should only return filtered tables', async () => {
    const mockAdapter = {
      getAllTables: vi.fn().mockReturnValue([
        {
          name: 'tableB',
          schema: 'schema',
          comment: ''
        },
        {
          name: 'tableA',
          schema: 'schema',
          comment: ''
        }
      ])
    }
    vi.mocked(AdapterFactory.buildAdapter).mockReturnValue(mockAdapter as any)
    const mockedColumns: Column[] = [
      {
        name: 'column',
        type: 'type',
        columnType: 'Standard',
        comment: '',
        defaultValue: null,
        isPrimaryKey: false,
        nullable: true,
        optional: true,
        propertyName: 'column',
        propertyType: 'type'
      }
    ]
    vi.mocked(ColumnTasks.getColumnsForTable).mockResolvedValue(mockedColumns)
    const db = {
      client: {
        dialect: 'dialect'
      }
    }
    const config: Config = {
      tables: ['schema.tableA'],
      excludedTables: [],
      additionalProperties: {},
      schemas: [],
      singularTableNames: false,
      interfaceNameFormat: '${table}Entity'
    }
    const result = await TableTasks.getAllTables(db as any, config)
    expect(result).toEqual([
      {
        columns: [
          {
            columnType: 'Standard',
            comment: '',
            defaultValue: null,
            isPrimaryKey: false,
            name: 'column',
            nullable: true,
            optional: true,
            propertyName: 'column',
            propertyType: 'type',
            type: 'type',
          }
        ],
        interfaceName: 'tableAEntity',
        name: 'tableA',
        schema: 'schema',
        additionalProperties: [],
        extends: '',
        comment: ''
      }
    ])
  })
  it('should filter excluded tables', async () => {
    const mockAdapter = {
      getAllTables: vi.fn().mockReturnValue([
        {
          name: 'tableB',
          schema: 'schema',
          comment: ''
        },
        {
          name: 'tableA',
          schema: 'schema',
          comment: ''
        }
      ])
    }
    vi.mocked(AdapterFactory.buildAdapter).mockReturnValue(mockAdapter as any)
    const mockedColumns: Column[] = [
      {
        name: 'column',
        type: 'type',
        columnType: 'Standard',
        comment: '',
        defaultValue: null,
        isPrimaryKey: false,
        nullable: true,
        optional: true,
        propertyName: 'column',
        propertyType: 'type'
      }
    ]
    vi.mocked(ColumnTasks.getColumnsForTable).mockResolvedValue(mockedColumns)
    const db = {
      client: {
        dialect: 'dialect'
      }
    }
    const config: Config = {
      excludedTables: ['schema.tableB'],
      tables: [],
      additionalProperties: {},
      schemas: [],
      singularTableNames: false,
      interfaceNameFormat: '${table}Entity'
    }
    const result = await TableTasks.getAllTables(db as any, config)
    expect(result).toEqual([
      {
        columns: [
          {
            columnType: 'Standard',
            comment: '',
            defaultValue: null,
            isPrimaryKey: false,
            name: 'column',
            nullable: true,
            optional: true,
            propertyName: 'column',
            propertyType: 'type',
            type: 'type',
          }
        ],
        interfaceName: 'tableAEntity',
        name: 'tableA',
        schema: 'schema',
        additionalProperties: [],
        extends: '',
        comment: ''
      }
    ])
  })
})

describe('getAdditionalProperties', () => {
  it('should return empty properties when none are specified', () => {
    const mockConfig: Config = {
      additionalProperties: {
        'schema.table': ['example property'],
        'schema2.table': ['not example property'],
      }
    }
    var result = TableTasks.getAdditionalProperties('table2', 'schema2', mockConfig)
    expect(result).toEqual([])
  })
  it('should return the properties associated with the full name of the table', () => {
    const mockConfig: Config = {
      additionalProperties: {
        'schema.table': ['example property'],
        'schema2.table': ['not example property'],
      }
    }
    var result = TableTasks.getAdditionalProperties('table', 'schema', mockConfig)
    expect(result).toEqual(['example property'])
  })
})

describe('getExtends', () => {
  it('should return an empty string if no config option exists', () => {
    const mockConfig: Config = { }
    var result = TableTasks.getExtends('table', 'schema', mockConfig)
    expect(result).toEqual('')
  })
  it('should return the config associated with the full table name', () => {
    const mockConfig: Config = {
      extends: {
        'schema.table': 'extend me',
        'schema2.table': 'not me'
      }
    }
    var result = TableTasks.getExtends('table', 'schema', mockConfig)
    expect(result).toEqual('extend me')
  })
})

describe('generateInterfaceName', () => {
  it('should convert spaces to underscores', () => {
    const config :  Config = {
      singularTableNames: false,
      interfaceNameFormat: '${table}Entity'
    }
    const result = TableTasks.generateInterfaceName('name with spaces', config)
    expect(result).toEqual('name_with_spacesEntity')
  })
  it('should consider singular table names', () => {
    const config :  Config = {
      singularTableNames: true,
      interfaceNameFormat: '${table}Entity'
    }
    const result = TableTasks.generateInterfaceName('name with spaces', config)
    expect(result).toEqual('name_with_spaceEntity')
  })
})
