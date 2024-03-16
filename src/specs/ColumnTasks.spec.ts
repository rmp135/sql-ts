import { describe, it, vi, expect, beforeEach } from 'vitest'
import * as ColumnTasks from '../ColumnTasks'
import { AdapterInterface, ColumnDefinition, TableDefinition } from '../Adapters/AdapterInterface'
import { Config, Table } from '../Typings'
import { Knex } from 'knex'
import * as AdapterFactory from '../AdapterFactory'
import * as SharedTasks from '../SharedTasks'
import * as EnumTasks from '../EnumTasks'
import * as SchemaTasks from '../SchemaTasks'

vi.mock('../AdapterFactory')
vi.mock('../SharedTasks')
vi.mock('../EnumTasks')
vi.mock('../SchemaTasks')

beforeEach(() => {
  vi.resetAllMocks()
})

describe('getColumnForTable', () => {
  it('should return all tables sorted by source', async () => {
    const mockColumns: ColumnDefinition[] = [
      {
        nullable: false,
        columnType: 'Standard',
        name: 'cnameB',
        type: 'ctype',
        optional: false,
        isPrimaryKey: true,
        comment: 'cname comment',
        defaultValue: 'default value',
      },
      {
        nullable: false,
        name: 'cnameA',
        columnType: 'Standard',
        type: 'ctype',
        optional: false,
        isPrimaryKey: true,
        comment: 'cname comment',
        defaultValue: 'default value',
      }
    ]
    const mockedAdapter = {
      getAllColumns: vi.fn().mockReturnValue(mockColumns)
    } as unknown as AdapterInterface
    vi.mocked(AdapterFactory.buildAdapter).mockReturnValue(mockedAdapter)
    vi.mocked(SharedTasks.convertCase).mockReturnValueOnce('newnameB').mockReturnValueOnce('newnameA')
    const db = {
      client: {
        dialect: 'dialect'
      }
    } as Knex
    const table  = {} as Table
    const config = {
      typeOverrides: {},
      typeMap: {},
      columnOptionality: {},
    } as Config
    const result = await ColumnTasks.getColumnsForTable(db, table, config)
    expect(result).toEqual([
      {
        nullable: false,
        columnType: 'Standard',
        name: 'cnameB',
        type: 'ctype',
        optional: false,
        isPrimaryKey: true,
        comment: 'cname comment',
        defaultValue: 'default value',
        propertyName: 'newnameB',
        propertyType: 'any'
      },
      {
        nullable: false,
        name: 'cnameA',
        columnType: 'Standard',
        type: 'ctype',
        optional: false,
        isPrimaryKey: true,
        comment: 'cname comment',
        defaultValue: 'default value',
        propertyName: 'newnameA',
        propertyType: 'any'
      }
    ])
  })
  it('should return all tables sorted alphabetically', async () => {
    const mockColumns: ColumnDefinition[] = [
      {
        nullable: false,
        columnType: 'Standard',
        name: 'cnameB',
        type: 'ctype',
        optional: false,
        isPrimaryKey: true,
        comment: 'cname comment',
        defaultValue: 'default value',
      },
      {
        nullable: false,
        name: 'cnameA',
        columnType: 'Standard',
        type: 'ctype',
        optional: false,
        isPrimaryKey: true,
        comment: 'cname comment',
        defaultValue: 'default value',
      }
    ]
    const mockedAdapter = {
      getAllColumns: vi.fn().mockReturnValue(mockColumns)
    } as unknown as AdapterInterface
    vi.mocked(AdapterFactory.buildAdapter).mockReturnValue(mockedAdapter)
    vi.mocked(SharedTasks.convertCase).mockReturnValueOnce('newnameA').mockReturnValueOnce('newnameB')
    const db = {
      client: {
        dialect: 'dialect'
      }
    } as Knex
    const table  = {} as Table
    const config = {
      columnSortOrder: 'alphabetical',
      typeOverrides: {},
      typeMap: {},
      columnOptionality: {},
    } as Config
    const result = await ColumnTasks.getColumnsForTable(db, table, config)
    expect(result).toEqual([
      {
        nullable: false,
        name: 'cnameA',
        columnType: 'Standard',
        type: 'ctype',
        optional: false,
        isPrimaryKey: true,
        comment: 'cname comment',
        defaultValue: 'default value',
        propertyName: 'newnameA',
        propertyType: 'any'
      },
      {
        nullable: false,
        columnType: 'Standard',
        name: 'cnameB',
        type: 'ctype',
        optional: false,
        isPrimaryKey: true,
        comment: 'cname comment',
        defaultValue: 'default value',
        propertyName: 'newnameB',
        propertyType: 'any'
      },
    ])
  })
})

