import 'jasmine'
import * as index from './index';
const rewire = require('rewire')

let Rewireindex = rewire('./index')
const Mockindex: typeof index & typeof Rewireindex = <any> Rewireindex

describe('index', () => {
  describe('toObject', () => {
    it('should return an object from a database', (done) => {
      const mockDatabase = { tables: [] }
      const mockDatabaseFactory = {
        buildDatabase: jasmine.createSpy('buildDatabase').and.returnValue(Promise.resolve(mockDatabase))
      }
      Mockindex.__with__({
        DatabaseFactory: mockDatabaseFactory
      })(async () => {
        const mockConfig = { }
        const result = await Mockindex.toObject(mockConfig)
        expect(result).toEqual(mockDatabase as any)
        expect(mockDatabaseFactory.buildDatabase).toHaveBeenCalledWith(mockConfig)
        done()
      })
    })
  })
  describe('fromObject', () => {
    it('should return TypeScript from an object', (done) => {
      const mockObject = { }
      const mockDatabaseTasks = {
        stringifyDatabase: jasmine.createSpy('stringifyDatabase').and.returnValue('database string')
      }
      Mockindex.__with__({
        DatabaseTasks: mockDatabaseTasks
      })(() => {
        const mockConfig = { }
        const result = Mockindex.fromObject(mockObject as any, mockConfig)
        expect(result).toBe('database string')
        expect(mockDatabaseTasks.stringifyDatabase).toHaveBeenCalledWith(mockObject, mockConfig)
        done()
      })
    })
  })
  describe('toTypeScript', () => {
    it('should return TypeScript from a database', (done) => {
      const mockDatabase = { }
      const mockDatabaseFactory = {
        buildDatabase: jasmine.createSpy('buildDatabase').and.returnValue(Promise.resolve(mockDatabase)),
      }
      const mockDatabaseTasks = {
        stringifyDatabase: jasmine.createSpy('stringifyDatabase').and.returnValue('database string'),
        decorateDatabase: jasmine.createSpy('decorateDatabase').and.returnValue(mockDatabase)
      }
      Mockindex.__with__({
        DatabaseFactory: mockDatabaseFactory,
        DatabaseTasks: mockDatabaseTasks
      })(async () => {
        const mockConfig = { }
        const result = await Mockindex.toTypeScript(mockConfig)
        expect(result).toBe('database string')
        expect(mockDatabaseFactory.buildDatabase).toHaveBeenCalledWith(mockConfig)
        expect(mockDatabaseTasks.stringifyDatabase).toHaveBeenCalledWith(mockDatabase, mockConfig)
        done()
      })
    })
  })
})