import * as sqlite from './sqlite3';
import * as rewire from 'rewire';

let Rewiresqlite = rewire('./sqlite')
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
    it('should get all columns using knex', async (done) => {
      const mockColumns = {
        col1: {
          type: 'col1type',
          nullable: false
        },
        col2: {
          type: 'col2type',
          nullable: true
        },
      }
      const mockColumnInfo = jasmine.createSpy('columnInfo').and.returnValue(Promise.resolve(mockColumns))
      const mockdb = jasmine.createSpy('db').and.returnValue({ columnInfo: mockColumnInfo })
      const adapter = new Mocksqlite.default();
      const res = await adapter.getAllColumns(mockdb as any, 'table', 'schema')
      expect(mockdb).toHaveBeenCalledWith('table')
      expect(mockColumnInfo).toHaveBeenCalled()
      expect(res).toEqual([
        { name: 'col1', type: 'col1type', isNullable: false },
        { name: 'col2', type: 'col2type', isNullable: true }
      ])
      done()
    })
  })
})
