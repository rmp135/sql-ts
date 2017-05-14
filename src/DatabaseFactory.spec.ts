import * as DatabaseFactory from './DatabaseFactory'
import * as rewire from 'rewire'

let RewireDatabaseFactory = rewire('./DatabaseFactory')
const MockDatabaseFactory: typeof DatabaseFactory & typeof RewireDatabaseFactory = <any> RewireDatabaseFactory


describe('DatabaseFactory', () => {
  describe('buildDatabasea', () => {
    it('should populate properties from parameters', async (done) => {
      const mockDatabase = {
        generateTables: jasmine.createSpy('generateTables').and.returnValue(Promise.resolve())
      }
      const mockDatabaseImport = jasmine.createSpy('database').and.returnValue(mockDatabase)
      MockDatabaseFactory.__set__({
        Database_1: {
          default: mockDatabaseImport
        } 
      })
      const mockKnex = {} as any
      const mockConfig = {} as any
      const dat = await MockDatabaseFactory.buildDatabase(mockKnex, mockConfig) as any
      expect(mockDatabaseImport).toHaveBeenCalledWith(mockKnex, mockConfig)
      expect(mockDatabase.generateTables).toHaveBeenCalled()
      expect(dat).toBe(mockDatabase)
      done()
    })
  })
})
