import * as SchemaTasks from '../SchemaTasks'
import 'jasmine'

describe('SchemaTasks', () => {
  describe('generateSchemaName', () => {
    it('should remove none alphanumeric characters', () => {
      const result = SchemaTasks.generateSchemaName('.t. h-.i+s._[is_].a @s~3ch44m a')
      expect(result).toEqual('this_is_as3ch44ma')
    })
    it('should remove numbers at the start', () => {
      const result = SchemaTasks.generateSchemaName('78123_schema123')
      expect(result).toEqual('_schema123')
    })
  })
})