import Column from './Column'
import Table from './Table'

describe('Column', () => {
  describe('Construction', () => {
    it('should populate properties with the parameters', () => {
      const table = {
        database: {
          config: {
            typeOverrides: {}
          }
        }
      } as Table
      const col = new Column('name', true, 'type', table)
      expect(col.name).toBe('name')
      expect(col.nullable).toBe(true)
      expect(col.type).toBe('type')
    })
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
      expect(col.jsType).toBe('type')
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
      expect(col.jsType).toBe('number')
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
      expect(col.jsType).toBe('string')
    })
  })
  describe('stringify', () => {
    it('should convert itself to a nullable string', () => {
      const mockTable = {
        name: 'table',
        database: {
          config: {
            typeOverrides: { }
          }
        }
      }
      const col = new Column('name', true, 'type', mockTable as any)
      col.jsType = 'jsType'
      const res = col.stringify()
      expect(res).toBe('name?: jsType | null')
    })
    it('should convert itself to a none nullable string', () => {
      const mockTable = {
        name: 'table',
        database: {
          config: {
            typeOverrides: { }
          }
        }
      }
      const col = new Column('name', false, 'type', mockTable as any)
      col.jsType = 'jsType'
      const res = col.stringify()
      expect(res).toBe('name?: jsType')
    })
  })
  describe('toObject', () => {
    it('should convert itself to a string', () => {
      const mockTable = {
        name: 'table',
        database: {
          config: {
            typeOverrides: {
              'table.name': 'jsType'
            }
          }
        }
      }
      const col = new Column('name', false, 'type', mockTable as any)
      const res = col.toObject()
      expect(res).toEqual({
        name: 'name',
        type: 'type',
        jsType: 'jsType',
        nullable: false
      })
    })
  })
})