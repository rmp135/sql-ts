import 'jasmine'
import * as index from '../index'
import rewire from 'rewire'

const Mockindex = rewire<typeof index>('../index')

describe('index', () => {
  describe('toObject', () => {
    it('should create a database context if one isn\'t provided', (done) => {
      const mockDatabase = {}
      const mockDecoratedDatabase = {}
      const mockDatabaseTasks = {
        generateDatabase: jasmine.createSpy('buildDatabase').and.returnValue(Promise.resolve(mockDatabase))
      }
      const mockAppliedConfig = { }
      const mockConfigTasks = {
        applyConfigDefaults: jasmine.createSpy('applyDefaultConfigs').and.returnValue(mockAppliedConfig)
      }
      const mockDBResponse = {}
      const mockConnectionFactory = {
        createAndRun: jasmine.createSpy('createAndRun').and.returnValue(mockDBResponse)
      }
      Mockindex.__with__({
        DatabaseTasks: mockDatabaseTasks,
        ConfigTasks: mockConfigTasks,
        ConnectionFactory: mockConnectionFactory
      })(async () => {
        const mockConfig = {}
        const result = await Mockindex.toObject(mockConfig)
        expect(mockConfigTasks.applyConfigDefaults).toHaveBeenCalledOnceWith(mockConfig)
        expect(result).toEqual(mockDecoratedDatabase as any)
        expect(mockConnectionFactory.createAndRun.calls.argsFor(0)[0]).toBe(mockAppliedConfig)
        expect(mockDatabaseTasks.generateDatabase).not.toHaveBeenCalled()
        done()
      })
    })
    it('should use a provided database context', (done) => {
      const mockDatabase = {}
      const mockDecoratedDatabase = {}
      const mockDatabaseTasks = {
        generateDatabase: jasmine.createSpy('buildDatabase').and.returnValue(Promise.resolve(mockDatabase))
      }
      const mockAppliedConfig = { }
      const mockConfigTasks = {
        applyConfigDefaults: jasmine.createSpy('applyDefaultConfigs').and.returnValue(mockAppliedConfig)
      }
      const mockDBResponse = {}
      const mockConnectionFactory = {
        createAndRun: jasmine.createSpy('createAndRun').and.returnValue(mockDBResponse)
      }
      const mockDb = { }
      Mockindex.__with__({
        DatabaseTasks: mockDatabaseTasks,
        ConfigTasks: mockConfigTasks,
        ConnectionFactory: mockConnectionFactory
      })(async () => {
        const mockConfig = {}
        const result = await Mockindex.toObject(mockConfig, mockDb as any)
        expect(mockConfigTasks.applyConfigDefaults).toHaveBeenCalledOnceWith(mockConfig)
        expect(result).toEqual(mockDecoratedDatabase as any)
        expect(mockConnectionFactory.createAndRun).not.toHaveBeenCalled()
        expect(mockDatabaseTasks.generateDatabase).toHaveBeenCalledWith(mockAppliedConfig, mockDb)
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
      const mockDatabaseTasks = {
        stringifyDatabase: jasmine.createSpy('stringifyDatabase').and.returnValue('database string'),
      }
      const mockConfig = { }
      const mockAppliedConfig = { }
      const mockConfigTasks = {
        applyConfigDefaults: jasmine.createSpy('applyDefaultConfigs').and.returnValue(mockAppliedConfig)
      }
      const toObjectResponse = { }
      const mockToObject = jasmine.createSpy('toObject').and.returnValue(Promise.resolve(toObjectResponse))
      Mockindex.__with__({
        DatabaseTasks: mockDatabaseTasks,
        ConfigTasks: mockConfigTasks,
        toObject: mockToObject
      })(async () => {
        const result = await Mockindex.toTypeScript(mockConfig)
        expect(result).toBe('database string')
        expect(mockConfigTasks.applyConfigDefaults).toHaveBeenCalledWith(mockAppliedConfig)
        expect(mockToObject).toHaveBeenCalledWith(mockAppliedConfig, undefined)
        expect(mockDatabaseTasks.stringifyDatabase).toHaveBeenCalledWith(toObjectResponse, mockAppliedConfig)
        done()
      })
    })
    it('should pass a supplied database context', (done) => {
      const mockDatabaseTasks = {
        stringifyDatabase: jasmine.createSpy('stringifyDatabase').and.returnValue('database string'),
      }
      const mockConfig = { }
      const mockAppliedConfig = { }
      const mockConfigTasks = {
        applyConfigDefaults: jasmine.createSpy('applyDefaultConfigs').and.returnValue(mockAppliedConfig)
      }
      const mockDb = { }
      const toObjectResponse = { }
      const mockToObject = jasmine.createSpy('toObject').and.returnValue(Promise.resolve(toObjectResponse))
      Mockindex.__with__({
        DatabaseTasks: mockDatabaseTasks,
        ConfigTasks: mockConfigTasks,
        toObject: mockToObject
      })(async () => {
        const result = await Mockindex.toTypeScript(mockConfig, mockDb as any)
        expect(result).toBe('database string')
        expect(mockConfigTasks.applyConfigDefaults).toHaveBeenCalledWith(mockAppliedConfig)
        expect(mockToObject).toHaveBeenCalledWith(mockAppliedConfig, mockDb)
        expect(mockDatabaseTasks.stringifyDatabase).toHaveBeenCalledWith(toObjectResponse, mockAppliedConfig)
        done()
      })
    })
  })
})