describe('generateFullColumnName', () => {
  it('should generate a name with a schema', () => {
    const result = ColumnTasks.generateFullColumnName('table', 'schema', 'column')
    expect(result).toBe('schema.table.column')
  })
  it('should skip schema if blank', () => {
    const result = ColumnTasks.generateFullColumnName('table', '', 'column')
    expect(result).toBe('table.column')
  })
  it('should skip schema if null', () => {
    const result = ColumnTasks.generateFullColumnName('table', null, 'column')
    expect(result).toBe('table.column')
  })
})

describe('getOptionality', () => {
  it('should  use config columnOptionality setting', () => {
    const mockColumn: ColumnDefinition = {
      isPrimaryKey: false,
      name: 'columnname',
      nullable: false,
      optional: false,
      columnType: 'Standard',
      type: 'enum type',
      comment: 'comment',
      defaultValue: null,
    }
    const mockConfig: Config = {
      globalOptionality: 'required',
      columnOptionality: {
        'schema.tablename.columnname': 'optional'
      }
    }
    const mockTable: any = {
      name: 'tablename',
      schema: 'schema'
    }
    const result = ColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
    expect(result).toEqual(true)
  })
  it('should return false if optionality is set to required', () => {
    const mockColumn: ColumnDefinition = {
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: false,
      columnType: 'Standard',
      type: 'enum type',
      comment: 'comment',
      defaultValue: null,
    }
    const mockConfig: Config = {
      globalOptionality: 'required',
      columnOptionality: {}
    }
    const mockTable: any = {}
    const result = ColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
    expect(result).toEqual(false)
  })
  it('should return true if optionality is set to optional', () => {
    const mockColumn: ColumnDefinition = {
      columnType: 'Standard',
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: true,
      type: 'enum type',
      comment: 'comment',
      defaultValue: null,
    }
    const mockConfig: Config = {
      globalOptionality: 'optional',
      columnOptionality: {}
    }
    const mockTable: any = {}
    const result = ColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
    expect(result).toEqual(true)
  })
  it('should return true if optionality is dynamic and column is optional', () => {
    const mockColumn: ColumnDefinition = {
      columnType: 'Standard',
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: true,
      type: 'enum type',
      comment: 'comment',
      defaultValue: null,
    }
    const mockConfig: Config = {
      globalOptionality: 'dynamic',
      columnOptionality: {}
    }
    const mockTable: any = {}
    const result = ColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
    expect(result).toEqual(true)
  })
  it('should return false if optionality is dynamic and column is not optional', () => {
    const mockColumn: ColumnDefinition = {
      columnType: 'Standard',
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: false,
      type: 'enum type',
      comment: 'comment',
      defaultValue: null,
    }
    const mockConfig: Config = {
      globalOptionality: 'dynamic',
      columnOptionality: {}
    }
    const mockTable: any = {}
    const result = ColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
    expect(result).toEqual(false)
  })
  it('should return false if column name matches and optionality is required', () => {
    const mockColumn: ColumnDefinition = {
      columnType: 'Standard',
      isPrimaryKey: false,
      name: 'columnname',
      nullable: false,
      optional: false,
      type: 'enum type',
      comment: 'comment',
      defaultValue: null,
    }
    const mockConfig: Config = {
      globalOptionality: 'dynamic',
      columnOptionality: {
        'schema.table.columnname': 'required'
      }
    }
    const mockTable: TableDefinition = {
      name: 'tablename',
      schema: 'schema',
      comment: ''
    }
    const result = ColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
    expect(result).toEqual(false)
  })
})
describe('convertStringEnumType', () => {
  it('should concatenate the types as a string union', () => {
    const column: ColumnDefinition = {
      columnType: 'StringEnum',
      isPrimaryKey: false,
      stringEnumValues: ['value1', 'value2'],
      name: 'enum name',
      nullable: false,
      optional: false,
      type: 'enum type',
      comment: 'comment',
      defaultValue: null,
    }
    const result = ColumnTasks.convertStringEnumType(column)
    expect(result).toEqual('\'value1\' | \'value2\'')
  })
})

