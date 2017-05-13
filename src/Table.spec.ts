import * as Table from './Table'
import Database from './Database'
import * as Column from './Column'
import * as rewire from 'rewire'

let RewireTable = rewire('./Table')
const MockTable: typeof Table & typeof RewireTable = <any> RewireTable

describe('Table', () => {
  describe('Construction', () => {
    it('should set properties from parameters', () => {
      const database = {} as Database
      const table = new Table.default('name', database)
      expect(table.name).toBe('name')
      expect(table.database).toBe(database)
    })
  })
  describe('generateColumns', () => {
    it('should create a column from the columnInfo', async (done) => {
      const mockColumn = jasmine.createSpy('column')
      MockTable.__set__({
        Column_1: {
          default: mockColumn
        }
      })
      const mockColumnInfo = {
        col1: {
          nullable: false,
          type: 'type'
        },
        col2: {
          nullable: true,
          type: 'type2'
        }
      }
      const mockColumnInfoFn = jasmine.createSpy('columnInfo').and.returnValue(mockColumnInfo)
      const mockdb = jasmine.createSpy('db').and.returnValue({ columnInfo: mockColumnInfoFn })
      const database = {
        db: mockdb
      } as any
      const table = new MockTable.default('name', database)
      await table.generateColumns()
      expect(mockColumn.calls.count()).toBe(2)
      expect(mockColumn.calls.argsFor(0)).toEqual(['col1', false, 'type', table])
      expect(mockColumn.calls.argsFor(1)).toEqual(['col2', true, 'type2', table])
      done()
    })
  })
  describe('stringify', () => {
    it('should call the stringify methods on all the columns', () => {
      const c1Fn: any = { stringify: jasmine.createSpy('c1').and.returnValue('c1') }
      const c2Fn: any = { stringify: jasmine.createSpy('c2').and.returnValue('c2') }
      const c3Fn: any = { stringify: jasmine.createSpy('c3').and.returnValue('c3') }

      const table = new Table.default('name', {} as any)
      table.columns = [c1Fn, c2Fn, c3Fn]
      const res = table.stringify()
      expect(res).toBe('export interface nameEntity {\n  c1\n  c2\n  c3\n}')
    })
    it('should replace spaces with underscores', () => {
      const c1Fn: any = { stringify: jasmine.createSpy('c1').and.returnValue('c1') }
      const c2Fn: any = { stringify: jasmine.createSpy('c2').and.returnValue('c2') }
      const c3Fn: any = { stringify: jasmine.createSpy('c3').and.returnValue('c3') }

      const table = new Table.default('table name', {} as any)
      table.columns = [c1Fn, c2Fn, c3Fn]
      const res = table.stringify()
      expect(res).toBe('export interface table_nameEntity {\n  c1\n  c2\n  c3\n}')
    })
  })
})