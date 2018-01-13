import 'jasmine'
import * as TableSubTasks from './TableSubTasks';
const rewire = require('rewire')

let RewireTableSubTasks = rewire('./TableSubTasks')
const MockTableSubTasks: typeof TableSubTasks & typeof RewireTableSubTasks = <any> RewireTableSubTasks

describe('TableSubTasks', () => {
  describe('generateTableNames', () => {
    it('should generate the default table name', () => {
      const mockConfig = { }
      const result = MockTableSubTasks.generateInterfaceName('name', mockConfig)
      expect(result).toBe('nameEntity')
    })
    it('should generate a configuration supplied format', () => {
      const mockConfig = {
        interfaceNameFormat: '${table}Name'
      }
      const result = MockTableSubTasks.generateInterfaceName('name', mockConfig)
      expect(result).toBe('nameName')
    })
    it('should replace spaces with underscores', () => {
      const mockConfig = { }
      const result = MockTableSubTasks.generateInterfaceName('n a m e', mockConfig)
      expect(result).toBe('n_a_m_eEntity')
    })
  })

})