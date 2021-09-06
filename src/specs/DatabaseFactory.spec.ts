import 'jasmine'
import * as DatabaseFactory from '../DatabaseFactory'
const rewire = require('rewire')

let RewireDatabaseFactory = rewire('../DatabaseFactory')
const MockDatabaseFactory: typeof DatabaseFactory & typeof RewireDatabaseFactory = <any> RewireDatabaseFactory

describe('DatabaseFactory', () => {
  describe('buildDatabase', () => {
    it('should instantiate a database and destroy the connection', (done) => {
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }
      const mockKnexImport = {
        default: jasmine.createSpy('knex').and.returnValue(mockKnex)
      }
      const mockTableTasks = {
        getAllTables: jasmine.createSpy('getAllTables').and.returnValue(Promise.resolve(['table1', 'table2']))
      }
      const mockEnumTasks = {
        getAllEnums: jasmine.createSpy('getAllEnums').and.returnValue(Promise.resolve(['enum1', 'enum2']))
      }
      MockDatabaseFactory.__with__({
        knex_1: mockKnexImport,
        TableTasks: mockTableTasks,
        EnumTasks: mockEnumTasks
      })(async () => {
        const mockConfig = {} as any
        const dat = await MockDatabaseFactory.buildDatabase(mockConfig) as any
        expect(mockKnexImport.default).toHaveBeenCalledWith(mockConfig)
        expect(mockTableTasks.getAllTables).toHaveBeenCalledWith(mockKnex, mockConfig)
        expect(mockKnex.destroy).toHaveBeenCalled()
        expect(dat.tables).toEqual(['table1', 'table2'])
        expect(dat.enums).toEqual(['enum1', 'enum2'])
        done()
      })
    })
    it('should throw an error when an error occurs', (done) => {
      const mockKnexImport = {
        default: jasmine.createSpy('knex').and.throwError('knex error')
      } 
      MockDatabaseFactory.__with__({
        knex_1: mockKnexImport,
      })(async () => {
        const mockConfig = {} as any
        try {
          await MockDatabaseFactory.buildDatabase(mockConfig)
        } catch (err) {
          expect(err.message).toBe('knex error')
          done()
        }
      })
    })
  })
})
