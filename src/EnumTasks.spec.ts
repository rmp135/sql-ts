import 'jasmine'
import * as EnumTasks from './EnumTasks';
import { EnumDefinition } from './Adapters/AdapterInterface';
const rewire = require('rewire')

let RewireEnumTasks = rewire('./EnumTasks')
const MockEnumTasks: typeof EnumTasks & typeof RewireEnumTasks = <any> RewireEnumTasks

describe('EnumTasks', () => {
  describe('getAllEnums', () => {
    it('should return all columns for a table', (done) => {
      const mockEnums: EnumDefinition[] = [
        {
          name: 'cname',
          schema: 'schema',
          values: {
            'val1': 'val1'
          }
        }
      ]
      const mockAdapter = {
        getAllEnums: jasmine.createSpy('getAllEnums').and.returnValue(mockEnums)
      }
      const mockAdapterFactory = {
        buildAdapter: jasmine.createSpy('buildAdapter').and.returnValue(mockAdapter)
      }
      MockEnumTasks.__with__({
        AdapterFactory: mockAdapterFactory
      })(async () => {
        const db = {}
        const config = {
          dialect: 'dialect',
          columnNameCasing: 'camel'
        }
        const result = await MockEnumTasks.getAllEnums(db as any, config as any)
        expect(mockAdapterFactory.buildAdapter).toHaveBeenCalledWith(config)
        expect(mockAdapter.getAllEnums).toHaveBeenCalledWith(db, config)
        expect(result).toEqual([
          {
            name: 'cname',
            schema: 'schema',
            values: {
              'val1': 'val1'
            }
          }
        ])
        done()
      })
    })
  })
})