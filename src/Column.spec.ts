import { Config } from './Typings';
import * as Column from './Column';
import * as rewire from 'rewire';

let RewireColumn = rewire('./Column')
const MockColumn: typeof Column & typeof RewireColumn = <any> RewireColumn

describe('Column', () => {
  describe('construction', () => {
    it('should populate the class falling back to string', () => {
      MockColumn.__set__({
        TypeMap_1: {
          default: { }
        }
      })
      const column = new MockColumn.default('name', false, 'type', { name: 'tableName' } as any, {} as any)
      expect(column.name).toBe('name')
      expect(column.type).toBe('type')
      expect(column.jsType).toBe('string')
    })
    it('should populate the class using the config override types', () => {
      MockColumn.__set__({
        TypeMap_1: {
          default: { }
        }
      })
      const typeOverrides = {
        'tableName.name': 'mappedType'
      }
      const column = new MockColumn.default('name', false, 'type', { name: 'tableName' } as any, { typeOverrides } as any)
      expect(column.name).toBe('name')
      expect(column.type).toBe('type')
      expect(column.jsType).toBe('mappedType')
    })
    it('should populate the class using the built in types', () => {
      MockColumn.__set__({
        TypeMap_1: {
          default: {
            mappedType: 'type'
          }
        }
      })
      const column = new MockColumn.default('name', false, 'type', { name: 'tableName' } as any, {} as any)
      expect(column.name).toBe('name')
      expect(column.type).toBe('type')
      expect(column.jsType).toBe('mappedType')
    })
  })
  describe('stringify', () => {
    it('should return the column as a nullable property', () => {
      const column = new MockColumn.default('name', true, 'type', { name: 'tableName' } as any, {} as any)
      column.jsType = 'mappedType'
      expect(column.stringify()).toEqual('name?: mappedType | null')
    })
    it('should return the column as a none nullable property', () => {
      const column = new MockColumn.default('name', false, 'type', { name: 'tableName' } as any, {} as any)
      column.jsType = 'mappedType'
      expect(column.stringify()).toEqual('name?: mappedType')
    })
  })
  describe('toObject', () => {
    it('should return the column as an object', () => {
      const column = new MockColumn.default('name', false, 'type', { name: 'tableName' } as any, {} as any)
      column.jsType = 'mappedType'
      expect(column.toObject()).toEqual({
        name: 'name',
        type: 'type',
        nullable: false,
        jsType: 'mappedType'
      })
    })
  })
})
