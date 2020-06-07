import * as mysql from './mysql';
const rewire = require('rewire')

let Rewiremysql = rewire('./mysql')
const Mockmysql: typeof mysql & typeof Rewiremysql = <any> Rewiremysql

describe('mysql', () => {
  describe('getAllTables', () => {
    it('should get all tables from all schemas', async (done) => {
      const mockWhereNotIn = jasmine.createSpy('whereNotIn').and.returnValue(Promise.resolve([1,2,3]))
      const mockSelectSchema = jasmine.createSpy('select').and.returnValue({ whereNotIn: mockWhereNotIn })
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ select: mockSelectSchema })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectName })
      const adapter = new Mockmysql.default();
      const res = await adapter.getAllTables(mockdb as any, [])
      expect(mockdb).toHaveBeenCalledWith('information_schema.tables')
      expect(mockSelectName).toHaveBeenCalledWith('TABLE_NAME AS name')
      expect(mockSelectSchema).toHaveBeenCalledWith('TABLE_SCHEMA AS schema')
      expect(mockWhereNotIn).toHaveBeenCalledWith('TABLE_SCHEMA', ['mysql', 'information_schema', 'performance_schema', 'sys'])
      expect(res).toEqual([1,2,3] as any)
      done()
    })
    it('should get all tables from specific schemas', async (done) => {
      const mockWhereIn = jasmine.createSpy('whereIn')
      const mockWhereNotIn = jasmine.createSpy('whereNotIn').and.returnValue({ whereIn: mockWhereIn })
      const mockSelectSchema = jasmine.createSpy('select').and.returnValue({ whereNotIn: mockWhereNotIn })
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ select: mockSelectSchema })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectName })
      const adapter = new Mockmysql.default();
      const res = await adapter.getAllTables(mockdb as any, ['schema1', 'schema2'])
      expect(mockdb).toHaveBeenCalledWith('information_schema.tables')
      expect(mockSelectName).toHaveBeenCalledWith('TABLE_NAME AS name')
      expect(mockSelectSchema).toHaveBeenCalledWith('TABLE_SCHEMA AS schema')
      expect(mockWhereNotIn).toHaveBeenCalledWith('TABLE_SCHEMA', ['mysql', 'information_schema', 'performance_schema', 'sys'])
      expect(mockWhereIn).toHaveBeenCalledWith('table_schema', ['schema1', 'schema2'])
      done()
    })
  })
  describe('getAllColumns', () => {
    it('should get all columns', async (done) => {
      const mockMap = jasmine.createSpy('map').and.returnValue([1,2,3])
      const mockWhere = jasmine.createSpy('where').and.returnValue({ map: mockMap })
      const mockSelectType = jasmine.createSpy('select').and.returnValue({ where: mockWhere })
      const mockSelectOptional = jasmine.createSpy('select').and.returnValue({ select: mockSelectType })
      const mockSelectNullable = jasmine.createSpy('select').and.returnValue({ select: mockSelectOptional })
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ select: mockSelectNullable })
      const mockRaw = jasmine.createSpy('raw').and.returnValue('rawReturn')
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectName })
      mockdb['raw'] = mockRaw
      const adapter = new Mockmysql.default();
      const res = await adapter.getAllColumns(mockdb as any, {}, 'table', 'schema')
      expect(mockdb).toHaveBeenCalledWith('information_schema.columns')
      expect(mockSelectName).toHaveBeenCalledWith('column_name AS name')
      expect(mockRaw).toHaveBeenCalledWith('(CASE WHEN is_nullable = \'NO\' THEN 0 ELSE 1 END) AS isNullable')
      expect(mockSelectNullable).toHaveBeenCalledWith('rawReturn')
      expect(mockRaw).toHaveBeenCalledWith('(SELECT CASE WHEN LOCATE(\'auto_increment\', extra) <> 0 OR COLUMN_DEFAULT IS NOT NULL THEN 1 ELSE 0 END) AS isOptional')
      expect(mockSelectOptional).toHaveBeenCalledWith('rawReturn')
      expect(mockSelectType).toHaveBeenCalledWith('data_type AS type')
      expect(mockWhere).toHaveBeenCalledWith({ table_name: 'table', table_schema: 'schema' })
      expect(res).toEqual([1,2,3] as any)
      done()
    })
  })
})
