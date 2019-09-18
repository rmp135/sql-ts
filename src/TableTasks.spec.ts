import 'jasmine'
import * as TableTasks from './TableTasks'
import { Config } from './Typings'
const rewire = require('rewire')

let RewireTableTasks = rewire('./TableTasks')
const MockTableTasks: typeof TableTasks & typeof RewireTableTasks = <any> RewireTableTasks

describe('TableTasks', () => {
  describe('TableSubTasks', () => {
    describe('generateTableNames', () => {
      it('should generate the default table name', () => {
        const mockConfig: Config = { }
        const result = MockTableTasks.generateInterfaceName('name', mockConfig)
        expect(result).toBe('nameEntity')
      })
      it('should generate a configuration supplied format', () => {
        const mockConfig: Config = {
          interfaceNameFormat: '${table}Name'
        }
        const result = MockTableTasks.generateInterfaceName('name', mockConfig)
        expect(result).toBe('nameName')
      })
      it('should replace spaces with underscores', () => {
        const mockConfig: Config = { }
        const result = MockTableTasks.generateInterfaceName('n a m e', mockConfig)
        expect(result).toBe('n_a_m_eEntity')
      })
      it('should convert to PascalCase', () => {
        const mockConfig: Config = {
          pascalTableNames: true
        }
        expect(MockTableTasks.generateInterfaceName('name_test', mockConfig)).toBe('NameTestEntity')
        expect(MockTableTasks.generateInterfaceName('_special_case', mockConfig)).toBe('SpecialCaseEntity')
        expect(MockTableTasks.generateInterfaceName('special_case_', mockConfig)).toBe('SpecialCaseEntity')
      })
      it('should convert to PascalCase with spaces', () => {
        const mockConfig: Config = {
          pascalTableNames: true
        }
        expect(MockTableTasks.generateInterfaceName('name test', mockConfig)).toBe('NameTestEntity')
        expect(MockTableTasks.generateInterfaceName('special case', mockConfig)).toBe('SpecialCaseEntity')
      })
      it('should convert to PascalCase with a different name', () => {
        const mockConfig: Config = {
          interfaceNameFormat: '${table}Name',
          pascalTableNames: true
        }
        expect(MockTableTasks.generateInterfaceName('name_test', mockConfig)).toBe('NameTestName')
        expect(MockTableTasks.generateInterfaceName('_special_case', mockConfig)).toBe('SpecialCaseName')
        expect(MockTableTasks.generateInterfaceName('special_case_', mockConfig)).toBe('SpecialCaseName')
      })
      it('should convert to singular', () => {
        const mockConfig: Config = {
          singularTableNames: true
        }
        expect(MockTableTasks.generateInterfaceName('UserSessions', mockConfig)).toBe('UserSessionEntity')
        expect(MockTableTasks.generateInterfaceName('UserSession', mockConfig)).toBe('UserSessionEntity')
      })
      it('should convert to singular with a different name', () => {
        const mockConfig: Config = {
          interfaceNameFormat: '${table}Name',
          singularTableNames: true
        }
        expect(MockTableTasks.generateInterfaceName('UserSessions', mockConfig)).toBe('UserSessionName')
        expect(MockTableTasks.generateInterfaceName('UserSession', mockConfig)).toBe('UserSessionName')
      })
      it('should convert to singular and PascalCase', () => {
        const mockConfig: Config = {
          pascalTableNames: true,
          singularTableNames: true
        }
        expect(MockTableTasks.generateInterfaceName('name_tests', mockConfig)).toBe('NameTestEntity')
        expect(MockTableTasks.generateInterfaceName('_special_cases', mockConfig)).toBe('SpecialCaseEntity')
        expect(MockTableTasks.generateInterfaceName('special_cases_', mockConfig)).toBe('SpecialCaseEntity')
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
    it('should filter tables when specified', (done) => {
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