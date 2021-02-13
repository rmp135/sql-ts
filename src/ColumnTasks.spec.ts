import 'jasmine'
import * as ColumnTasks from './ColumnTasks';
import { Config } from '.';
const rewire = require('rewire')

let RewireColumnTasks = rewire('./ColumnTasks')
const MockColumnTasks: typeof ColumnTasks & typeof RewireColumnTasks = <any> RewireColumnTasks

describe('ColumnTasks', () => {
  describe('convertType', () => {
    it('should use the built in types', () => {
      const mockColumnSubTasks = {
        generateFullColumnName: jasmine.createSpy('generateFullColumnName').and.returnValue('fullName')
      }
      MockColumnTasks.__with__({
        ColumnSubTasks: mockColumnSubTasks,
        TypeMap_1: {
          default: {
            'type': ['tofind']
          }
        }
      })(() => {
        const mockTable = { }
        const mockColumn = {
          type: 'tofind'
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, {})
        expect(result).toBe('type')
      })
    })
    it('should use the user type map if available', () => {
      const mockColumnSubTasks = {
        generateFullColumnName: jasmine.createSpy('generateFullColumnName').and.returnValue('fullName')
      }
      MockColumnTasks.__with__({
        ColumnSubTasks: mockColumnSubTasks
      })(() => {
        const mockTable = {
          name: 'tableName',
          schema: 'schema'
        }
        const mockColumn = {
          type: 'tofind'
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, { typeMap: { type: ['tofind'] } })
        expect(result).toBe('type')
      })
    })
    it('should use the user type map even if available in the global map', () => {
      const mockColumnSubTasks = {
        generateFullColumnName: jasmine.createSpy('generateFullColumnName').and.returnValue('fullName')
      }
      MockColumnTasks.__with__({
        ColumnSubTasks: mockColumnSubTasks,
        TypeMap_1: {
          default: {
            'globaltype': ['fullName']
          }
        }
      })(() => {
        const mockTable = {
          name: 'tableName',
          schema: 'schema'
        }
        const mockColumn = {
          type: 'tofind'
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, { typeMap: { type: ['tofind'] } })
        expect(result).toBe('type')
      })
    })
    it('should use a type override if available', () => {
      const mockColumnSubTasks = {
        generateFullColumnName: jasmine.createSpy('generateFullColumnName').and.returnValue('fullName')
      }
      MockColumnTasks.__with__({
        ColumnSubTasks: mockColumnSubTasks
      })(() => {
        const mockTable = {
          name: 'tableName',
          schema: 'schema'
        }
        const mockColumn = {
          type: 'tofind'
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, { typeOverrides: { 'fullName': 'type' } })
        expect(result).toBe('type')
      })
    })
    it('should use the type override if available in the other maps', () => {
      const mockColumnSubTasks = {
        generateFullColumnName: jasmine.createSpy('generateFullColumnName').and.returnValue('fullName')
      }
      MockColumnTasks.__with__({
        ColumnSubTasks: mockColumnSubTasks,
        TypeMap_1: {
          default: {
            'globaltype': ['fullName']
          }
        }
      })(() => {
        const mockTable = {
          name: 'tableName',
          schema: 'schema'
        }
        const mockColumn = {
          type: 'tofind'
        }
        const result = MockColumnTasks.convertType(mockColumn, mockTable, { typeOverrides: { 'fullName': 'overridetype' }, typeMap: { usertype: ['fullName'] } })
        expect(result).toBe('overridetype')
      })
    })
    it('should use any if no override exists', () => {
      const mockColumnSubTasks = {
        generateFullColumnName: jasmine.createSpy('generateFullColumnName').and.returnValue('fullName')
      }
      MockColumnTasks.__with__({
        ColumnSubTasks: mockColumnSubTasks,
        TypeMap_1: {
          default: {
            'type': ['tofind1']
          }
        }
      })(() => {
        const result = MockColumnTasks.convertType('tableName', 'schema', 'columnname', 'tofind', { typeOverrides: { 'columnname1': 'type' } })
        expect(result).toBe('any')
      })
    })
  })

  describe('getColumnsForTable', () => {
    it('should return all columns for a table', (done) => {
      const mockColumns = [
        {
          isNullable: false,
          name: 'cname',
          type: 'ctype',
          isOptional: false,
          isEnum: false,
          isPrimaryKey: true
        }
      ]
      const mockAdapter = {
        getAllColumns: jasmine.createSpy('getAllColumns').and.returnValue(mockColumns)
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockSharedTasks = {
        convertCase: jasmine.createSpy('convertCase').and.returnValue('newname'),
      }
      MockColumnTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        SharedTasks: mockSharedTasks
      })(async () => {
        const db = {}
        const table = {
          name: 'name',
          schema: 'schema'
        }
        const config: Config = {
          dialect: 'dialect',
          columnNameCasing: 'camel'
        }
        const result = await MockColumnTasks.getColumnsForTable(db as any, table as any, config as any)
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith(config)
        expect(mockAdapter.getAllColumns).toHaveBeenCalledWith(db, config, 'name', 'schema')
        expect(mockSharedTasks.convertCase).toHaveBeenCalledWith('cname', 'camel')
        expect(result).toEqual([
          {
            nullable: false,
            name: 'newname',
            type: 'ctype',
            optional: false,
            isEnum: false,
            isPrimaryKey: true
          }
        ])
        done()
      })
    })
  })
})