import 'jasmine'
import { Config } from '..'
import * as SharedTasks from '../SharedTasks'

describe('SharedTasks', () => {
  describe('convertCase', () => {
    it('should return the original table name if case type is undefined', () => {
      const result = SharedTasks.convertCase('table_name', undefined)
      expect(result).toEqual('table_name')
    })
    it('should return the original table if the case type is invalid', () => {
      const result = SharedTasks.convertCase('table_name', 'invalid' as any)
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
    it('should return lower if caseType is lower', () => {
      const result = SharedTasks.convertCase('tAbLe_NaMe', 'lower')
      expect(result).toEqual('table_name')
    })
    it('should return upper if caseType is upper', () => {
      const result = SharedTasks.convertCase('tAbLe_NaMe', 'upper')
      expect(result).toEqual('TABLE_NAME')
    })
    it('should keep casing for letters after the first', () => {
      const result = SharedTasks.convertCase('TableNameWithUppercase', 'camel')
      expect(result).toEqual('tableNameWithUppercase')
    })
    it('should merge numbers at the end of camel case', () => {
      const result = SharedTasks.convertCase('Table_Name-With_2', 'camel')
      expect(result).toEqual('tableNameWith2')
    })
    it('should merge numbers at the end of pascal case', () => {
      const result = SharedTasks.convertCase('Table_Name-With_2', 'pascal')
      expect(result).toEqual('TableNameWith2')
    })
  })
  describe('resolveAdapterName', () => {
    it('should resolve the same adapter name if no matching dialect alias exists', () => {
      const mockConfig: Config = {
        dialect: 'test'
      }
      const result = SharedTasks.resolveAdapterName('test')
      expect(result).toEqual('test')
    })
    it('should resolve adapter alias from client', () => {
      const result = SharedTasks.resolveAdapterName('pg')
      expect(result).toEqual('postgres')
    })
    it('should resolve adapter alias from dialect', () => {
      const result = SharedTasks.resolveAdapterName('pg')
      expect(result).toEqual('postgres')
    })
  })
})