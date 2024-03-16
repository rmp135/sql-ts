import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as AdapterFactory from '../AdapterFactory'
import { AdapterInterface } from '../Adapters/AdapterInterface'
import * as EnumTasks from '../EnumTasks'
import { Config, Enum } from '../Typings'

vi.mock('../AdapterFactory')

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getAllEnums', () => {
  it('should return all enums for a table sorted', async () => {
    const mockAdapter = {
      getAllEnums: vi.fn().mockReturnValue([
        {
          name: 'cname',
          schema: 'schema',
          values: {
            'key 1': 'val1'
          }
        },
        {
          name: 'aname',
          schema: 'schema',
          values: {
            'key 1': 'val1'
          }
        },
      ])
    }
    vi.mocked(AdapterFactory.buildAdapter).mockReturnValue(mockAdapter as unknown as AdapterInterface)
    const db = {
      client: {
        dialect: 'dialect'
      }
    }
    const config = {
      enumNumericKeyFormat: '$key}',
      enumNameFormat: '${name}',
    }
    const result = await EnumTasks.getAllEnums(db as any, config as any)
    expect(result).toEqual<Enum[]>([
      {
        convertedName: 'aname',
        name: 'aname',
        schema: 'schema',
        values: [
          {
            convertedKey: 'key 1',
            originalKey: 'key 1',
            value: 'val1'
          }
        ]
      },
      {
        convertedName: 'cname',
        name: 'cname',
        schema: 'schema',
        values: [
          {
            convertedKey: 'key 1',
            originalKey: 'key 1',
            value: 'val1'
          }
        ]
      },
    ])
  })
})

describe('generateEnumName', () => {
  it('should generate an enum name, removing invalid characters', () => {
    const config = {
      enumNameCasing: '',
      enumNameFormat: '${name}Entity'
    }
    expect(EnumTasks.generateEnumName('name ;] 2', config as any)).toBe('name2Entity')
  })
})

describe('generateEnumKey', () => {
  it('should use the config for numeric keys', () => {
    const config = {
      enumKeyCasing: '',
      enumNumericKeyFormat: '${key}Key'
    }
    expect(EnumTasks.generateEnumKey('1', config as any)).toBe('1Key')
  })
  it('should return the key exact if not a number', () => {
    const config = {
      enumKeyCasing: '',
      enumNumericKeyFormat: '${key}Key'
    }
    expect(EnumTasks.generateEnumKey('notanumber', config as any)).toBe('notanumber')
  })
})