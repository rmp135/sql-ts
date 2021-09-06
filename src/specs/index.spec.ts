import 'jasmine'
import * as index from '../index'
const rewire = require('rewire')

let Rewireindex = rewire('../index')
const Mockindex: typeof index & typeof Rewireindex = <any> Rewireindex

describe('index', () => {
  describe('toObject', () => {
    it('should return an object from a database', (done) => {
      const mockDatabase = {}
      const mockDecoratedDatabase = {}
      const mockDatabaseFactory = {
        buildDatabase: jasmine.createSpy('buildDatabase').and.returnValue(Promise.resolve(mockDatabase))
      }
      const mockAppliedConfig = { }
      const mockConfigTasks = {
        applyConfigDefaults: jasmine.createSpy('applyDefaultConfigs').and.returnValue(mockAppliedConfig)
      }
      Mockindex.__with__({
        DatabaseFactory: mockDatabaseFactory,
        ConfigTasks: mockConfigTasks
      })(async () => {
        const mockConfig = {}
        const result = await Mockindex.toObject(mockConfig)
        expect(mockConfigTasks.applyConfigDefaults).toHaveBeenCalledOnceWith(mockConfig)
        expect(result).toEqual(mockDecoratedDatabase as any)
        expect(mockDatabaseFactory.buildDatabase).toHaveBeenCalledOnceWith(mockAppliedConfig)
        done()
      })
    })
  })
  describe('fromObject', () => {
    it('should return TypeScript from an object', (done) => {
      const mockAppliedConfig = { }
      const mockConfigTasks = {
        applyConfigDefaults: jasmine.createSpy('applyDefaultConfigs').and.returnValue(mockAppliedConfig)
      }
      const mockDatabaseTasks = {
        stringifyDatabase: jasmine.createSpy('stringifyDatabase').and.returnValue('database string')
      }
      Mockindex.__with__({
        DatabaseTasks: mockDatabaseTasks,
        ConfigTasks: mockConfigTasks
      })(() => {
        const mockObject = { }
        const mockConfig = { }
        const result = Mockindex.fromObject(mockObject as any, mockConfig)
        expect(result).toBe('database string')
        expect(mockConfigTasks.applyConfigDefaults).toHaveBeenCalledOnceWith(mockConfig)
        expect(mockDatabaseTasks.stringifyDatabase).toHaveBeenCalledOnceWith(mockObject, mockAppliedConfig)
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
      const mockConfig = { }
      const mockAppliedConfig = { }
      const mockConfigTasks = {
        applyConfigDefaults: jasmine.createSpy('applyDefaultConfigs').and.returnValue(mockAppliedConfig)
      }
      Mockindex.__with__({
        DatabaseFactory: mockDatabaseFactory,
        DatabaseTasks: mockDatabaseTasks,
        ConfigTasks: mockConfigTasks
      })(async () => {
        const result = await Mockindex.toTypeScript(mockConfig)
        expect(result).toBe('database string')
        expect(mockConfigTasks.applyConfigDefaults).toHaveBeenCalledWith(mockAppliedConfig)
        expect(mockDatabaseFactory.buildDatabase).toHaveBeenCalledWith(mockAppliedConfig)
        expect(mockDatabaseTasks.stringifyDatabase).toHaveBeenCalledWith(mockDatabase, mockAppliedConfig)
        done()
      })
    })
  })
})