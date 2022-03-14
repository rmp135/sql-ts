import * as SharedAdapterTasks from '../../Adapters/SharedAdapterTasks'
import { Config } from '../..'
import rewire from 'rewire'

const MockSharedAdaterTasks = rewire<typeof SharedAdapterTasks>('../../Adapters/SharedAdapterTasks')

describe('SharedAdapterTasks', () => {
  describe('getTableEnums', () => {
    it('should return empty when no enums are specified', async () => {
      const mockConfig = { 
        tableEnums: {} 
      }
      const mockSelect = jasmine.createSpy('select').and.returnValue(Promise.resolve({  }))
      const mockRawReturn = { select: mockSelect }
      const mockDB = jasmine.createSpy('db').and.returnValue(mockRawReturn)
      const res = await MockSharedAdaterTasks.getTableEnums(mockDB as any, mockConfig as any)
      expect(res).toEqual([])
    })
    it('should return when enums are specified', async () => {
      const mockConfig = { 
        tableEnums: {
          'schema.table': {
            key: 'key',
            value: 'value'
          }
        }
      }
      const mockSelect = jasmine.createSpy('select').and.returnValue(Promise.resolve([
        { Key: 'key1', Value: 'value1' },
        { Key: 'key2', Value: 'value2' }
      ]))
      const mockRawReturn = { select: mockSelect }
      const mockDB = jasmine.createSpy('db').and.returnValue(mockRawReturn)
      const res = await MockSharedAdaterTasks.getTableEnums(mockDB as any, mockConfig as any)
      expect(res).toEqual([
        {
          name: 'table',
          schema: 'schema',
          values: {
            key1: 'value1',
            key2: 'value2'
          }
        }
      ])
    })
  })
})
