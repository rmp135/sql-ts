import * as mssql from './mssql';
import * as rewire from 'rewire';

let Rewiremssql = rewire('./mssql')
const Mockmssql: typeof mssql & typeof Rewiremssql = <any> Rewiremssql

describe('mssql', () => {
  describe('getAllTables', () => {
    it('should get all tables from all schemas', async (done) => {
      const mockSelectSchema = jasmine.createSpy('select').and.returnValue(Promise.resolve([1,2,3]))
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ select: mockSelectSchema })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectName })
      const adapter = new Mockmssql.default();
      const res = await adapter.getAllTables(mockdb as any, [])
      expect(mockdb).toHaveBeenCalledWith('information_schema.tables')
      expect(mockSelectName).toHaveBeenCalledWith('TABLE_NAME AS name')
      expect(mockSelectSchema).toHaveBeenCalledWith('TABLE_SCHEMA AS schema')
      expect(res).toEqual([1,2,3] as any)
      done()
    })
  })
  describe('getAllColumns', () => {
    it('should get all columns', async (done) => {
      const mockMap = jasmine.createSpy('map').and.returnValue([1,2,3])
      const mockWhere = jasmine.createSpy('where').and.returnValue({ map: mockMap })
      const mockSelectType = jasmine.createSpy('select').and.returnValue({ where: mockWhere })
      const mockSelectNullable = jasmine.createSpy('select').and.returnValue({ select: mockSelectType })
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ select: mockSelectNullable })
      const mockRaw = jasmine.createSpy('raw').and.returnValue('rawReturn')
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectName })
      mockdb['raw'] = mockRaw
      const adapter = new Mockmssql.default();
      const res = await adapter.getAllColumns(mockdb as any, 'table', 'schema')
      expect(mockdb).toHaveBeenCalledWith('information_schema.columns')
      expect(mockSelectName).toHaveBeenCalledWith('COLUMN_NAME AS name')
      expect(mockRaw).toHaveBeenCalledWith(`(CASE WHEN IS_NULLABLE = 'NO' THEN 0 ELSE 1 END) AS isNullable`)
      expect(mockSelectNullable).toHaveBeenCalledWith('rawReturn')
      expect(mockSelectType).toHaveBeenCalledWith('DATA_TYPE AS type')
      expect(mockWhere).toHaveBeenCalledWith({ table_name: 'table', table_schema: 'schema' })
      expect(res).toEqual([1,2,3] as any)
      done()
    })
  })
})
