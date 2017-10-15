import * as DatabaseTasks from './DatabaseTasks';
const rewire = require('rewire')

let RewireDatabaseTasks = rewire('./DatabaseTasks')
const MockDatabaseTasks: typeof DatabaseTasks & typeof RewireDatabaseTasks = <any> RewireDatabaseTasks

describe('DatabaseTasks', () => {
  describe('stringifyDatabase', () => {
    it('should stringify the tables when namespaces should not be exported', () => {
      const mockTableTasks = {
        stringifyTable: jasmine.createSpy('stringifyTable').and.returnValues('first table string', 'second table string', 'third table string')
      }
      MockDatabaseTasks.__with__({
        TableTasks: mockTableTasks
      })(() => {
        const mockDatabase = {
          tables: [1,2,3]
        }
        const mockConfig = {}
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(result).toBe('first table string\n\nsecond table string\n\nthird table string')
        expect(mockTableTasks.stringifyTable.calls.argsFor(0)).toEqual([1, mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(1)).toEqual([2, mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(2)).toEqual([3, mockConfig])
      })
    })
    it('should stringify the tables and namespaces', () => {
      const mockTableTasks = {
        stringifyTable: jasmine.createSpy('stringifyTable').and.returnValues('first table string', 'second table string', 'third table string')
      }
      MockDatabaseTasks.__with__({
        TableTasks: mockTableTasks
      })(() => {
        const mockDatabase = {
          tables: [
          {
            schema: 'schema1'
          },{
            schema: 'schema1'
          },{
            schema: 'schema2'
          }]
        }
        const mockConfig = {
          schemaAsNamespace: true
        }
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(result).toBe(`export namespace schema1 {
  first table string

  second table string
}

export namespace schema2 {
  third table string
}`)
        expect(mockTableTasks.stringifyTable.calls.argsFor(0)).toEqual([mockDatabase.tables[0], mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(1)).toEqual([mockDatabase.tables[1], mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(2)).toEqual([mockDatabase.tables[2], mockConfig])
      })
    })
  })
})