import * as mssql from './mssql';
const rewire = require('rewire')

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
      expect(mockdb).toHaveBeenCalledWith('INFORMATION_SCHEMA.TABLES')
      expect(mockSelectName).toHaveBeenCalledWith('TABLE_NAME AS name')
      expect(mockSelectSchema).toHaveBeenCalledWith('TABLE_SCHEMA AS schema')
      expect(res).toEqual([1,2,3] as any)
      done()
    })
    it('should get all tables from specific schemas', async (done) => {
      const mockWhereIn = jasmine.createSpy('whereIn')
      const mockSelectSchema = jasmine.createSpy('select').and.returnValue({ whereIn: mockWhereIn })
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ select: mockSelectSchema })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectName })
      const adapter = new Mockmssql.default();
      const res = await adapter.getAllTables(mockdb as any, ['schema1', 'schema2'])
      expect(mockdb).toHaveBeenCalledWith('INFORMATION_SCHEMA.TABLES')
      expect(mockSelectName).toHaveBeenCalledWith('TABLE_NAME AS name')
      expect(mockSelectSchema).toHaveBeenCalledWith('TABLE_SCHEMA AS schema')
      expect(mockWhereIn).toHaveBeenCalledWith('TABLE_SCHEMA', ['schema1', 'schema2'])
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
      const mockRaw = jasmine.createSpy('raw').and.returnValue('mockrawreturn')
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectName })
      mockdb['raw'] = mockRaw
      const adapter = new Mockmssql.default();
      const res = await adapter.getAllColumns(mockdb as any, {}, 'table', 'schema')
      expect(mockdb).toHaveBeenCalledWith('INFORMATION_SCHEMA.COLUMNS')
      expect(mockSelectName).toHaveBeenCalledWith('COLUMN_NAME AS name')
      expect(mockSelectNullable).toHaveBeenCalledWith('IS_NULLABLE AS isNullable')
      expect(mockRaw).toHaveBeenCalledWith('CASE WHEN COLUMNPROPERTY(object_id(TABLE_SCHEMA+\'.\'+TABLE_NAME), COLUMN_NAME, \'IsIdentity\') = 1 OR COLUMN_DEFAULT IS NOT NULL THEN 1 ELSE 0 END AS isOptional')
      expect(mockSelectOptional).toHaveBeenCalledWith('mockrawreturn')
      expect(mockSelectType).toHaveBeenCalledWith('DATA_TYPE AS type')
      expect(mockWhere).toHaveBeenCalledWith({ table_name: 'table', table_schema: 'schema' })
      expect(res).toEqual([1,2,3] as any)
      done()
    })
  })
})
