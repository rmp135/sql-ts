import { Config } from './Typings';
import * as Table from './Table';
import * as rewire from 'rewire';

let RewireTable = rewire('./Table')
const MockTable: typeof Table & typeof RewireTable = <any> RewireTable

describe('Table', () => {
  describe('construction', () => {
    it('should set the properties on the table without interfaceNamePattern', () => {
      const mockConfig: Config = { }
      const table = new Table.default('name', 'schema', {} as any)
      expect(table.name).toBe('name')
      expect(table.schema).toBe('schema')
      expect(table.interfaceName).toBe('nameEntity')
    })
    it('should replace the interfaceNamePattern', () => {
      const mockConfig: Config = { 
        interfaceNameFormat: "newName"
      }
      const table = new Table.default('name', 'schema', mockConfig)
      expect(table.name).toBe('name')
      expect(table.schema).toBe('schema')
      expect(table.interfaceName).toBe('newName')
    })
    it('should replace spaces with underscores', () => {
      const table = new Table.default('new name', 'schema', {} as any)
      expect(table.name).toBe('new name')
      expect(table.schema).toBe('schema')
      expect(table.interfaceName).toBe('new_nameEntity')
    })
    it('should replace spaces with underscores and replace the interfaceNamePattern', () => {
      const mockConfig: Config = { 
        interfaceNameFormat: "${table}Table"
      }
      const table = new Table.default('new name', 'schema', mockConfig)
      expect(table.name).toBe('new name')
      expect(table.schema).toBe('schema')
      expect(table.interfaceName).toBe('new_nameTable')
    })
  })
  describe('generateColumn', () => {
    it('should map the result of a retrieved adapater', async (done) => {
      const mockAdapter = {
        getAllColumns: jasmine.createSpy('mockAdapter.getAllColumns').and.returnValue(Promise.resolve([
          { name: 'name1', isNullable: false, type: 'type1' },
          { name: 'name2', isNullable: true, type: 'type2' }
        ]))
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('mockAdapterFactory.buildAdapter').and.returnValue(mockAdapter)
      }
      const mockColumn = jasmine.createSpy('column').and.returnValue(1)
      MockTable.__set__({
        AdapterFactory_1: mockAdapterFactory,
        Column_1: {
          default: mockColumn
        }
      })
      const mockDb = {} as any
      const mockConfig = {
        dialect: 'dialect'
      } as any
      const table = new MockTable.default('name', 'schema', mockConfig)
      await table.generateColumns(mockDb, mockConfig)
      expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith('dialect')
      expect(mockAdapter.getAllColumns).toHaveBeenCalledWith(mockDb, 'name', 'schema')
      expect(mockColumn.calls.argsFor(0)).toEqual(['name1', false, 'type1', table, mockConfig])
      expect(mockColumn.calls.argsFor(1)).toEqual(['name2', true, 'type2', table, mockConfig])
      expect(table.columns.length).toBe(2)
      done()
    })
  })
  describe('stringify', () => {
    it('should not bump the indenting if schema information if disabled', () => {
      const table = new Table.default('name', 'schema', {} as any)
      table.interfaceName = 'mockInterfaceName'
      const mockCol = {
        stringify: jasmine.createSpy('mockCol.stringify').and.returnValues('col1', 'col2', 'col3')
      }
      table.columns.push(mockCol as any, mockCol as any, mockCol as any)
      const res = table.stringify(false)
      expect(mockCol.stringify).toHaveBeenCalled()
      expect(res).toEqual(`export interface mockInterfaceName {
  col1
  col2
  col3
}`)
    })
    it('should bump the indenting if schema if enabled', () => {
      const table = new Table.default('name', 'schema', {} as any)
      table.interfaceName = 'mockInterfaceName'
      const mockCol = {
        stringify: jasmine.createSpy('mockCol.stringify').and.returnValues('col1', 'col2', 'col3')
      }
      table.columns.push(mockCol as any, mockCol as any, mockCol as any)
      const res = table.stringify(true)
      expect(mockCol.stringify).toHaveBeenCalled()
      expect(mockCol.stringify).toHaveBeenCalledTimes(3)
      expect(res).toEqual(`  export interface mockInterfaceName {
    col1
    col2
    col3
  }`)
    })
  })
  describe('toObject', () => {
    it('should return the table as a plain object', () => {
      const table = new Table.default('name', 'schema', {} as any)
      const mockCol = {
        toObject: jasmine.createSpy('mockCol.toObject').and.returnValues('col1', 'col2', 'col3')
      }
      table.columns.push(mockCol as any, mockCol as any, mockCol as any)
      const res = table.toObject()
      expect(mockCol.toObject).toHaveBeenCalledTimes(3)
      expect(res).toEqual({
        name: 'name',
        schema: 'schema',
        columns: ['col1', 'col2', 'col3'] as any
      })
    })
  })
})
