import 'jasmine'
import * as TableTasks from './TableTasks';
import { Table } from './Typings'
const rewire = require('rewire')

let RewireTableTasks = rewire('./TableTasks')
const MockTableTasks: typeof TableTasks & typeof RewireTableTasks = <any> RewireTableTasks

describe('TableTasks', () => {
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
            schema: 'table1schema'
          },
          {
            columns: ['column2', 'column3'],
            name: 'table2name',
            schema: 'table2schema'
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
            schema: 'table1schema'
          },
          {
            columns: ['column2', 'column3'],
            name: 'table2name',
            schema: 'table2schema'
          }
        ] as any)
        done()
      })
    })
  })
  describe('stringifyTable', () => {
    it('should return the table as a string', () => {
      const mockColumnTasks = {
        stringifyColumn: jasmine.createSpy('stringifyColumn').and.returnValues('column 1 string', 'column 2 string', 'column 3 string')
      }
      const mockTableSubTasks = {
        generateInterfaceName: jasmine.createSpy('generateInterfaceName').and.returnValue('interfacename')
      }
      MockTableTasks.__with__({
        ColumnTasks: mockColumnTasks,
        TableSubTasks: mockTableSubTasks
      })(() => {
        const mockTable = {
          name: 'tablename',
          columns: [1,2,3]
        }
        const mockConfig = {

        }
        const result = MockTableTasks.stringifyTable(mockTable as any, mockConfig as any)
        expect(mockColumnTasks.stringifyColumn.calls.argsFor(0)).toEqual([mockTable.columns[0], mockConfig])
        expect(mockColumnTasks.stringifyColumn.calls.argsFor(1)).toEqual([mockTable.columns[1], mockConfig])
        expect(mockColumnTasks.stringifyColumn.calls.argsFor(2)).toEqual([mockTable.columns[2], mockConfig])
        expect(result).toBe(`export interface interfacename { 
  column 1 string
  column 2 string
  column 3 string
}`)
      })
    })

    it('can create tables as classes', () => {
      const mockColumnTasks = {
        stringifyColumn: jasmine.createSpy('stringifyColumn').and.returnValues('column 1 string', 'column 2 string', 'column 3 string')
      }
      const mockTableSubTasks = {
        generateInterfaceName: jasmine.createSpy('generateInterfaceName').and.returnValue('interfacename')
      }
      MockTableTasks.__with__({
        ColumnTasks: mockColumnTasks,
        TableSubTasks: mockTableSubTasks
      })(() => {
        const mockTable = {
          name: 'tablename',
          columns: [1,2,3]
        }
        const mockConfig = {
          createClasses: true
        }
        const result = MockTableTasks.stringifyTable(mockTable as any, mockConfig as any)
        expect(result).toBe(`export class interfacename { 
  column 1 string
  column 2 string
  column 3 string
}`)
      })
    })

    it('accepts additional properties for definitions', () => {
      const mockColumnTasks = {
        stringifyColumn: jasmine.createSpy('stringifyColumn').and.returnValues('column 1 string')
      }
      const mockTableSubTasks = {
        generateInterfaceName: jasmine.createSpy('generateInterfaceName').and.returnValue('interfacename')
      }
      MockTableTasks.__with__({
        ColumnTasks: mockColumnTasks,
        TableSubTasks: mockTableSubTasks
      })(() => {
        const mockTable: Table = {
          name: 'tablename',
          columns: [{name: 'columnName', type: 'string', jsType: 'string', optional: true, nullable: true}],
          schema: 'schemaName'
        }
        const mockConfig = {
        }
        mockTable.additionalProperties = ['extra property']
        const result = MockTableTasks.stringifyTable(mockTable as any, mockConfig as any)
        expect(result).toBe(`export interface interfacename { 
  extra property

  column 1 string
}`)
      })
    })

    it('can be extended', () => {
      const mockColumnTasks = {
        stringifyColumn: jasmine.createSpy('stringifyColumn').and.returnValues('column 1 string')
      }
      const mockTableSubTasks = {
        generateInterfaceName: jasmine.createSpy('generateInterfaceName').and.returnValue('interfacename')
      }
      MockTableTasks.__with__({
        ColumnTasks: mockColumnTasks,
        TableSubTasks: mockTableSubTasks
      })(() => {
        const mockTable: Table = {
          name: 'tablename',
          columns: [{name: 'columnName', type: 'string', jsType: 'string', optional: true, nullable: true}],
          schema: 'schemaName',
          extends: 'testInterface'
        }
        const mockConfig = {
        }
        mockTable.additionalProperties = ['extra property']
        const result = MockTableTasks.stringifyTable(mockTable as any, mockConfig as any)
        expect(result).toBe(`export interface interfacename extends testInterface { 
  extra property

  column 1 string
}`)
      })
    })
  })
})