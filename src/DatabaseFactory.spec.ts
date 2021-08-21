import 'jasmine'
import * as DatabaseFactory from './DatabaseFactory';
const rewire = require('rewire')

let RewireDatabaseFactory = rewire('./DatabaseFactory')
const MockDatabaseFactory: typeof DatabaseFactory & typeof RewireDatabaseFactory = <any> RewireDatabaseFactory

describe('DatabaseFactory', () => {
  describe('buildDatabase', () => {
    it('should instantiate a database and destroy the connection', async (done) => {
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }
      const mockKnexImport = jasmine.createSpy('knex').and.returnValue(mockKnex)
      const mockTableTasks = {
        getAllTables: jasmine.createSpy('getAllTables').and.returnValue(Promise.resolve(['table1', 'table2']))
      }
      const mockEnumTasks = {
        getAllEnums: jasmine.createSpy('getAllEnums').and.returnValue(Promise.resolve(['enum1', 'enum2']))
      }
      MockDatabaseFactory.__set__({
        knex: mockKnexImport,
        TableTasks: mockTableTasks,
        EnumTasks: mockEnumTasks
      })
      const mockConfig = {} as any
      const dat = await MockDatabaseFactory.buildDatabase(mockConfig) as any
      expect(mockKnexImport).toHaveBeenCalledWith(mockConfig)
      expect(mockTableTasks.getAllTables).toHaveBeenCalledWith(mockKnex, mockConfig)
      expect(mockKnex.destroy).toHaveBeenCalled()
      expect(dat.tables).toEqual(['table1', 'table2'])
      expect(dat.enums).toEqual(['enum1', 'enum2'])
      done()
    })
    it('should throw an error when an error occurs', async (done) => {
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }
      const mockKnexImport = jasmine.createSpy('knex').and.throwError("knex error")
      MockDatabaseFactory.__set__({
        knex: mockKnexImport,
      })
      const mockConfig = {} as any
      try {
        await MockDatabaseFactory.buildDatabase(mockConfig)
      } catch (err) {
        expect(err.message).toBe("knex error")
        done()
      }
    })
    it('should allow using a custom Knex connection', async (done) => {
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }

      MockDatabaseFactory.__set__({
        TableTasks: {
          getAllTables: jasmine.createSpy('getAllTables').and.returnValue(Promise.resolve(['table1', 'table2']))
        },
        EnumTasks: {
          getAllEnums: jasmine.createSpy('getAllEnums').and.returnValue(Promise.resolve(['enum1', 'enum2']))
        }
      })

      await MockDatabaseFactory.buildDatabase({
        knexConnection:  mockKnex,
        dialect: 'sqlite3',
      }) as any

      expect(mockKnex.destroy).not.toHaveBeenCalled()

      let hasThrown = false;
      try {
        await MockDatabaseFactory.buildDatabase({
          knexConnection:  mockKnex,
        })
      } catch (error) {
        hasThrown = true;
      }

      expect(hasThrown).toBe(true);

      done()
    })
  })
})
