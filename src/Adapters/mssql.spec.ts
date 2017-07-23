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
    it('should get all columns using knex', async (done) => {
      const mockColumns = {
        col1: {
          type: 'col1type',
          nullable: false
        },
        col2: {
          type: 'col2type',
          nullable: true
        }
      }
      const mockColumnInfo = jasmine.createSpy('columnInfo').and.returnValue(Promise.resolve(mockColumns))
      const mockdb = jasmine.createSpy('db').and.returnValue({ columnInfo: mockColumnInfo })
      const adapter = new Mockmssql.default();
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
