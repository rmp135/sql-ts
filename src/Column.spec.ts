import Column from './Column'
import Table from './Table'

describe('Column', () => {
  describe('Construction', () => {
    it('should populate properties with the parameters', () => {
      const table = {} as Table
      const col = new Column('name', true, 'type', table)
      expect(col.name).toBe('name')
      expect(col.nullable).toBe(true)
      expect(col.type).toBe('type')
      expect(col.table).toBe(table)
    })
  })
  describe('nullableString', () => {
    it('should return the nullable string when true', () => {
      const col = new Column('', true, '', {} as Table)
      expect(col.nullableString()).toBe(' | null')
    })
    it('should return an empty string when false', () => {
      const col = new Column('', false, '', {} as Table)
      expect(col.nullableString()).toBe('')
    })
  })
  describe('convertType', () => {
    it('should use the overrides if available', () => {
      const mockTable = {
        name: 'table',
        database: {
          config: {
            typeOverrides: {
              'table.name': 'type'
            }
          }
        }
      }
      const col = new Column('name', false, '', mockTable as any)
      const type = col.convertType()
      expect(type).toBe('type')
    })
    it('should use the lookup table', () => {
      const mockTable = {
        name: 'table',
        database: {
          config: {
          }
        }
      }
      const col = new Column('name', false, 'numeric', mockTable as any)
      const type = col.convertType()
      expect(type).toBe('number')
    })
    it('should fall back to string', () => {
      const mockTable = {
        name: 'table',
        database: {
          config: {
          }
        }
      }
      const col = new Column('name', false, 'notatype', mockTable as any)
      const type = col.convertType()
      expect(type).toBe('string')
    })
  })
  describe('stringify', () => {
    it('should convert itself to a string', () => {
      const col = new Column('name', false, 'type', {} as any)
      col.convertType = jasmine.createSpy('convertType').and.returnValue('convertedType')
      col.nullableString = jasmine.createSpy('nullableString').and.returnValue('nulledString')
      const res = col.stringify()
      expect(res).toBe('name?: convertedTypenulledString')
    })
  })
})