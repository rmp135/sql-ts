import 'jasmine'
import * as ColumnTasks from '../ColumnTasks'
import { Column, Config } from '../Typings'
import { ColumnDefinition, TableDefinition } from '../Adapters/AdapterInterface'
import rewire from 'rewire'

const MockColumnTasks = rewire<typeof ColumnTasks>('../ColumnTasks')

describe('ColumnTasks', () => {
  describe('getColumnsForTable', () => {
    it('should return all columns for a table', (done) => {
      const mockColumns: ColumnDefinition[] = [
        {
          nullable: false,
          name: 'cname',
          type: 'ctype',
          optional: false,
          isEnum: false,
          isPrimaryKey: true,
          comment: 'cname comment'
        }
      ]
      const mockAdapter = {
        getAllColumns: jasmine.createSpy('getAllColumns').and.returnValue(mockColumns)
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newname'),
      }
      const mockConvertType = jasmine.createSpy('convertType').and.returnValue('newType')
      const mockGetOptionality = jasmine.createSpy('getOptionality').and.returnValue(false)
      MockColumnTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        SharedTasks: mockSharedTasks,
        convertType: mockConvertType,
        getOptionality: mockGetOptionality
      })(async () => {
        const db = {
          client: {
            dialect: 'dialect'
          }
        }
        const table = {
          name: 'name',
          schema: 'schema'
        }
        const config: Config = {
          dialect: 'configDialect',
          columnNameCasing: 'camel'
        }
        const result = await MockColumnTasks.getColumnsForTable(db as any, table as TableDefinition, config)
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith('dialect')
        expect(mockAdapter.getAllColumns).toHaveBeenCalledWith(db, config, 'name', 'schema')
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('cname', 'camel')
        expect(mockConvertType).toHaveBeenCalledWith(mockColumns[0], table, config, 'dialect')
        expect(mockGetOptionality).toHaveBeenCalledWith(mockColumns[0], table, config)
        expect(result).toEqual([
          {
            nullable: false,
            name: 'cname',
            propertyName: 'newname',
            propertyType: 'newType',
            type: 'ctype',
            optional: false,
            isEnum: false,
            isPrimaryKey: true,
            comment: 'cname comment'
          } as Column
        ])
        done()
      })
    })
  })
  describe('generateFullColumnName', () => {
    it('should generate a name with a schema', () => {
      const result = MockColumnTasks.generateFullColumnName('table', 'schema', 'column')
      expect(result).toBe('schema.table.column')
    })
    it('should skip schema if blank', () => {
      const result = MockColumnTasks.generateFullColumnName('table', '', 'column')
      expect(result).toBe('table.column')
    })
    it('should skip schema if null', () => {
      const result = MockColumnTasks.generateFullColumnName('table', null, 'column')
      expect(result).toBe('table.column')
    })
  })
  describe('getOptionality', () => {
    it('should return false if optionality is set to required', () => {
      const mockColumn: ColumnDefinition = {
        isEnum: true,
        isPrimaryKey: false,
        name: 'enum name',
        nullable: false,
        optional: false,
        type: 'enum type',
        comment: 'comment'
      }
      const mockConfig: Config = {
        globalOptionality: 'required',
        columnOptionality: {}
      }
      const mockTable: any = {}
      const result = MockColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
      expect(result).toEqual(false)
    })
    it('should return true if optionality is set to optional', () => {
      const mockColumn: ColumnDefinition = {
        isEnum: true,
        isPrimaryKey: false,
        name: 'enum name',
        nullable: false,
        optional: true,
        type: 'enum type',
        comment: 'comment'
      }
      const mockConfig: Config = {
        globalOptionality: 'optional',
        columnOptionality: {}
      }
      const mockTable: any = {}
      const result = MockColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
      expect(result).toEqual(true)
    })
    it('should return true if optionality is dynamic and column is optional', () => {
      const mockColumn: ColumnDefinition = {
        isEnum: true,
        isPrimaryKey: false,
        name: 'enum name',
        nullable: false,
        optional: true,
        type: 'enum type',
        comment: 'comment'
      }
      const mockConfig: Config = {
        globalOptionality: 'dynamic',
        columnOptionality: {}
      }
      const mockTable: any = {}
      const result = MockColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
      expect(result).toEqual(true)
    })
    it('should return false if optionality is dynamic and column is not optional', () => {
      const mockColumn: ColumnDefinition = {
        isEnum: true,
        isPrimaryKey: false,
        name: 'enum name',
        nullable: false,
        optional: false,
        type: 'enum type',
        comment: 'comment'
      }
      const mockConfig: Config = {
        globalOptionality: 'dynamic',
        columnOptionality: {}
      }
      const mockTable: any = {}
      const result = MockColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
      expect(result).toEqual(false)
    })
    it('should return false if column name matches and optionality is required', () => {
      const mockColumn: ColumnDefinition = {
        isEnum: true,
        isPrimaryKey: false,
        name: 'columnname',
        nullable: false,
        optional: false,
        type: 'enum type',
        comment: 'comment'
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
      const result = MockColumnTasks.getOptionality(mockColumn, mockTable, mockConfig)
      expect(result).toEqual(false)
    })
  })
  describe('convertType', () => {
    it('should call convertEnumType if the type is an enum', () => {
      const mockConvertEnumType = jasmine.createSpy('convertEnumType').and.returnValue('convertedEnumName')
      MockColumnTasks.__with__({
        convertEnumType: mockConvertEnumType
      })(() => {
        const mockColumn: ColumnDefinition = {
          isEnum: true,
          isPrimaryKey: false,
          name: 'enum name',
          nullable: false,
          optional: false,
          type: 'enum type',
          comment: 'comment'
        }
        const mockTable = {}
        const mockConfig = {}
        const result = MockColumnTasks.convertType(mockColumn, mockTable as any, mockConfig, 'dialect')
        expect(mockConvertEnumType).toHaveBeenCalledOnceWith(mockColumn, mockConfig)
        expect(result).toEqual('convertedEnumName')
      })
    })
    it('should use the built global types when no specific client exists', () => {
      const mockSharedTasks = {
        resolveAdapterName: jasmine.createSpy('resolveAdapterName').and.returnValue('adapterName')
      }
      const mockGenerateFullColumnName = jasmine.createSpy('generateFullColumnName').and.returnValue('fullcolumn')
      MockColumnTasks.__with__({
        TypeMap_1: {
          default: {
            global: {
              'globaltype': ['tofind']
            }
          }
        },
        SharedTasks: mockSharedTasks,
        generateFullColumnName: mockGenerateFullColumnName
      })(() => {
        const mockTable = {
          schema: 'schema',
          name: 'table',
          comment: 'comment'
        }
        const mockColumn: ColumnDefinition = {
          isEnum: false,
          name: 'column',
          type: 'tofind',
          isPrimaryKey: false,
          nullable: false,
          optional: false,
          comment: 'comment'
        }
        const mockConfig: Config = {
          typeOverrides: { },
          typeMap: { }
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, mockConfig, 'dialect')
        expect(mockGenerateFullColumnName).toHaveBeenCalledOnceWith('table', 'schema', 'column')
        expect(mockSharedTasks.resolveAdapterName).toHaveBeenCalledOnceWith('dialect')
        expect(result).toBe('globaltype')
      })
    })
    it('should use the built in types for a specific client', (done) => {
      const mockSharedTasks = {
        resolveAdapterName: jasmine.createSpy('resolveAdapterName').and.returnValue('adapterName')
      }
      const mockGenerateFullColumnName = jasmine.createSpy('generateFullColumnName').and.returnValue('fullcolumn')
      MockColumnTasks.__with__({
        TypeMap_1: {
          default: {
            adapterName: {
              'type': ['tofind']
            }
          }
        },
        SharedTasks: mockSharedTasks,
        generateFullColumnName: mockGenerateFullColumnName
      })(() => {
        const mockTable = {
          schema: 'schema',
          name: 'table',
          comment: 'comment'
        }
        const mockColumn = {
          isEnum: false,
          name: 'column',
          type: 'tofind',
          isPrimaryKey: false,
          nullable: false,
          optional: false,
          comment: 'comment'
        }
        const mockConfig: Config = {
          typeOverrides: { },
          typeMap: { }
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, mockConfig, 'dialect')
        expect(mockSharedTasks.resolveAdapterName).toHaveBeenCalledOnceWith('dialect')
        expect(mockGenerateFullColumnName).toHaveBeenCalledOnceWith('table', 'schema', 'column')
        expect(result).toBe('type')
        done()
      })
    })
    it('should use the user type map if available', () => {
      const mockGenerateFullColumnName = jasmine.createSpy('generateFullColumnName').and.returnValue('fullcolumn')
      MockColumnTasks.__with__({
        generateFullColumnName: mockGenerateFullColumnName
      })(() => {
        const mockTable = {
          name: 'tableName',
          schema: 'schema',
          comment: 'comment'
        }
        const mockColumn: ColumnDefinition = {
          name: 'tofind',
          type: 'ctype',
          isEnum: false,
          isPrimaryKey: false,
          nullable: false,
          optional: false,
          comment: 'comment'
        }
        const mockConfig: Config = {
          typeMap: {
            type: ['ctype']
          },
          typeOverrides: { }
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, mockConfig, 'dialect')
        expect(mockGenerateFullColumnName).toHaveBeenCalledOnceWith('tableName', 'schema', 'tofind')
        expect(result).toBe('type')
      })
    })
    it('should use the user type map even if available in the global map', () => {
      MockColumnTasks.__with__({
        TypeMap_1: {
          default: {
            'globaltype': ['ctype']
          }
        }
      })(() => {
        const mockTable = {
          name: 'tableName',
          schema: 'schema',
          comment: 'comment'
        }
        const mockColumn = {
          name: 'column',
          type: 'ctype',
          isEnum: false,
          isPrimaryKey: false,
          nullable: false,
          optional: false,
          comment: 'comment'
        }
        const mockConfig: Config = {
          typeMap: {
            type: ['ctype']
          },
          typeOverrides: { }
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, mockConfig, 'dialect')
        expect(result).toBe('type')
      })
    })
    it('should use a type override if available', () => {
      MockColumnTasks.__with__({
      })(() => {
        const mockTable = {
          name: 'tableName',
          schema: 'schema',
          comment: 'comment'
        }
        const mockColumn: ColumnDefinition = {
          name: 'cname',
          type: 'ctype',
          isEnum: false,
          isPrimaryKey: false,
          nullable: false,
          optional: false,
          comment: 'comment'
        }
        const mockConfig = {
          typeOverrides: {
            'schema.tableName.cname': 'type'
          }
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, mockConfig, 'dialect')
        expect(result).toBe('type')
      })
    })
    it('should use the type override if available in the other maps', () => {
      MockColumnTasks.__with__({
        TypeMap_1: {
          default: {
            'globaltype': ['ctype']
          }
        }
      })(() => {
        const mockTable = {
          name: 'tableName',
          schema: 'schema',
          comment: 'comment'
        }
        const mockColumn = {
          name: 'column',
          type: 'ctype',
          isEnum: false,
          isPrimaryKey: false,
          nullable: false,
          optional: false,
          comment: 'comment'
        }
        const mockConfig = {
          typeOverrides: { 'schema.tableName.column': 'overridetype' },
          typeMap: { usertype: ['ctype'] }
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, mockConfig, 'dialect')
        expect(result).toBe('overridetype')
      })
    })
    it('should use any if no override exists', () => {
      const mockGenerateFullColumnName = jasmine.createSpy('generateFullColumnName').and.returnValue('fullcolumn')
      const mockSharedTasks = {
        resolveAdapterName: jasmine.createSpy('resolveAdapterName').and.returnValue('adapter')
      }
      const mockConfig: Config = {
        typeMap: { },
        typeOverrides: {
          'columnname1': 'type'
        }
      }
      MockColumnTasks.__with__({
        TypeMap_1: {
          default: {
            global: {
              'type': ['tofind1']
            }
          }
        },
        SharedTasks: mockSharedTasks,
        generateFullColumnName: mockGenerateFullColumnName
      })(() => {
        const mockTable = {
          name: 'table',
          schema: 'schema',
          comment: 'comment'
        }
        const mockColumn: ColumnDefinition = {
          name: 'column',
          isEnum: false,
          type: 'type',
          isPrimaryKey: false,
          nullable: false,
          optional: false,
          comment: 'comment'
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, mockConfig, 'dialect')
        expect(mockGenerateFullColumnName).toHaveBeenCalledOnceWith('table', 'schema', 'column')
        expect(mockSharedTasks.resolveAdapterName).toHaveBeenCalledOnceWith('dialect')
        expect(result).toBe('any')
      })
    })
  })
  describe('convertEnumType', () => {
    it('should add the schema if the setting is enabled and schema is provided', () => {
      const mockEnumTasks = {
        generateEnumName: jasmine.createSpy('generateEnumName').and.returnValue('genEnumName')
      }
      const mockSchemaTasks = {
        generateSchemaName: jasmine.createSpy('generateSchemaName').and.returnValue('genSchemaName')
      }
      MockColumnTasks.__with__({
        EnumTasks: mockEnumTasks,
        SchemaTasks: mockSchemaTasks
      })(() => {
        const mockColumn: ColumnDefinition = {
          isEnum: true,
          isPrimaryKey: false,
          name: 'enum name',
          nullable: false,
          optional: false,
          type: 'enum type',
          enumSchema: 'enum schema',
          comment: 'comment'
        }
        const mockConfig = {
          schemaAsNamespace: true
        } as Config
        const result = MockColumnTasks.convertEnumType(mockColumn, mockConfig)
        expect(mockEnumTasks.generateEnumName).toHaveBeenCalledOnceWith('enum type', mockConfig)
        expect(mockSchemaTasks.generateSchemaName).toHaveBeenCalledOnceWith('enum schema')
        expect(result).toEqual('genSchemaName.genEnumName')
      })
    })
    it('should not add a schema if the schema is null and setting is disabled', () => {
      const mockEnumTasks = {
        generateEnumName: jasmine.createSpy('generateEnumName').and.returnValue('genEnumName')
      }
      const mockSchemaTasks = {
        generateSchemaName: jasmine.createSpy('generateSchemaName')
      }
      MockColumnTasks.__with__({
        EnumTasks: mockEnumTasks,
        SchemaTasks: mockSchemaTasks
      })(() => {
        const mockColumn: ColumnDefinition = {
          isEnum: true,
          isPrimaryKey: false,
          name: 'enum name',
          nullable: false,
          optional: false,
          type: 'enum type',
          comment: 'enum comment',
        }
        const mockConfig = {
          schemaAsNamespace: true
        } as Config
        const result = MockColumnTasks.convertEnumType(mockColumn, mockConfig)
        expect(mockEnumTasks.generateEnumName).toHaveBeenCalledOnceWith('enum type', mockConfig)
        expect(mockSchemaTasks.generateSchemaName).not.toHaveBeenCalled()
        expect(result).toEqual('genEnumName')
      })
    })
    it('should not add the schem if schema is not null and setting is disabled', () => {
      const mockEnumTasks = {
        generateEnumName: jasmine.createSpy('generateEnumName').and.returnValue('genEnumName')
      }
      const mockSchemaTasks = {
        generateSchemaName: jasmine.createSpy('generateSchemaName')
      }
      MockColumnTasks.__with__({
        EnumTasks: mockEnumTasks,
        SchemaTasks: mockSchemaTasks
      })(() => {
        const mockColumn: ColumnDefinition = {
          isEnum: true,
          isPrimaryKey: false,
          name: 'enum name',
          nullable: false,
          optional: false,
          type: 'enum type',
          enumSchema: 'enum schema',
          comment: 'enum comment'
        }
        const mockConfig = {
          schemaAsNamespace: false
        } as Config
        const result = MockColumnTasks.convertEnumType(mockColumn, mockConfig)
        expect(mockEnumTasks.generateEnumName).toHaveBeenCalledOnceWith('enum type', mockConfig)
        expect(mockSchemaTasks.generateSchemaName).not.toHaveBeenCalled()
        expect(result).toEqual('genEnumName')
      })
    })
    it('should not add the schema if schema is null and setting is enabled', () => {
      const mockEnumTasks = {
        generateEnumName: jasmine.createSpy('generateEnumName').and.returnValue('genEnumName')
      }
      const mockSchemaTasks = {
        generateSchemaName: jasmine.createSpy('generateSchemaName')
      }
      MockColumnTasks.__with__({
        EnumTasks: mockEnumTasks,
        SchemaTasks: mockSchemaTasks
      })(() => {
        const mockColumn: ColumnDefinition = {
          isEnum: true,
          isPrimaryKey: false,
          name: 'enum name',
          nullable: false,
          optional: false,
          type: 'enum type',
          comment: 'comment'
        }
        const mockConfig = {
          schemaAsNamespace: false
        } as Config
        const result = MockColumnTasks.convertEnumType(mockColumn, mockConfig)
        expect(mockEnumTasks.generateEnumName).toHaveBeenCalledOnceWith('enum type', mockConfig)
        expect(mockSchemaTasks.generateSchemaName).not.toHaveBeenCalled()
        expect(result).toEqual('genEnumName')
      })
    })
  })
})