describe('convertNumericEnumType', () => {
  it('should return enum name only if schema not required', () => {
    const column: ColumnDefinition = {
      columnType: 'NumericEnum',
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: false,
      type: 'enum type',
      comment: 'comment',
      defaultValue: null,
    }
    const config = {
      schemaAsNamespace: false
    } as Config
    const mockedGenerateEnumNames = vi.mocked(EnumTasks.generateEnumName).mockReturnValue('enum name')
    const result = ColumnTasks.convertNumericEnumType(column, config)
    expect(mockedGenerateEnumNames).toHaveBeenCalledWith('enum type', config)
    expect(result).toEqual('enum name')
  })
  it('should return both enum and schema name', () => {
    const column: ColumnDefinition = {
      columnType: 'NumericEnum',
      isPrimaryKey: false,
      name: 'enum name',
      enumSchema: 'schema',
      nullable: false,
      optional: false,
      type: 'enum type',
      comment: 'comment',
      defaultValue: null,
    }
    const config = {
      schemaAsNamespace: true
    } as Config
    const mockedGenerateEnumNames = vi.mocked(EnumTasks.generateEnumName).mockReturnValue('enum name')
    const mockedGenerateSchemaName = vi.mocked(SchemaTasks.generateSchemaName).mockReturnValue('schema name')
    const result = ColumnTasks.convertNumericEnumType(column, config)
    expect(mockedGenerateEnumNames).toHaveBeenCalledWith('enum type', config)
    expect(mockedGenerateSchemaName).toHaveBeenCalledWith('schema')
    expect(result).toEqual('schema name.enum name')
  })
})
describe('convertStandardType', () => {
  it('should resolve any when nothing matches', () => {
    const table = { } as TableDefinition
    const column: ColumnDefinition = {
      columnType: 'NumericEnum',
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: false,
      type: 'unknown',
      comment: 'comment',
      defaultValue: null,
    }
    const config = {
      schemaAsNamespace: false,
      typeMap: { },
      typeOverrides: { }
    } as Config
    vi.mocked(SharedTasks.resolveAdapterName).mockReturnValue('postgres')
    const result = ColumnTasks.convertStandardType(column, table, config, 'postgres')
    expect(result).toEqual('any')
  })
  it('should resolve type from db typemap', () => {
    const table = { } as TableDefinition
    const column: ColumnDefinition = {
      columnType: 'NumericEnum',
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: false,
      type: 'numeric',
      comment: 'comment',
      defaultValue: null,
    }
    const config = {
      schemaAsNamespace: false,
      typeMap: { },
      typeOverrides: { }
    } as Config
    vi.mocked(SharedTasks.resolveAdapterName).mockReturnValue('postgres')
    const result = ColumnTasks.convertStandardType(column, table, config, 'postgres')
    expect(result).toEqual('string')
  })
  it('should resolve from config typemap', () => {
    const table = { } as TableDefinition
    const column: ColumnDefinition = {
      columnType: 'NumericEnum',
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: false,
      type: 'numeric',
      comment: 'comment',
      defaultValue: null,
    }
    const config = {
      schemaAsNamespace: false,
      typeMap: {
        fromconfig: ['numeric']
       },
      typeOverrides: { }
    } as Config
    vi.mocked(SharedTasks.resolveAdapterName).mockReturnValue('postgres')
    const result = ColumnTasks.convertStandardType(column, table, config, 'postgres')
    expect(result).toEqual('fromconfig')
  })
  it('should resolve from config schema map', () => {
    const table = { name: 'table', schema: 'schema' } as TableDefinition
    const column: ColumnDefinition = {
      columnType: 'NumericEnum',
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: false,
      type: 'numeric',
      comment: 'comment',
      defaultValue: null,
    }
    const config = {
      schemaAsNamespace: false,
      typeMap: {
        fromconfig: ['numeric']
       },
      typeOverrides: { 
        'schema.table.enum name': 'fromoverride'
      }
    } as Config
    vi.mocked(SharedTasks.resolveAdapterName).mockReturnValue('postgres')
    const result = ColumnTasks.convertStandardType(column, table, config, 'postgres')
    expect(result).toEqual('fromoverride')
  })
})
describe('convertType', () => {
  it('should resolve string enum when StringEnum', () => {
    const table = { name: 'table', schema: 'schema' } as TableDefinition
    const column: ColumnDefinition = {
      columnType: 'StringEnum',
      isPrimaryKey: false,
      name: 'enum name',
      stringEnumValues: ['value1', 'value2'],
      nullable: false,
      optional: false,
      type: 'numeric',
      comment: 'comment',
      defaultValue: null,
    }
    const config = {
      schemaAsNamespace: false,
      typeMap: { },
      typeOverrides: { }
    } as Config
    const result = ColumnTasks.convertType(column, table, config, 'postgres')
    expect(result).toEqual(`'value1' | 'value2'`)
  })
  it('should resolve numeric when NumericEnum', () => {
    const table = { name: 'table', schema: 'schema' } as TableDefinition
    const column: ColumnDefinition = {
      columnType: 'NumericEnum',
      isPrimaryKey: false,
      name: 'enum name',
      nullable: false,
      optional: false,
      type: 'numeric',
      comment: 'comment',
      defaultValue: null,
    }
    const config = {
      schemaAsNamespace: false,
      typeMap: { },
      typeOverrides: { }
    } as Config
    vi.mocked(EnumTasks.generateEnumName).mockReturnValue('enum name')
    vi.mocked(SchemaTasks.generateSchemaName).mockReturnValue('schema name')
    const result = ColumnTasks.convertType(column, table, config, 'postgres')
    expect(result).toEqual('enum name')
  })
})