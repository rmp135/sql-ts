import * as sqlite from './sqlite3';
const rewire = require('rewire')

let Rewiresqlite = rewire('./sqlite3')
const Mocksqlite: typeof sqlite & typeof Rewiresqlite = <any> Rewiresqlite

describe('sqlite', () => {
  describe('getAllTables', () => {
    it('should get all tables settings the schema to the current database', async (done) => {
      const mockMap = jasmine.createSpy('map').and.returnValue([1,2,3])
      const mockWhere = jasmine.createSpy('where').and.returnValue({ map: mockMap })
      const mockWhereNot = jasmine.createSpy('whereNot').and.returnValue({ where: mockWhere })
      const mockSelect = jasmine.createSpy('select').and.returnValue({ whereNot: mockWhereNot })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelect })
      const adapter = new Mocksqlite.default();
      const res = await adapter.getAllTables(mockdb as any, [])
      expect(mockdb).toHaveBeenCalledWith('sqlite_master')
      expect(mockSelect).toHaveBeenCalledWith('tbl_name AS name')
      expect(mockWhereNot).toHaveBeenCalledWith({ tbl_name: 'sqlite_sequence' })
      expect(mockMap).toHaveBeenCalled()
      expect(res).toEqual([1,2,3] as any)
      done()
    })
  })
  describe('getAllColumns', () => {
    it('should get all columns', async (done) => {
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
      const res = await adapter.getAllColumns(mockdb as any, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          isNullable: true,
          type: 'type',
          isOptional: false
        }
      ])
      done()
    })
    it('should get all columns with default', async (done) => {
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
      const res = await adapter.getAllColumns(mockdb as any, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          isNullable: true,
          type: 'type',
          isOptional: true
        }
      ])
      done()
    })
    it('should get all columns with primary key', async (done) => {
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
      const res = await adapter.getAllColumns(mockdb as any, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          isNullable: true,
          type: 'type',
          isOptional: true
        }
      ])
      done()
    })
    it('should get all columns not nullable', async (done) => {
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
      const res = await adapter.getAllColumns(mockdb as any, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          isNullable: false,
          type: 'type',
          isOptional: false
        }
      ])
      done()
    })
    it('should get all columns with parentheses', async (done) => {
      const mockTables = [
        {
          name: 'name1',
          notnull: 0,
          type: 'type(123,33)',
          dflt: null,
          pk: 0
        }
      ]
      const mockRaw = jasmine.createSpy('raw').and.returnValue(mockTables)
      const mockdb = jasmine.createSpy('db')
      mockdb['raw'] = mockRaw

      const adapter = new Mocksqlite.default();
      const res = await adapter.getAllColumns(mockdb as any, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith('pragma table_info(table)')
      expect(res).toEqual([
        {
          name: 'name1',
          isNullable: true,
          type: 'type',
          isOptional: false
        }
      ])
      done()
    })
  })
})
