import 'jasmine'
import * as ColumnSubTasks from './ColumnSubTasks'
const rewire = require('rewire')

let RewireColumnSubTasks = rewire('./ColumnSubTasks')
const MockColumnSubTasks: typeof ColumnSubTasks & typeof RewireColumnSubTasks = <any> RewireColumnSubTasks

describe('ColumnSubTasks', () => {
  describe('convertType', () => {
    it('should use the built in types', () => {
      MockColumnSubTasks.__with__({
        TypeMap_1: {
          default: {
            'type': ['tofind']
          }
        }
      })(() => {
        const result = MockColumnSubTasks.convertType('columnname', 'tofind', {})
        expect(result).toBe('type')
      })
    })
    it('should use the user type map if available', () => {
      const result = MockColumnSubTasks.convertType('columnname', 'tofind', { typeMap: { type: ['tofind'] } })
      expect(result).toBe('type')
    })
    it('should use the user type map even if available in the global map', () => {
      MockColumnSubTasks.__with__({
        TypeMap_1: {
          default: {
            'globaltype': ['tofind']
          }
        }
      })(() => {
        const result = MockColumnSubTasks.convertType('columnname', 'tofind', { typeMap: { type: ['tofind'] } })
        expect(result).toBe('type')
      })
    })
    it('should use a type override if available', () => {
      const result = MockColumnSubTasks.convertType('columnname', 'tofind', { typeOverrides: { 'columnname': 'type' } })
      expect(result).toBe('type')
    })
    it('should use the type override if available in the other maps', () => {
      MockColumnSubTasks.__with__({
        TypeMap_1: {
          default: {
            'globaltype': ['tofind']
          }
        }
      })(() => {
        const result = MockColumnSubTasks.convertType('columnname', 'tofind', { typeOverrides: { 'columnname': 'overridetype' }, typeMap: { usertype: ['tofind'] } })
        expect(result).toBe('overridetype')
      })
    })
    it('should use any if no override exists', () => {
      MockColumnSubTasks.__with__({
        TypeMap_1: {
          default: {
            'type': ['tofind1']
          }
        }
      })(() => {
        const result = MockColumnSubTasks.convertType('columnname', 'tofind', { typeOverrides: { 'columnname1': 'type' } })
        expect(result).toBe('any')
      })
    })
  })
  describe('generateFullColumnName', () => {
    it('should generate a name with a schema', () => {
      const result = MockColumnSubTasks.generateFullColumnName('table', 'schema', 'column')
      expect(result).toBe('table.schema.column')
    })
    it('should skip schema if blank', () => {
      const result = MockColumnSubTasks.generateFullColumnName('table', '', 'column')
      expect(result).toBe('table.column')
    })
    it('should skip schema if null', () => {
      const result = MockColumnSubTasks.generateFullColumnName('table', null, 'column')
      expect(result).toBe('table.column')
    })
  })
})
