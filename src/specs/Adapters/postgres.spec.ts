import * as postgres from '../../Adapters/postgres'
import { Config } from '../..'
import rewire from 'rewire'

const Mockpostgres = rewire<typeof postgres>('../../Adapters/postgres')

describe('postgres', () => {
  describe('getAllTables', () => {
    it('should get all tables from all schemas', async () => {
      const mockRawReturn = { rows: [] }
      const mockRaw = jasmine.createSpy('raw').and.returnValue(Promise.resolve(mockRawReturn))
      const mockdb = { raw: mockRaw }
      const adapter = new Mockpostgres.default();
      const res = await adapter.getAllTables(mockdb as any, [])
      expect(mockRaw.calls.first().args[0]).not.toContain('AND nspname = ANY(:schemas)')
      expect(res).toEqual([] as any)
    })
    it('should get tables from specified schemas', async () => {
      const mockRawReturn = { rows: [] }
      const mockRaw = jasmine.createSpy('raw').and.returnValue(Promise.resolve(mockRawReturn))
      const mockdb = { raw: mockRaw }
      const adapter = new Mockpostgres.default();
      const res = await adapter.getAllTables(mockdb as any, ['schema1', 'schema2'])
      expect(mockRaw.calls.first().args[0]).toContain('AND nspname = ANY(:schemas)')
      expect(mockRaw.calls.first().args[1]).toEqual({ schemas: ['schema1', 'schema2'] })
      expect(res).toEqual([] as any)
    })
  })
  describe('getAllColumnsTables', () => {
    it('should get all columns for a given table and schema', async () => {
      const mockRawReturn = { 
        rows: [
          {
            name: 'name',
            type: 'type',
            notnullable: false,
            hasdefault: false,
            typcategory: 'E',
            typeschema: 'schema',
            typname: 'typname',
            isprimarykey: 0,
            comment: 'comment'
          },
          {
            name: 'name2',
            type: 'type2',
            notnullable: true,
            hasdefault: true,
            typcategory: 'S',
            typeschema: 'schema2',
            typname: 'typname2',
            isprimarykey: 1,
            comment: 'comment2'
          },
          {
            name: 'name3',
            type: 'type3',
            notnullable: false,
            hasdefault: true,
            typcategory: 'E',
            typeschema: 'schema3',
            typname: 'typname3',
            isprimarykey: 0,
            comment: 'comment3'
          },
          {
            name: 'name4',
            type: 'type4',
            notnullable: true,
            hasdefault: false,
            typcategory: 'D',
            typeschema: 'schema4',
            typname: 'typname4',
            isprimarykey: 0,
            comment: ''
          },
        ]
      }
      const mockRaw = jasmine.createSpy('raw').and.returnValue(Promise.resolve(mockRawReturn))
      const mockdb = { raw: mockRaw }
      const adapter = new Mockpostgres.default();
      const mockConfig = {} as Config
      const res = await adapter.getAllColumns(mockdb as any, mockConfig, 'table', 'schema')
      expect(mockRaw.calls.first().args[0]).toContain('pg_class.relname = :table')
      expect(mockRaw.calls.first().args[0]).toContain('pg_namespace.nspname = :schema')
      expect(mockRaw.calls.first().args[1]).toEqual({ table: 'table', schema: 'schema' })
      expect(res).toEqual([
        {
          name: 'name',
          type: 'typname',
          enumSchema: 'schema',
          nullable: true,
          optional: true,
          isEnum: true,
          isPrimaryKey: false,
          comment: 'comment'
        },
        {
          name: 'name2',
          type: 'typname2',
          enumSchema: 'schema2',
          nullable: false,
          optional: true,
          isEnum: false,
          isPrimaryKey: true,
          comment: 'comment2'
        },
        {
          name: 'name3',
          type: 'typname3',
          enumSchema: 'schema3',
          nullable: true,
          optional: true,
          isEnum: true,
          isPrimaryKey: false,
          comment: 'comment3'
        },
        {
          name: 'name4',
          type: 'typname4',
          enumSchema: 'schema4',
          nullable: false,
          optional: false,
          isEnum: false,
          isPrimaryKey: false,
          comment: ''
        },
      ])
    })
  })
})
