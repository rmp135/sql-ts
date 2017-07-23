import * as DatabaseFactory from './DatabaseFactory'
import * as rewire from 'rewire'

let RewireDatabaseFactory = rewire('./DatabaseFactory')
const MockDatabaseFactory: typeof DatabaseFactory & typeof RewireDatabaseFactory = <any> RewireDatabaseFactory

describe('DatabaseFactory', () => {
  describe('buildDatabase', () => {
    it('should instantiate a database and destroy the connection', async (done) => {
      const mockDatabase = {
        generateTables: jasmine.createSpy('generateTables').and.returnValue(Promise.resolve())
      }
      const mockDatabaseImport = jasmine.createSpy('database').and.returnValue(mockDatabase)
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }
      const mockKnexImport = jasmine.createSpy('knex').and.returnValue(mockKnex)
      MockDatabaseFactory.__set__({
        knex: mockKnexImport,
        Database_1: {
          default: mockDatabaseImport
        } 
      })
      const mockConfig = {} as any
      const dat = await MockDatabaseFactory.buildDatabase(mockConfig) as any
      expect(mockKnexImport).toHaveBeenCalledWith(mockConfig)
      expect(mockDatabaseImport).toHaveBeenCalled()
      expect(mockDatabase.generateTables).toHaveBeenCalledWith(mockKnex, mockConfig)
      expect(mockKnex.destroy).toHaveBeenCalled()
      expect(dat).toBe(mockDatabase)
      done()
    })
    it('should throw an error when an error occurs', async (done) => {
      const mockDatabase = {
        generateTables: jasmine.createSpy('generateTables').and.returnValue(Promise.resolve())
      }
      const mockDatabaseImport = jasmine.createSpy('database').and.returnValue(mockDatabase)
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }
      const mockKnexImport = jasmine.createSpy('knex').and.throwError("knex error")
      MockDatabaseFactory.__set__({
        knex: mockKnexImport,
        Database_1: {
          default: mockDatabaseImport
        } 
      })
      const mockConfig = {} as any
      try {
        await MockDatabaseFactory.buildDatabase(mockConfig)
      } catch (err) {
        expect(err.message).toBe("knex error")
        done()
      }
    })
  })
})
