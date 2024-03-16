import { describe, vi, it, expect } from 'vitest'
import * as SharedAdapterTasks from '../../Adapters/SharedAdapterTasks'
import { Config } from '../../Typings'
import { Knex } from 'knex'

describe('getTableEnums', () => {
  it('should retrieve table enums', async () => {
    const db = () => {
      return {
        select: () => Promise.resolve([
          { Key: 'key1', Value: 'value1' },
          { Key: 'key2', Value: 'value2' }
        ])
      }
    }
    const config: Config = {
      tableEnums: {
        'schema.table': {
          key: 'key',
          value: 'value'
        }
      }
    }
    const result = await SharedAdapterTasks.getTableEnums(db as Knex, config)
    expect(result).toEqual([
      {
        name: 'table',
        schema: 'schema',
        values: {
          key1: 'value1',
          key2: 'value2',
        }
      }
    ])
  })
})
