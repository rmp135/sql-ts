import 'jasmine'
import { Config } from '../'
import * as DatabaseTasks from '../DatabaseTasks'
import rewire from 'rewire'
import { compile } from 'handlebars'

const MockDatabaseTasks = rewire<typeof DatabaseTasks>('../DatabaseTasks')

describe('DatabaseTasks', () => {
  let mockDatabase

  beforeEach(() => {
    mockDatabase = {
      enums: [],
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
        compile: jasmine.createSpy('compile').and.returnValue(mockCompileReturn),
        registerHelper: jasmine.createSpy('registerHelper')
      }
      MockDatabaseTasks.__with__({
        fs: mockFs,
        Handlebars: mockHandlebars
      })(() => {
        const mockConfig: Config = {
          template: 'template',
          schemaAsNamespace: true
        }
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(mockFs.readFileSync).toHaveBeenCalledWith('template', 'utf-8')
        expect(mockHandlebars.compile).toHaveBeenCalledWith('defaultTemplate', { noEscape: true })
        expect(mockCompileReturn).toHaveBeenCalled()
        expect(result).toBe(`compiledTemplate`)
      })
    })
    it('should not escape HTML', () => {
      const mockFs = {
        readFileSync: jasmine.createSpy('readFileSync').and.returnValue('{{custom.test}}')
      }
      const mockHandlebars = {
        compile: jasmine.createSpy('compile', compile).and.callThrough(),
        registerHelper: jasmine.createSpy('registerHelper')
      }
      MockDatabaseTasks.__with__({
        fs: mockFs,
        Handlebars: mockHandlebars
      })(() => {
        const mockConfig: Config = {
          template: 'template',
          custom: {
            test: 'Record<OfferingValue, string[]>'
          }
        }
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(result).toBe(`Record<OfferingValue, string[]>`)
      })
    })
    it('should use supplied template', () => {
      const mockFs = {
        readFileSync: jasmine.createSpy('readFileSync').and.returnValue('template')
      }
      const mockCompileReturn = jasmine.createSpy().and.returnValue('compiledTemplate')
      const mockHandlebars = {
        compile: jasmine.createSpy('compile').and.returnValue(mockCompileReturn),
        registerHelper: jasmine.createSpy('registerHelper')
      }
      MockDatabaseTasks.__with__({
        fs: mockFs,
        Handlebars: mockHandlebars
      })(() => {
        const mockConfig = {
          schemaAsNamespace: true,
          template: 'userdefinedtemplate'
        }
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(mockFs.readFileSync).toHaveBeenCalledWith('userdefinedtemplate', 'utf-8')
        expect(mockHandlebars.compile).toHaveBeenCalledWith('template', { noEscape: true })
        expect(mockCompileReturn).toHaveBeenCalled()
        expect(result).toBe(`compiledTemplate`)
      })
    })
    it('should call the compiler with the correct schema', () => {
      const mockFs = {
        readFileSync: jasmine.createSpy('readFileSync').and.returnValue('template')
      }
      const mockCompileReturn = jasmine.createSpy().and.returnValue('compiledTemplate')
      const mockHandlebars = {
        compile: jasmine.createSpy('compile').and.returnValue(mockCompileReturn),
        registerHelper: jasmine.createSpy('registerHelper')
      }
      MockDatabaseTasks.__with__({
        fs: mockFs,
        Handlebars: mockHandlebars
      })(() => {
        const mockConfig = {
          schemaAsNamespace: true,
          template: 'userdefinedtemplate',
          custom: {
            customKey: 'customValue'
          }
        }
        const result = MockDatabaseTasks.stringifyDatabase(mockDatabase as any, mockConfig as any)
        expect(mockFs.readFileSync).toHaveBeenCalledWith('userdefinedtemplate', 'utf-8')
        expect(mockHandlebars.compile).toHaveBeenCalledWith('template', { noEscape: true })
        expect(mockCompileReturn).toHaveBeenCalledWith({
          grouped: {
            schema1: 
            {
              enums: [],
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
                },
                {
                  name: 'tname2',
                  schema: 'schema1',
                  columns: [
                    {
                      name: 'col2',
                      type: 'type2'
                    }
                  ]
                }
              ]
            },
            schema2: {
              enums: [],
              tables: [
                {
                  name: 'tname3',
                  schema: 'schema2',
                  columns: [
                    {
                      name: 'col3',
                      type: 'type3'
                    }
                  ]
                }
              ]
            }            
          },
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
            },
            {
              name: 'tname2',
              schema: 'schema1',
              columns: [
                {
                  name: 'col2',
                  type: 'type2'
                }
              ]
            },
            {
              name: 'tname3',
              schema: 'schema2',
              columns: [
                {
                  name: 'col3',
                  type: 'type3'
                }
              ]
            }
          ],
          enums: [],
          config: mockConfig,
          custom: { 
            customKey: 'customValue'
          }
        })
        expect(result).toBe(`compiledTemplate`)
      })
    })
  })
})