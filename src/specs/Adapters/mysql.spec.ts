import { ColumnDefinition } from '../../Adapters/AdapterInterface'
import * as mysql from '../../Adapters/mysql'
const rewire = require('rewire')

let Rewiremysql = rewire('../../Adapters/mysql')
const Mockmysql: typeof mysql & typeof Rewiremysql = <any> Rewiremysql

describe('mysql', () => {
  describe('getAllTables', () => {
    it('should get all tables from all schemas', async () => {
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
    })
    it('should get all tables from specific schemas', async () => {
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
    })
  })
  describe('getAllColumns', () => {
    it('should get all columns', async () => {
      const mockRawReturn = [[
        {
          name: 'name',
          type: 'type',
          isNullable: 'YES',
          isOptional: 1,
          isEnum: false,
          isPrimaryKey: 1
        },
        {
          name: 'name2',
          type: 'type2',
          isNullable: 'NO',
          isOptional: 0,
          isEnum: false,
          isPrimaryKey: 0
        },
      ]]
      const mockRaw = jasmine.createSpy('raw').and.returnValue(mockRawReturn)
      const mockdb = jasmine.createSpy('db').and.returnValue({ raw: mockRawReturn  })
      mockdb['raw'] = mockRaw
      const adapter = new Mockmysql.default();
      const res = await adapter.getAllColumns(mockdb as any, {}, 'table', 'schema')
      expect(mockRaw).toHaveBeenCalledWith(jasmine.any(String), { table: 'table', schema: 'schema' })
      expect(res).toEqual(
        [
          {
            name: 'name',
            type: 'type',
            nullable: true,
            optional: true,
            isEnum: false,
            isPrimaryKey: true
          },
          {
            name: 'name2',
            type: 'type2',
            nullable: false,
            optional: false,
            isEnum: false,
            isPrimaryKey: false
          }
        ] as ColumnDefinition[])
    })
  })
})
