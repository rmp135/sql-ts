import 'jasmine'
import * as SharedTasks from './SharedTasks'

describe('SharedTasks', () => {
  describe('convertCase', () => {
    it('should return the original table name if case type is undefined', () => {
      const result = SharedTasks.convertCase('table_name', undefined)
      expect(result).toEqual('table_name')
    })
    it('should return the original table name and warn if the case type is invalid', () => {
      const result = SharedTasks.convertCase('table_name', 'invalid')
      expect(result).toEqual('table_name')
    })
    it('should return pascal if caseType is pascal', () => {
      const result = SharedTasks.convertCase('table_name', 'pascal')
      expect(result).toEqual('TableName')
    })
    it('should return camel if caseType is camel', () => {
      const result = SharedTasks.convertCase('table_name', 'camel')
      expect(result).toEqual('tableName')
    })
  })
})