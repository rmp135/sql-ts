import 'jasmine'
import * as TableSubTasks from './TableSubTasks'
import { Config } from '.'

describe('TableSubTasks', () => {
  describe('getAdditionalProperties', () => {
    it('should return empty properties when none are specified', () => {
      var result = TableSubTasks.getAdditionalProperties('table', 'schema', {})
      expect(result).toEqual([])
    })
    it('should return the properties associated with the full name of the table', () => {
      const mockConfig: Config = {
        additionalProperties: {
          'schema.table': ['example property'],
          'schema2.table': ['not example property'],
        }
      }
      var result = TableSubTasks.getAdditionalProperties('table', 'schema', mockConfig)
      expect(result).toEqual(['example property'])
    })
  })
  describe('getExtends', () => {
    it('should return an empty string if no config option exists', () => {
      const mockConfig: Config = { }
      var result = TableSubTasks.getExtends('table', 'schema', mockConfig)
      expect(result).toEqual('')
    })
    it('should return the config associated with the full table name', () => {
      const mockConfig: Config = {
        extends: {
          'schema.table': 'extend me',
          'schema2.table': 'not me'
        }
      }
      var result = TableSubTasks.getExtends('table', 'schema', mockConfig)
      expect(result).toEqual('extend me')
    })
  })
})