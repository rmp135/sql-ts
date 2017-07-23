import { Config } from './Typings';
import * as Database from './Database';
import * as rewire from 'rewire';

let RewireDatabase = rewire('./Database')
const MockDatabase: typeof Database & typeof RewireDatabase = <any> RewireDatabase

describe('Database', () => {
  describe('getAllTables', () => {
    it('should call the adapter of the database dialect with no schemas', async (done) => {
      const database = new MockDatabase.default()
      const mockAdapter = {
        getAllTables: jasmine.createSpy('mockAdapter.getAllTables').and.returnValue([1,2,3])
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('mockAdapterFactory.buildAdpater').and.returnValue(mockAdapter)
      }
      MockDatabase.__set__({
        AdapterFactory_1: mockAdapterFactory
      })
      const mockKnex = {} as any
      const mockConfig = { dialect: 'dialect' } as any
      const res = await database.getAllTables(mockKnex, mockConfig)
      expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith('dialect')
      expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockKnex, [])
      expect(res).toEqual([1,2,3] as any)
      done()
    })
    it('should call the adapter of the database dialect with passed in schemas', async (done) => {
      const database = new MockDatabase.default()
      const mockAdapter = {
        getAllTables: jasmine.createSpy('mockAdapter.getAllTables').and.returnValue([1,2,3])
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('mockAdapterFactory.buildAdpater').and.returnValue(mockAdapter)
      }
      MockDatabase.__set__({
        AdapterFactory_1: mockAdapterFactory
      })
      const mockKnex = {} as any
      const mockConfig = { dialect: 'dialect', schemas: ['s1', 's2'] } as any
      const res = await database.getAllTables(mockKnex, mockConfig)
      expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith('dialect')
      expect(mockAdapter.getAllTables).toHaveBeenCalledWith(mockKnex, ['s1', 's2'])
      expect(res).toEqual([1,2,3] as any)
      done()
    })
  })
  describe('generateTables', () => {
    it('should generate all the tables', async (done) => {
      const mockTableInstance = {
        generateColumns: jasmine.createSpy('mockTableInstance.generateColumns').and.returnValues(1,2,3)
      }
      const mockTable = jasmine.createSpy('Table').and.returnValue(mockTableInstance)
      MockDatabase.__set__({
        Table_1: {
          default: mockTable
        }
      })
      const database = new MockDatabase.default()
      const mockTables = [
        { name: 'name1', schema: 'schema1' },
        { name: 'name2', schema: 'schema2' },
        { name: 'name3', schema: 'schema3' }
      ]
      database.getAllTables = jasmine.createSpy('getAllTables').and.returnValue(mockTables)
      const mockDb = {} as any
      const mockConfig = {} as any
      await database.generateTables(mockDb, mockConfig)
      expect(database.getAllTables).toHaveBeenCalledWith(mockDb, mockConfig)
      expect(mockTable.calls.argsFor(0)).toEqual(['name1', 'schema1', mockConfig])
      expect(mockTable.calls.argsFor(1)).toEqual(['name2', 'schema2', mockConfig])
      expect(mockTable.calls.argsFor(2)).toEqual(['name3', 'schema3', mockConfig])
      expect(database.tables.length).toBe(3)
      done()
    })
  })
  describe('stringify', () => {
    it('should not include namepsace if not configured to', () => {
      const database = new Database.default()
      const mockTableInstance = {
        stringify: jasmine.createSpy('mockTableInstance.stringify').and.returnValues('table1', 'table2', 'table3')
      }
      database.tables.push(mockTableInstance as any, mockTableInstance as any, mockTableInstance as any)
      const res = database.stringify(false)
      expect(mockTableInstance.stringify.calls.argsFor(0)).toEqual([false])
      expect(mockTableInstance.stringify.calls.argsFor(1)).toEqual([false])
      expect(mockTableInstance.stringify.calls.argsFor(2)).toEqual([false])
      expect(mockTableInstance.stringify).toHaveBeenCalledTimes(3)
      expect(res).toEqual(`table1

table2

table3`)
    })
    it('should include namepsace if configured to', () => {
      const database = new Database.default()
      const mockTableInstance1 = {
        schema: 'schema1',
        name: 'table1',
        stringify: jasmine.createSpy('mockTableInstance.stringify').and.returnValue('table1')
      }
      const mockTableInstance2 = {
        schema: 'schema1',
        name: 'table2',
        stringify: jasmine.createSpy('mockTableInstance.stringify').and.returnValue('table2')
      }
      const mockTableInstance3 = {
        schema: 'schema2',
        name: 'table3',
        stringify: jasmine.createSpy('mockTableInstance.stringify').and.returnValue('table3')
      }
      database.tables.push(mockTableInstance1 as any, mockTableInstance2 as any, mockTableInstance3 as any)
      const res = database.stringify(true)
      expect(mockTableInstance1.stringify).toHaveBeenCalledWith(true)
      expect(mockTableInstance2.stringify).toHaveBeenCalledWith(true)
      expect(mockTableInstance3.stringify).toHaveBeenCalledWith(true)
      expect(res).toEqual(`export namespace schema1 {
table1

table2
}

export namespace schema2 {
table3
}`)
    })
  })
  describe('toObject', () => {
    it('should call the toObject method of the tables', () => {
      const database = new Database.default()
      const mockTable = {
        toObject: jasmine.createSpy('mockTable.toObject').and.returnValues('table1', 'table2', 'table3')
      }
      database.tables.push(mockTable as any, mockTable as any, mockTable as any)
      const res = database.toObject()
      expect(mockTable.toObject).toHaveBeenCalledTimes(3)
      expect(res).toEqual({ tables: ['table1', 'table2', 'table3'] } as any)
    })
  })
})
