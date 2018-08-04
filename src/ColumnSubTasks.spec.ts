import 'jasmine'
import * as ColumnSubTasks from './ColumnSubTasks'
const rewire = require('rewire')

let RewireColumnSubTasks = rewire('./ColumnSubTasks')
const MockColumnSubTasks: typeof ColumnSubTasks & typeof RewireColumnSubTasks = <any> RewireColumnSubTasks

describe('ColumnSubTasks', () => {
  describe('generateFullColumnName', () => {
    it('should generate a name with a schema', () => {
      const result = MockColumnSubTasks.generateFullColumnName('table', 'schema', 'column')
      expect(result).toBe('schema.table.column')
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
