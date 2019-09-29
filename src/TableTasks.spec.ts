import 'jasmine'
import * as TableTasks from './TableTasks'
import { Config } from './Typings'
const rewire = require('rewire')

let RewireTableTasks = rewire('./TableTasks')
const MockTableTasks: typeof TableTasks & typeof RewireTableTasks = <any> RewireTableTasks

describe('TableTasks', () => {
  describe('generateInterfaceName', () => {
    it('should generate the default table name', (done) => {
      const mockConfig: Config = { }
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
      const mockConfig: Config = { }
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
      MockTableTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnTasks: mockColumnTasks
      })(async () => {
        const mockDB = {}
        const mockConfig: Config = {
          schemas: ['schema1']
        }
        const result = await MockTableTasks.getAllTables(mockDB as any, mockConfig)
        expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockDB, ['schema1'])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(0)).toEqual([mockDB, mockTables[0], mockConfig])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(1)).toEqual([mockDB, mockTables[1], mockConfig])
        expect(result).toEqual([
          {
            columns: ['column1'],
            name: 'table1name',
            schema: 'table1schema',
            extends: '',
            additionalProperties: []
          },
          {
            columns: ['column2', 'column3'],
            name: 'table2name',
            schema: 'table2schema',
            extends: '',
            additionalProperties: []
          }
        ] as any)
        done()
      })
    })
    it('should exclude tables when specified', (done) => {
      const mockTables = [
        {
          name: 'table2name',
          schema: 'table2schema'
        },
        {
          name: 'table3name',
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
      MockTableTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnTasks: mockColumnTasks
      })(async () => {
        const mockDB = {}
        const mockConfig: Config = {
          schemas: ['table2schema'],
          excludedTables: ['table2schema.table2name']
        }
        const result = await MockTableTasks.getAllTables(mockDB as any, mockConfig)
        expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockDB, ['table2schema'])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(0)).toEqual([mockDB, mockTables[1], mockConfig])
        expect(result).toEqual([
          {
            columns: ['column1'],
            name: 'table3name',
            schema: 'table2schema',
            extends: '',
            additionalProperties: []
          }
        ] as any)
        done()
      })
    })
    it('should include tables when specified', (done) => {
      const mockTables = [
        {
          name: 'table2name',
          schema: 'table2schema'
        },
        {
          name: 'table3name',
          schema: 'table2schema'
        },
        {
          name: 'table4name',
          schema: 'table2schema'
        },
        {
          name: 'table5name',
          schema: 'table2schema'
        },
      ]
      const mockAdapter = {
        getAllTables: jasmine.createSpy('getAllTables').and.returnValue(Promise.resolve(mockTables))
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockColumnTasks = {
        getColumnsForTable: jasmine.createSpy('getColumnsForTable').and.returnValues(Promise.resolve(['column1']), Promise.resolve(['column2']))
      }
      MockTableTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnTasks: mockColumnTasks
      })(async () => {
        const mockDB = {}
        const mockConfig: Config = {
          tables: ['table2schema.table2name', 'table2schema.table3name']
        }
        const result = await MockTableTasks.getAllTables(mockDB as any, mockConfig)
        expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockDB, [])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(0)).toEqual([mockDB, mockTables[0], mockConfig])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(1)).toEqual([mockDB, mockTables[1], mockConfig])
        expect(result).toEqual([
          {
            columns: ['column1'],
            name: 'table2name',
            schema: 'table2schema',
            extends: '',
            additionalProperties: []
          },
          {
            columns: ['column2'],
            name: 'table3name',
            schema: 'table2schema',
            extends: '',
            additionalProperties: []
          }
        ] as any)
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
        getColumnsForTable: jasmine.createSpy('getColumnsForTable').and.returnValues(Promise.resolve(['column2']))
      }
      MockTableTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnTasks: mockColumnTasks
      })(async () => {
        const mockDB = {}
        const mockConfig: Config = {
          tables: ['schema.table2name', 'schema.table3name'],
          excludedTables: ['schema.table2name']
        }
        const result = await MockTableTasks.getAllTables(mockDB as any, mockConfig)
        expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockDB, [])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(0)).toEqual([mockDB, mockTables[1], mockConfig])
        expect(result).toEqual([
          {
            columns: ['column2'],
            name: 'table3name',
            schema: 'schema',
            extends: '',
            additionalProperties: []
          }
        ] as any)
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
      MockTableTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnTasks: mockColumnTasks
      })(async () => {
        const mockDB = {}
        const mockConfig: Config = { }
        const result = await MockTableTasks.getAllTables(mockDB as any, mockConfig)
        expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockDB, [])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(0)).toEqual([mockDB, mockTables[0], mockConfig])
        expect(mockColumnTasks.getColumnsForTable.calls.argsFor(1)).toEqual([mockDB, mockTables[1], mockConfig])
        expect(result).toEqual([
          {
            columns: ['column1'],
            name: 'table1name',
            schema: 'table1schema',
            extends: '',
            additionalProperties: []
          },
          {
            columns: ['column2', 'column3'],
            name: 'table2name',
            schema: 'table2schema',
            extends: '',
            additionalProperties: []
          }
        ] as any)
        done()
      })
    })
  })
})