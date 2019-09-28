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
  describe('convertTableCase', () => {
    it('should return the original table name if case type is undefined', () => {
      const result = TableSubTasks.convertTableCase('table_name', undefined)
      expect(result).toEqual('table_name')
    })
    it('should return the original table name and warn if the case type is invalid', () => {
      const origwarn = console.warn
      console.warn = jasmine.createSpy('warn')
      const result = TableSubTasks.convertTableCase('table_name', 'invalid')
      expect(console.warn).toHaveBeenCalledWith('Config option tableNameCasing was supplied with invalid value "invalid".')
      expect(result).toEqual('table_name')
      console.warn = origwarn
    })
    it('should return pascal if caseType is pascal', () => {
      const result = TableSubTasks.convertTableCase('table_name', 'pascal')
      expect(result).toEqual('TableName')
    })
    it('should return camel if caseType is camel', () => {
      const result = TableSubTasks.convertTableCase('table_name', 'camel')
      expect(result).toEqual('tableName')
    })
  })
})