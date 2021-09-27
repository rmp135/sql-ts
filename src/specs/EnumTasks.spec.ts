import 'jasmine'
import * as EnumTasks from '../EnumTasks'
import { EnumDefinition } from '../Adapters/AdapterInterface'
import { Config, Enum } from '../Typings'
import rewire from 'rewire'

const MockEnumTasks = rewire<typeof EnumTasks>('../EnumTasks')

describe('EnumTasks', () => {
  describe('getAllEnums', () => {
    it('should return all columns for a table', (done) => {
      const mockEnums: EnumDefinition[] = [
        {
          name: 'cname',
          schema: 'schema',
          values: {
            'ekey 1': 'val1'
          }
        }
      ]
      const mockAdapter = {
        getAllEnums: jasmine.createSpy('getAllEnums').and.returnValue(mockEnums)
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockGenerateEnumName = jasmine.createSpy('generateEnumName').and.returnValue('genename')
      const mockSchemaTasks = {
        generateSchemaName: jasmine.createSpy('generateSchemaName').and.returnValue('genSchemaName')
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('convertedKey')
      }
      MockEnumTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        SharedTasks: mockSharedTasks,
        SchemaTasks: mockSchemaTasks,
        generateEnumName: mockGenerateEnumName
      })(async () => {
        const db = {}
        const config = {
          dialect: 'dialect',
          columnNameCasing: 'camel',
          enumKeyCasing: 'upper'
        } as Config
        const result = await MockEnumTasks.getAllEnums(db as any, config as any)
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith(config)
        expect(mockAdapter.getAllEnums).toHaveBeenCalledOnceWith(db, config)
        expect(mockGenerateEnumName).toHaveBeenCalledOnceWith('cname', config)
        expect(mockSchemaTasks.generateSchemaName).toHaveBeenCalledOnceWith('schema')
        expect(mockSharedTasks.convertCase).toHaveBeenCalledOnceWith('ekey 1', 'upper')
        expect(result).toEqual([
          {
            name: 'cname',
            schema: 'genSchemaName',
            convertedName: 'genename',
            values: [
              {
                originalKey: 'ekey 1',
                convertedKey: 'convertedKey',
                value: 'val1'
              }
            ]
          } as Enum
        ])
        done()
      })
    })
  })
  describe('generateEnumName', () => {
    it('should remove invalid characters', (done) => {
      const mockConfig: Config = {
        enumNameCasing: 'upper'
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newname')
      }
      MockEnumTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockEnumTasks.generateEnumName('n \'][;#a m e', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('name', 'upper')
        expect(result).toBe('newname')
        done()
      })
    })
    it('should remove numbers from the beginning only', (done) => {
      const mockConfig: Config = {
        enumNameCasing: 'lower'
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newname')
      }
      MockEnumTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockEnumTasks.generateEnumName('128738n1a2m3e4', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('n1a2m3e4', 'lower')
        expect(result).toBe('newname')
        done()
      })
    })
  })
})
