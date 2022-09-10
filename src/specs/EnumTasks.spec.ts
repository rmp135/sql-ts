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
      const mockGenerateEnumKey = jasmine.createSpy('generateEnumKey').and.returnValue('genkey')
      const mockSchemaTasks = {
        generateSchemaName: jasmine.createSpy('generateSchemaName').and.returnValue('genSchemaName')
      }
      MockEnumTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        SchemaTasks: mockSchemaTasks,
        generateEnumName: mockGenerateEnumName,
        generateEnumKey: mockGenerateEnumKey
      })(async () => {
        const db = {
          client: {
            dialect: 'dialect'
          }
        }
        const config = {
          dialect: 'configDialect',
          columnNameCasing: 'camel',
          enumKeyCasing: 'upper'
        } as Config
        const result = await MockEnumTasks.getAllEnums(db as any, config as any)
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith('dialect')
        expect(mockAdapter.getAllEnums).toHaveBeenCalledOnceWith(db, config)
        expect(mockGenerateEnumName).toHaveBeenCalledOnceWith('cname', config)
        expect(mockGenerateEnumKey).toHaveBeenCalledWith('ekey 1', config)
        expect(mockSchemaTasks.generateSchemaName).toHaveBeenCalledOnceWith('schema')
        expect(result).toEqual([
          {
            name: 'cname',
            schema: 'genSchemaName',
            convertedName: 'genename',
            values: [
              {
                originalKey: 'ekey 1',
                convertedKey: 'genkey',
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
        enumNameFormat: '${name}',
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
        enumNameFormat: '${name}',
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
    it('should use the config name option', (done) => {
      const mockConfig: Config = {
        enumNameFormat: '_${name}Enum',
        enumNameCasing: 'lower'
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newname')
      }
      MockEnumTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockEnumTasks.generateEnumName('name', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('name', 'lower')
        expect(result).toBe('_newnameEnum')
        done()
      })
    })
  })
  describe('generateEnumKey', () => {
    it('should not modify non number keys', (done) => {
      const mockConfig: Config = {
        enumKeyCasing: 'lower',
        enumNumericKeyFormat: '_${key}',
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newkey')
      }
      MockEnumTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockEnumTasks.generateEnumKey('originalkey', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('originalkey', 'lower')
        expect(result).toBe('newkey')
        done()
      })
    })
    it('should transform number keys', (done) => {
      const mockConfig: Config = {
        enumKeyCasing: 'lower',
        enumNumericKeyFormat: '$_${key}',
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('42')
      }
      MockEnumTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockEnumTasks.generateEnumKey('originalkey', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('originalkey', 'lower')
        expect(result).toBe('$_42')
        done()
      })
    })
    it('should transform 0 number key', (done) => {
      const mockConfig: Config = {
        enumKeyCasing: 'lower',
        enumNumericKeyFormat: '$_${key}',
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('0')
      }
      MockEnumTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockEnumTasks.generateEnumKey('originalkey', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('originalkey', 'lower')
        expect(result).toBe('$_0')
        done()
      })
    })
    it('should transform minus number key', (done) => {
      const mockConfig: Config = {
        enumKeyCasing: 'lower',
        enumNumericKeyFormat: '$_${key}',
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('-232')
      }
      MockEnumTasks.__with__({
        SharedTasks: mockSharedTasks
      })(() => {
        const result = MockEnumTasks.generateEnumKey('originalkey', mockConfig)
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('originalkey', 'lower')
        expect(result).toBe('$_-232')
        done()
      })
    })
  })
})
