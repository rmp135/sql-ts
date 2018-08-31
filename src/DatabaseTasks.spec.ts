import 'jasmine'
import * as path from 'path'
import * as DatabaseTasks from './DatabaseTasks';
const rewire = require('rewire')

let RewireDatabaseTasks = rewire('./DatabaseTasks')
const MockDatabaseTasks: typeof DatabaseTasks & typeof RewireDatabaseTasks = <any> RewireDatabaseTasks

describe('DatabaseTasks', () => {
  let mockDatabase

  beforeEach(() => {
    mockDatabase = {
      tables: [
      {
        name: 'tname1',
        schema: 'schema1',
        columns: [
          {
            name: 'col1',
            type: 'type1'
          }
        ]
      },{
        name: 'tname2',
        schema: 'schema1',
        columns: [
          {
            name: 'col2',
            type: 'type2'
          }
        ]
      },{
        name: 'tname3',
        schema: 'schema2',
        columns: [
          {
            name: 'col3',
            type: 'type3'
          }
        ]
      }]
    }
  })

  describe('stringifyDatabase', () => {
    it('should use default template', () => {
      const mockFs = {
        readFileSync: jasmine.createSpy('readFileSync').and.returnValue('defaultTemplate')
      }
      const mockCompileReturn = jasmine.createSpy().and.returnValue('compiledTemplate')
      const mockHandlebars = {
        compile: jasmine.createSpy('compile').and.returnValue(mockCompileReturn)
      }
      MockDatabaseTasks.__with__({
        fs: mockFs,
        handlebars: mockHandlebars
      })(() => {
        const mockConfig = {
          schemaAsNamespace: true
        }
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(mockFs.readFileSync).toHaveBeenCalledWith(path.join(__dirname, './template.handlebars'), 'utf-8')
        expect(mockHandlebars.compile).toHaveBeenCalledWith('defaultTemplate')
        expect(result).toBe(`compiledTemplate`)
      })
    })
    it('should use supplied template', () => {
      const mockFs = {
        readFileSync: jasmine.createSpy('readFileSync').and.returnValue('template')
      }
      const mockCompileReturn = jasmine.createSpy().and.returnValue('compiledTemplate')
      const mockHandlebars = {
        compile: jasmine.createSpy('compile').and.returnValue(mockCompileReturn)
      }
      MockDatabaseTasks.__with__({
        fs: mockFs,
        handlebars: mockHandlebars
      })(() => {
        const mockConfig = {
          schemaAsNamespace: true,
          template: 'userdefinedtemplate'
        }
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(mockFs.readFileSync).toHaveBeenCalledWith('userdefinedtemplate', 'utf-8')
        expect(mockHandlebars.compile).toHaveBeenCalledWith('template')
        expect(result).toBe(`compiledTemplate`)
      })
    })
  })

  describe('decorateDatabase', () => {
    it('decorates the database object with interface name and column types', () => {
      const mockTableTasks = {
        generateInterfaceName: jasmine.createSpy('generateInterfaceName').and.returnValues('name1', 'name2', 'name3')
      }
      const mockColumnTasks = {
        convertType: jasmine.createSpy('convertType').and.returnValues('jsType1', 'jsType2', 'jsType3')
      }
      MockDatabaseTasks.__with__({
        TableTasks: mockTableTasks,
        ColumnTasks: mockColumnTasks,
      })(() => {
        const mockConfig = {
          schemaAsNamespace: true
        }
        const result = MockDatabaseTasks.decorateDatabase(mockDatabase as any, mockConfig as any)
        expect(mockTableTasks.generateInterfaceName.calls.argsFor(0)).toEqual(['tname1', mockConfig])
        expect(mockTableTasks.generateInterfaceName.calls.argsFor(1)).toEqual(['tname2', mockConfig])
        expect(mockTableTasks.generateInterfaceName.calls.argsFor(2)).toEqual(['tname3', mockConfig])
        expect(mockColumnTasks.convertType.calls.argsFor(0)).toEqual(['tname1', 'schema1', 'col1', 'type1', mockConfig])
        expect(mockColumnTasks.convertType.calls.argsFor(1)).toEqual(['tname2', 'schema1', 'col2', 'type2', mockConfig])
        expect(mockColumnTasks.convertType.calls.argsFor(2)).toEqual(['tname3', 'schema2', 'col3', 'type3', mockConfig])
      })      
    })
  })
})