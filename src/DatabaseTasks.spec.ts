import 'jasmine'
import * as DatabaseTasks from './DatabaseTasks';
const rewire = require('rewire')

let RewireDatabaseTasks = rewire('./DatabaseTasks')
const MockDatabaseTasks: typeof DatabaseTasks & typeof RewireDatabaseTasks = <any> RewireDatabaseTasks

describe('DatabaseTasks', () => {
  describe('stringifyDatabase', () => {
    it('should stringify the tables without namespaces', () => {
      const mockTableTasks = {
        stringifyTable: jasmine.createSpy('stringifyTable').and.returnValues('first table string', 'second table string', 'third table string')
      }
      MockDatabaseTasks.__with__({
        TableTasks: mockTableTasks
      })(() => {
        const mockDatabase = {
          tables: [1,2,3],
          enums: []
        }
        const mockConfig = {}
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(result).toBe('first table string\n\nsecond table string\n\nthird table string\n\n')
        expect(mockTableTasks.stringifyTable.calls.argsFor(0)).toEqual([1, mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(1)).toEqual([2, mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(2)).toEqual([3, mockConfig])
      })
    })
    it('should stringify the enums without namespaces', () => {
      const mockEnumTasks = {
        stringifyEnum: jasmine.createSpy('stringifyEnum').and.returnValues('first enum string', 'second enum string', 'third enum string')
      }
      MockDatabaseTasks.__with__({
        EnumTasks: mockEnumTasks
      })(() => {
        const mockDatabase = {
          tables: [],
          enums: [1,2,3]
        }
        const mockConfig = {}
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(result).toBe('\n\nfirst enum string\n\nsecond enum string\n\nthird enum string')
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(0)).toEqual([1, mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(1)).toEqual([2, mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(2)).toEqual([3, mockConfig])
      })
    })
    it('should stringify the tables and enums without namespaces', () => {
      const mockTableTasks = {
        stringifyTable: jasmine.createSpy('stringifyTable').and.returnValues('first table string', 'second table string', 'third table string')
      }
      const mockEnumTasks = {
        stringifyEnum: jasmine.createSpy('stringifyEnum').and.returnValues('first enum string', 'second enum string', 'third enum string')
      }
      MockDatabaseTasks.__with__({
        EnumTasks: mockEnumTasks,
        TableTasks: mockTableTasks
      })(() => {
        const mockDatabase = {
          tables: [1,2,3],
          enums: [4,5,6]
        }
        const mockConfig = {}
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(result).toBe('first table string\n\nsecond table string\n\nthird table string\n\nfirst enum string\n\nsecond enum string\n\nthird enum string')
        expect(mockTableTasks.stringifyTable.calls.argsFor(0)).toEqual([1, mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(1)).toEqual([2, mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(2)).toEqual([3, mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(0)).toEqual([4, mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(1)).toEqual([5, mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(2)).toEqual([6, mockConfig])
      })
    })
    it('should stringify the tables with namespaces', () => {
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
          }],
          enums: []
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
    it('should stringify the tables and enums with namespaces', () => {
      const mockTableTasks = {
        stringifyTable: jasmine.createSpy('stringifyTable').and.returnValues('first table string', 'second table string', 'third table string')
      }
      const mockEnumTasks = {
        stringifyEnum: jasmine.createSpy('stringifyEnum').and.returnValues('first enum string', 'second enum string', 'third enum string')
      }
      MockDatabaseTasks.__with__({
        TableTasks: mockTableTasks,
        EnumTasks: mockEnumTasks
      })(() => {
        const mockDatabase = {
          tables: [{
            schema: 'schema1'
          },{
            schema: 'schema2'
          },{
            schema: 'schema3'
          }],
          enums: [
          {
            schema: 'schema1'
          },{
            schema: 'schema1'
          },{
            schema: 'schema3'
          }]
        }
        const mockConfig = {
          schemaAsNamespace: true
        }
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(result).toBe(`export namespace schema1 {
  first table string

  first enum string

  second enum string
}

export namespace schema2 {
  second table string


}

export namespace schema3 {
  third table string

  third enum string
}`)
        expect(mockTableTasks.stringifyTable.calls.argsFor(0)).toEqual([mockDatabase.tables[0], mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(1)).toEqual([mockDatabase.tables[1], mockConfig])
        expect(mockTableTasks.stringifyTable.calls.argsFor(2)).toEqual([mockDatabase.tables[2], mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(0)).toEqual([mockDatabase.enums[0], mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(1)).toEqual([mockDatabase.enums[1], mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(2)).toEqual([mockDatabase.enums[2], mockConfig])
      })
    })
    it('should stringify the enums with namespaces', () => {
      const mockEnumTasks = {
        stringifyEnum: jasmine.createSpy('stringifyEnum').and.returnValues('first table enum', 'second table enum', 'third table enum')
      }
      MockDatabaseTasks.__with__({
        EnumTasks: mockEnumTasks
      })(() => {
        const mockDatabase = {
          tables: [],
          enums: [
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


  first table enum

  second table enum
}

export namespace schema2 {


  third table enum
}`)
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(0)).toEqual([mockDatabase.enums[0], mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(1)).toEqual([mockDatabase.enums[1], mockConfig])
        expect(mockEnumTasks.stringifyEnum.calls.argsFor(2)).toEqual([mockDatabase.enums[2], mockConfig])
      })
    })
  })
})