import 'jasmine'
import { Column, Config } from './Typings';
import * as ColumnTasks from './ColumnTasks';
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
        const result = MockColumnTasks.convertType('tableName', 'schema', 'columnname', 'tofind', {})
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
        const result = MockColumnTasks.convertType('tableName', 'schema', 'columnname', 'tofind', { typeMap: { type: ['tofind'] } })
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
        const result = MockColumnTasks.convertType('tableName', 'schema', 'columnname', 'tofind', { typeMap: { type: ['tofind'] } })
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
        const result = MockColumnTasks.convertType('tableName', 'schema', 'columnname', 'tofind', { typeOverrides: { 'fullName': 'type' } })
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
        const result = MockColumnTasks.convertType('tableName', 'schema', 'columnname', 'tofind', { typeOverrides: { 'fullName': 'overridetype' }, typeMap: { usertype: ['fullName'] } })
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
    it('should return all columns for a table', () => {
      const mockColumns = [
        {
          isNullable: false,
          name: 'cname',
          type: 'ctype',
          isOptional: false
        }
      ]
      const mockAdapter = {
        getAllColumns: jasmine.createSpy('getAllColumns').and.returnValue(mockColumns)
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      const mockColumnSubTasks = {
        convertType: jasmine.createSpy('convertType').and.returnValue('convertedtype'),
        generateFullColumnName: jasmine.createSpy('generateFullColumnName').and.returnValue('columnname')
      }
      MockColumnTasks.__with__({
        AdapterFactory: mockAdapterFactory,
        ColumnSubTasks: mockColumnSubTasks
      })(async () => {
        const db = {}
        const table = {
          name: 'name',
          schema: 'schema'
        }
        const config = {
          dialect: 'dialect'
        }
        const result = await MockColumnTasks.getColumnsForTable(db as any, table as any, config as any)
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith(config)
        expect(mockAdapter.getAllColumns).toHaveBeenCalledWith(db, 'name', 'schema')
        expect(result).toEqual([
          {
            nullable: false,
            name: 'cname',
            type: 'ctype',
            optional: false
          }
        ])
      })
    })
  })
})