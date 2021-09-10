import * as sqlite from '../../Adapters/sqlite'
import rewire from 'rewire'

const Mocksqlite = rewire<typeof sqlite>('../../Adapters/sqlite')

describe('sqlite', () => {
  describe('getAllTables', () => {
    it('should get all tables settings the schema to the current database', async () => {
      const mockMap = jasmine.createSpy('map').and.returnValue([1,2,3])
      const mockWhereIn = jasmine.createSpy('whereIn').and.returnValue({ map: mockMap })
      const mockWhereNot = jasmine.createSpy('whereNot').and.returnValue({ whereIn: mockWhereIn })
      const mockSelect = jasmine.createSpy('select').and.returnValue({ whereNot: mockWhereNot })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelect })
      const adapter = new Mocksqlite.default();
      const res = await adapter.getAllTables(mockdb as any, [])
      expect(mockdb).toHaveBeenCalledWith('sqlite_master')
      expect(mockWhereIn).toHaveBeenCalledWith('type', ['table', 'view'])
      expect(mockSelect).toHaveBeenCalledWith('tbl_name AS name')
      expect(mockWhereNot).toHaveBeenCalledWith({ tbl_name: 'sqlite_sequence' })
      expect(mockMap).toHaveBeenCalled()
      expect(res).toEqual([1,2,3] as any)
    })
  })
  describe('getAllColumns', () => {
    it('should get all columns', async () => {
      const mockTables = [
        {
          name: 'name1',
          notnull: 0,
          type: 'type(123)',
          dflt: null,
          pk: 0
        }
      ]
      const mockRaw = jasmine.createSpy('raw').and.returnValue(mockTables)
      const mockdb = jasmine.createSpy('db')
      mockdb['raw'] = mockRaw

      const adapter = new Mocksqlite.default();
      const res = await adapter.getAllColumns(mockdb as any, {}, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          nullable: true,
          type: 'type',
          optional: true,
          isEnum: false,
          isPrimaryKey: false
        }
      ])
    })
    it('should get all columns with default', async () => {
      const mockTables = [
        {
          name: 'name1',
          notnull: 0,
          type: 'type',
          dflt: 1234,
          pk: 0
        }
      ]
      const mockRaw = jasmine.createSpy('raw').and.returnValue(mockTables)
      const mockdb = jasmine.createSpy('db')
      mockdb['raw'] = mockRaw

      const adapter = new Mocksqlite.default();
      const res = await adapter.getAllColumns(mockdb as any, {}, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          nullable: true,
          type: 'type',
          optional: true,
          isEnum: false,
          isPrimaryKey: false
        }
      ])
    })
    it('should get all columns with primary key', async () => {
      const mockTables = [
        {
          name: 'name1',
          notnull: 0,
          type: 'type',
          dflt: null,
          pk: 1
        }
      ]
      const mockRaw = jasmine.createSpy('raw').and.returnValue(mockTables)
      const mockdb = jasmine.createSpy('db')
      mockdb['raw'] = mockRaw

      const adapter = new Mocksqlite.default();
      const res = await adapter.getAllColumns(mockdb as any, {}, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          nullable: true,
          type: 'type',
          optional: true,
          isEnum: false,
          isPrimaryKey: true
        }
      ])
    })
    it('should get all columns not nullable', async () => {
      const mockTables = [
        {
          name: 'name1',
          notnull: 1,
          type: 'type',
          dflt: null,
          pk: 0
        }
      ]
      const mockRaw = jasmine.createSpy('raw').and.returnValue(mockTables)
      const mockdb = jasmine.createSpy('db')
      mockdb['raw'] = mockRaw

      const adapter = new Mocksqlite.default();
      const res = await adapter.getAllColumns(mockdb as any, {}, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          nullable: false,
          type: 'type',
          optional: false,
          isEnum: false,
          isPrimaryKey: false
        }
      ])
    })
    it('should get all columns with parentheses', async () => {
      const mockTables = [
        {
          name: 'name1',
          notnull: 0,
          type: 'type(123,33)',
          dflt: null,
          pk: 1
        }
      ]
      const mockRaw = jasmine.createSpy('raw').and.returnValue(mockTables)
      const mockdb = jasmine.createSpy('db')
      mockdb['raw'] = mockRaw

      const adapter = new Mocksqlite.default();
      const res = await adapter.getAllColumns(mockdb as any, {}, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          nullable: true,
          type: 'type',
          optional: true,
          isEnum: false,
          isPrimaryKey: true
        }
      ])
    })
  })
})
