import 'jasmine'
import * as TableTasks from '../TableTasks'
import { Config, Table } from '../Typings'
import rewire from 'rewire'

const MockTableTasks = rewire<typeof TableTasks>('../TableTasks')

const defaultConfig: Config = {
  filename: 'Database',
  folder: '.',
  tables: [],
  excludedTables: [],
  schemas: [],
  interfaceNameFormat: '${table}Entity',
  additionalProperties: {},
  schemaAsNamespace: false
}

describe('TableTasks', () => {
  describe('generateInterfaceName', () => {
    it('should generate the default table name', (done) => {
      const mockConfig: Config = {
        interfaceNameFormat: '${table}Entity'
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newname')
      }
      MockTableTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockTableTasks.generateInterfaceName('name', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('name', undefined)
        expect(result).toBe('newnameEntity')
        done()
      })
    })
    it('should generate a configuration supplied format', (done) => {
      const mockConfig: Config = {
        interfaceNameFormat: '${table}Name'
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newname')
      }
      MockTableTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockTableTasks.generateInterfaceName('name', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('name', undefined)
        expect(result).toBe('newnameName')
        done()
      })
    })
    it('should replace spaces with underscores', (done) => {
      const mockConfig: Config = {
        interfaceNameFormat: '${table}Entity'
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newname')
      }
      MockTableTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockTableTasks.generateInterfaceName('n a m e', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('n_a_m_e', undefined)
        expect(result).toBe('newnameEntity')
        done()
      })
    })
    it('should convert to singular', (done) => {
      const mockConfig: Config = {
        singularTableNames: true,
        interfaceNameFormat: '${table}Entity'
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newnames')
      }
      MockTableTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockTableTasks.generateInterfaceName('names', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('names', undefined)
        expect(result).toBe('newnameEntity')
        done()
      })
    })
    it('should convert to singular with a different name', (done) => {
      const mockConfig: Config = {
        interfaceNameFormat: '${table}Name',
        singularTableNames: true
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newnames')
      }
      MockTableTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockTableTasks.generateInterfaceName('names', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('names', undefined)
        expect(result).toBe('newnameName')
        done()
      })
    })
  })
  describe('getAllTables', () => {
    it('should return all tables of a particular schema from a database', (done) => {
      const mockTables = [
        {
          name: 'table1name',
          schema: 'table1schema'
        },
        {
          name: 'table2name',
          schema: 'table2schema'
        }
      ]
      const mockAdapter = {
        getAllTables: jasmine.createSpy('getAllTables').and.returnValue(Promise.resolve(mockTables))
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockColumnTasks = {
        getColumnsForTable: jasmine.createSpy('getColumnsForTable').and.returnValues(Promise.resolve(['column1']), Promise.resolve(['column2', 'column3']))
      }
      const mockTableTasks = {
        generateInterfaceName: jasmine.createSpy('generateInterfaceName').and.returnValues('genint1name', 'genint2name'),
        getAdditionalProperties: jasmine.createSpy('getAdditionalProperties').and.returnValue([]),
        getExtends: jasmine.createSpy('getExtends').and.returnValue('')
      }
      MockTableTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnTasks: mockColumnTasks,
        TableTasks: mockTableTasks
      })(async () => {
        const mockDB = {
          client: {
            dialect: 'dialect'
          }
        }
        const mockConfig: Config = {
          ...defaultConfig,
          schemas: ['schema1']
        }
        const result = await MockTableTasks.getAllTables(mockDB as any, mockConfig)
        
        expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockDB, ['schema1'])
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledOnceWith('dialect')
        expect(mockTableTasks.generateInterfaceName.calls.argsFor(0)).toEqual(['table1name', mockConfig])
        expect(mockTableTasks.generateInterfaceName.calls.argsFor(1)).toEqual(['table2name', mockConfig])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(0)).toEqual([mockDB, mockTables[0], mockConfig])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(1)).toEqual([mockDB, mockTables[1], mockConfig])
        expect(result).toEqual([
          {
            columns: ['column1' as any],
            name: 'table1name',
            schema: 'table1schema',
            extends: '',
            interfaceName: 'genint1name',
            additionalProperties: []
          },
          {
            columns: ['column2' as any, 'column3' as any],
            name: 'table2name',
            schema: 'table2schema',
            extends: '',
            interfaceName: 'genint2name',
            additionalProperties: []
          }
        ] as Table[])
        done()
      })
    })
    it('should exclude tables when specified', (done) => {
      const mockTables = [
        {
          name: 'table1name',
          schema: 'table2schema'
        },
        {
          name: 'table2name',
          schema: 'table2schema'
        }
      ]
      const mockAdapter = {
        getAllTables: jasmine.createSpy('getAllTables').and.returnValue(Promise.resolve(mockTables))
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockColumnTasks = {
        getColumnsForTable: jasmine.createSpy('getColumnsForTable').and.returnValues(Promise.resolve(['column1']))
      }
      const mockTableTasks = {
        generateInterfaceName: jasmine.createSpy('generateInterfaceName').and.returnValues('genint1name', 'genint2name'),
        getAdditionalProperties: jasmine.createSpy('getAdditionalProperties').and.returnValue([]),
        getExtends: jasmine.createSpy('getExtends').and.returnValue('')
      }
      MockTableTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnTasks: mockColumnTasks,
        TableTasks: mockTableTasks
      })(async () => {
        const mockDB = {
          client: {
            dialect: 'dialect'
          }
        }
        const mockConfig: Config = {
          ...defaultConfig,
          excludedTables: ['table2schema.table2name']
        }
        const result = await MockTableTasks.getAllTables(mockDB as any, mockConfig)
        
        expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockDB, [])
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledOnceWith('dialect')
        expect(mockTableTasks.generateInterfaceName.calls.argsFor(0)).toEqual(['table1name', mockConfig])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(0)).toEqual([mockDB, mockTables[0], mockConfig])
        expect(result).toEqual([
          {
            columns: ['column1' as any],
            name: 'table1name',
            schema: 'table2schema',
            extends: '',
            interfaceName: 'genint1name',
            additionalProperties: []
          }
        ] as Table[])
        done()
      })
    })
    it('should include then exclude tables when specified', (done) => {
      const mockTables = [
        {
          name: 'table2name',
          schema: 'schema'
        },
        {
          name: 'table3name',
          schema: 'schema'
        },
        {
          name: 'table4name',
          schema: 'schema'
        },
        {
          name: 'table5name',
          schema: 'schema'
        },
      ]
      const mockAdapter = {
        getAllTables: jasmine.createSpy('getAllTables').and.returnValue(Promise.resolve(mockTables))
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockColumnTasks = {
        getColumnsForTable: jasmine.createSpy('getColumnsForTable').and.returnValues(Promise.resolve(['column1']))
      }
      const mockTableTasks = {
        generateInterfaceName: jasmine.createSpy('generateInterfaceName').and.returnValues('genint1name', 'genint2name'),
        getAdditionalProperties: jasmine.createSpy('getAdditionalProperties').and.returnValue([]),
        getExtends: jasmine.createSpy('getExtends').and.returnValue('')
      }
      MockTableTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnTasks: mockColumnTasks,
        TableTasks: mockTableTasks
      })(async () => {
        const mockDB = {
          client: {
            dialect: 'dialect'
          }
        }
        const mockConfig: Config = {
          ...defaultConfig,
          tables: ['schema.table2name', 'schema.table3name'],
          excludedTables: ['schema.table2name']
        }
        const result = await MockTableTasks.getAllTables(mockDB as any, mockConfig)
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledOnceWith('dialect')
        expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockDB, [])
        expect(mockTableTasks.generateInterfaceName.calls.argsFor(0)).toEqual(['table3name', mockConfig])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(0)).toEqual([mockDB, mockTables[1], mockConfig])
        expect(result).toEqual([
          {
            columns: ['column1'] as any[],
            interfaceName: 'genint1name',
            name: 'table3name',
            schema: 'schema',
            extends: '',
            additionalProperties: []
          }
        ] as Table[])
        done()
      })
    })
    it('should revert to all schemas if none are provided', (done) => {
      const mockTables = [
        {
          name: 'table1name',
          schema: 'table1schema'
        },
        {
          name: 'table2name',
          schema: 'table2schema'
        }
      ]
      const mockAdapter = {
        getAllTables: jasmine.createSpy('getAllTables').and.returnValue(Promise.resolve(mockTables))
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockColumnTasks = {
        getColumnsForTable: jasmine.createSpy('getColumnsForTable').and.returnValues(Promise.resolve(['column1']), Promise.resolve(['column2', 'column3']))
      }
      const mockTableTasks = {
        generateInterfaceName: jasmine.createSpy('generateInterfaceName').and.returnValues('genint1name', 'genint2name'),
        getAdditionalProperties: jasmine.createSpy('getAdditionalProperties').and.returnValue([]),
        getExtends: jasmine.createSpy('getExtends').and.returnValue('')
      }
      MockTableTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnTasks: mockColumnTasks,
        TableTasks: mockTableTasks
      })(async () => {
        const mockDB = {
          client: {
            dialect: 'dialect'
          }
        }
        const mockConfig: Config = defaultConfig
        const result = await MockTableTasks.getAllTables(mockDB as any, mockConfig)
        expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockDB, [])
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledOnceWith('dialect')
        expect(mockTableTasks.generateInterfaceName.calls.argsFor(0)).toEqual(['table1name', mockConfig])
        expect(mockTableTasks.generateInterfaceName.calls.argsFor(1)).toEqual(['table2name', mockConfig])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(0)).toEqual([mockDB, mockTables[0], mockConfig])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(1)).toEqual([mockDB, mockTables[1], mockConfig])
        expect(result).toEqual([
          {
            columns: ['column1'],
            name: 'table1name',
            schema: 'table1schema',
            interfaceName: 'genint1name',
            extends: '',
            additionalProperties: []
          },
          {
            columns: ['column2', 'column3'] as any[],
            name: 'table2name',
            interfaceName: 'genint2name',
            schema: 'table2schema',
            extends: '',
            additionalProperties: []
          }
        ] as Table[])
        done()
      })
    })
  })
  describe('getAdditionalProperties', () => {
    it('should return empty properties when none are specified', () => {
      var result = TableTasks.getAdditionalProperties('table', 'schema', defaultConfig)
      expect(result).toEqual([])
    })
    it('should return the properties associated with the full name of the table', () => {
      const mockConfig: Config = {
        ...defaultConfig,
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
        ...defaultConfig,
        extends: {
          'schema.table': 'extend me',
          'schema2.table': 'not me'
        }
      }
      var result = TableTasks.getExtends('table', 'schema', mockConfig)
      expect(result).toEqual('extend me')
    })
  })
})