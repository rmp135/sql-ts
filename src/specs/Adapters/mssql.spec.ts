import { ColumnDefinition } from '../../Adapters/AdapterInterface'
import * as mssql from '../../Adapters/mssql'
const rewire = require('rewire')

let Rewiremssql = rewire('../../Adapters/mssql')
const Mockmssql: typeof mssql & typeof Rewiremssql = <any> Rewiremssql

describe('mssql', () => {
  describe('getAllTables', () => {
    it('should get all tables from all schemas', async () => {
      const mockSelectSchema = jasmine.createSpy('select').and.returnValue(Promise.resolve([1,2,3]))
      const mockSelectName = jasmine.createSpy('select').and.returnValue({ select: mockSelectSchema })
      const mockdb = jasmine.createSpy('db').and.returnValue({ select: mockSelectName })
      const adapter = new Mockmssql.default();
      const res = await adapter.getAllTables(mockdb as any, [])
      expect(mockdb).toHaveBeenCalledWith('INFORMATION_SCHEMA.TABLES')
      expect(mockSelectName).toHaveBeenCalledWith('TABLE_NAME AS name')
      expect(mockSelectSchema).toHaveBeenCalledWith('TABLE_SCHEMA AS schema')
      expect(res).toEqual([1,2,3] as any)
    })
    it('should get all tables from specific schemas', async () => {
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
    })
  })
  describe('getAllColumns', () => {
    it('should get all columns', async () => {
      const mockRawReturn = [
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
        }
      ]
      const mockRaw = jasmine.createSpy('raw').and.returnValue(Promise.resolve(mockRawReturn))
      const mockdb = jasmine.createSpy('db').and.returnValue({ raw: mockRaw })
      mockdb['raw'] = mockRaw
      const adapter = new Mockmssql.default();
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
