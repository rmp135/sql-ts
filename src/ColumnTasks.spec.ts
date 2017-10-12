import { Column } from './Typings';
import * as ColumnTasks from './ColumnTasks';
import * as rewire from 'rewire';

let RewireColumn = rewire('./ColumnTasks')
const MockColumn: typeof ColumnTasks & typeof RewireColumn = <any> RewireColumn

describe('ColumnTasks', () => {
  describe('stringifyColumn', () => {
    it('should handle nullable', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: true,
        type: 'type'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn)
      expect(result).toEqual('name?: jsType | null')
    })
    it('should handle not nullable', () => {
      const mockColumn: Column = {
        name: 'name',
        jsType: 'jsType',
        nullable: false,
        type: 'type'
      }
      let result = ColumnTasks.stringifyColumn(mockColumn)
      expect(result).toEqual('name?: jsType')
    })
  })
  describe('convertType', () => {
    it('should use the built in types', () => {
      MockColumn.__with__({
        TypeMap_1: {
          default: {
            'type': ['tofind']
          }
        }
      })(() => {
        const result = MockColumn.convertType('table', 'column', 'tofind', {})
        expect(result).toBe('type')
      })
    })
    it('should use a type override if available', () => {
      const result = MockColumn.convertType('table', 'column', 'tofind', { typeOverrides: { 'table.column': 'type' } })
      expect(result).toBe('type')
    })
    it('should use any if no override exists', () => {
      MockColumn.__with__({
        TypeMap_1: {
          default: {
            'type': ['tofind1']
          }
        }
      })(() => {
        const result = MockColumn.convertType('table', 'column', 'tofind', { typeOverrides: { 'table.column1': 'type' } })
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
          type: 'ctype'
        }
      ]
      const mockAdapter = {
        getAllColumns: jasmine.createSpy('getAllColumns').and.returnValue(mockColumns)
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      MockColumn.__with__({
        AdapterFactory_1: mockAdapterFactory
      })(async () => {
        const db = {}
        const table = {
          name: 'name',
          schema: 'schema'
        }
        const config = {
          dialect: 'dialect'
        }
        const result = await MockColumn.getColumnsForTable(db as any, table as any, config as any)
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith('dialect')
        expect(result).toEqual([
          {
            jsType: 'any',
            type: 'ctype',
            nullable: false,
            name: 'cname',
          }
        ])
      })
    })
  })
})