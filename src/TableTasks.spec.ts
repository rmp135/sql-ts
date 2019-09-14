import 'jasmine'
import * as TableTasks from './TableTasks';
import { Table } from './Typings'
const rewire = require('rewire')

let RewireTableTasks = rewire('./TableTasks')
const MockTableTasks: typeof TableTasks & typeof RewireTableTasks = <any> RewireTableTasks

describe('TableTasks', () => {
  describe('TableSubTasks', () => {
    describe('generateTableNames', () => {
      it('should generate the default table name', () => {
        const mockConfig = { }
        const result = MockTableTasks.generateInterfaceName('name', mockConfig)
        expect(result).toBe('nameEntity')
      })
      it('should generate a configuration supplied format', () => {
        const mockConfig = {
          interfaceNameFormat: '${table}Name'
        }
        const result = MockTableTasks.generateInterfaceName('name', mockConfig)
        expect(result).toBe('nameName')
      })
      it('should replace spaces with underscores', () => {
        const mockConfig = { }
        const result = MockTableTasks.generateInterfaceName('n a m e', mockConfig)
        expect(result).toBe('n_a_m_eEntity')
      })
      it('should convert to PascalCase', () => {
        const mockConfig = {
          interfaceNameFormat: 'PascalCase'
        }
        expect(MockTableTasks.generateInterfaceName('name_test', mockConfig)).toBe('NameTest')
        expect(MockTableTasks.generateInterfaceName('_special_case', mockConfig)).toBe('SpecialCase')
      })
      it('should convert to PascalCaseSingular', () => {
        const mockConfig = {
          interfaceNameFormat: 'PascalCaseSingular'
        }
        expect(MockTableTasks.generateInterfaceName('user_sessions', mockConfig)).toBe('UserSession')
        expect(MockTableTasks.generateInterfaceName('users', mockConfig)).toBe('User')
      })
    })
  
  })
  describe('getAllTables', () => {
    it('should return all tables from a database', (done) => {
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
        const mockConfig = {
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
        const mockConfig = { }
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