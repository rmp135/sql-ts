import * as postgres from './postgres';
import * as rewire from 'rewire';

let Rewirepostgres = rewire('./postgres')
const Mockpostgres: typeof postgres & typeof Rewirepostgres = <any> Rewirepostgres

describe('postgres', () => {
  describe('getAllTables', () => {
    it('should get all tables from all schemas', async (done) => {
      const mockWhereNotIn = jasmine.createSpy('whereNotIn').and.returnValue(Promise.resolve([1,2,3]))
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ whereNotIn: mockWhereNotIn })
      const mockSelectSchema = jasmine.createSpy('select').and.returnValue({ select: mockSelectName })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectSchema })
      const adapter = new Mockpostgres.default();
      const res = await adapter.getAllTables(mockdb as any, [])
      expect(mockdb).toHaveBeenCalledWith('pg_catalog.pg_tables')
      expect(mockSelectSchema).toHaveBeenCalledWith('schemaname AS schema')
      expect(mockSelectName).toHaveBeenCalledWith('tablename AS name')
      expect(mockWhereNotIn).toHaveBeenCalledWith('schemaname', ['pg_catalog', 'information_schema'])
      expect(res).toEqual([1,2,3] as any)
      done()
    })
    it('should get all tables from select schemas', async (done) => {
      const mockWhereIn = jasmine.createSpy('whereIn')
      const mockWhereNotIn = jasmine.createSpy('whereNotIn').and.returnValue({ whereIn: mockWhereIn })
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ whereNotIn: mockWhereNotIn })
      const mockSelectSchema = jasmine.createSpy('select').and.returnValue({ select: mockSelectName })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectSchema })
      const adapter = new Mockpostgres.default();
      const res = await adapter.getAllTables(mockdb as any, ['schema1', 'schema2'])
      expect(mockdb).toHaveBeenCalledWith('pg_catalog.pg_tables')
      expect(mockSelectSchema).toHaveBeenCalledWith('schemaname AS schema')
      expect(mockSelectName).toHaveBeenCalledWith('tablename AS name')
      expect(mockWhereNotIn).toHaveBeenCalledWith('schemaname', ['pg_catalog', 'information_schema'])
      expect(mockWhereIn).toHaveBeenCalledWith('schemaname', ['schema1', 'schema2'])
      done()
    })
  })
  describe('getAllColumns', () => {
    it('should get all tables from the current schema', async (done) => {
      const mockWhere = jasmine.createSpy('where').and.returnValue(Promise.resolve([1,2,3]))
      const mockSelectNullable = jasmine.createSpy('select').and.returnValue({ where: mockWhere })
      const mockSelectType = jasmine.createSpy('select').and.returnValue({ select: mockSelectNullable })
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ select: mockSelectType })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectName })
      const adapter = new Mockpostgres.default();
      const res = await adapter.getAllColumns(mockdb as any, 'table', 'schema')
      expect(mockdb).toHaveBeenCalledWith('information_schema.columns')
      expect(mockSelectName).toHaveBeenCalledWith('column_name AS name')
      expect(mockSelectType).toHaveBeenCalledWith('udt_name AS type')
      expect(mockSelectNullable).toHaveBeenCalledWith('is_nullable AS isNullable')
      expect(mockWhere).toHaveBeenCalledWith({ table_name: 'table', table_schema: 'schema' })
      expect(res).toEqual([1,2,3] as any)
      done()
    })
  })
})
