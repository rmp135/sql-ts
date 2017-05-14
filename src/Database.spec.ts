import Database from './Database'
import * as Database2 from './Database'
import * as rewire from 'rewire'

let RewireDatabase = rewire('./Database')
const MockDatabase: typeof Database2 & typeof RewireDatabase = <any> RewireDatabase


describe('Database', () => {
  describe('Construction', () => {
    it('should populate properties from parameters', () => {
      const mockKnex: any = {}
      const mockConfig = {}
      const dat = new Database(mockKnex, mockConfig)
      expect(dat.db).toBe(mockKnex)
      expect(dat.config).toBe(mockConfig)
    })
  })
  describe('getAllTables', () => {
    it('should get tables for mysql', async (done) => {
      const mockWhere = jasmine.createSpy('where').and.returnValue([{ table_name: 'table' }, { table_name: 'table2' }])
      const mockSelect = jasmine.createSpy('select').and.returnValue({ where: mockWhere })
      const mockDb: any = jasmine.createSpy('db').and.returnValue({ select: mockSelect })
      mockDb.client = {
        config: {
          dialect: 'mysql',
          connection: {
            database: 'database'
          }
        }
      }
      const dat = new  Database(mockDb, {} as any)
      const tables = await dat.getAllTables()
      expect(mockDb).toHaveBeenCalledWith('information_schema.tables')
      expect(mockSelect).toHaveBeenCalledWith('table_name')
      expect(mockWhere).toHaveBeenCalledWith({ table_schema: 'database' })
      expect(tables).toEqual(['table', 'table2'])
      done()
    })
    it('should get tables for sqlite3', async (done) => {
      const mockWhere = jasmine.createSpy('where').and.returnValue([{ tbl_name: 'table' }, { tbl_name: 'table2' }])
      const mockWhereNot = jasmine.createSpy('whereNot').and.returnValue({ where: mockWhere })
      const mockSelect = jasmine.createSpy('select').and.returnValue({ whereNot: mockWhereNot })
      const mockDb: any = jasmine.createSpy('db').and.returnValue({ select: mockSelect })
      mockDb.client = {
        config: {
          dialect: 'sqlite3',
        }
      }
      const dat = new  Database(mockDb, {} as any)
      const tables = await dat.getAllTables()
      expect(mockDb).toHaveBeenCalledWith('sqlite_master')
      expect(mockSelect).toHaveBeenCalledWith('tbl_name')
      expect(mockWhereNot).toHaveBeenCalledWith({ tbl_name: 'sqlite_sequence' })
      expect(mockWhere).toHaveBeenCalledWith({ type: 'table' })
      expect(tables).toEqual(['table', 'table2'])
      done()
    })
    it('should get tables for postgres', async (done) => {
      const mockWhere = jasmine.createSpy('where').and.returnValue([{ tablename: 'table' }, { tablename: 'table2' }])
      const mockSelect = jasmine.createSpy('select').and.returnValue({ where: mockWhere })
      const mockDb: any = jasmine.createSpy('db').and.returnValue({ select: mockSelect })
      mockDb.client = {
        config: {
          dialect: 'postgres',
        }
      }
      const dat = new  Database(mockDb, {} as any)
      const tables = await dat.getAllTables()
      expect(mockDb).toHaveBeenCalledWith('pg_catalog.pg_tables')
      expect(mockSelect).toHaveBeenCalledWith('tablename')
      expect(mockWhere).toHaveBeenCalledWith({ schemaname: 'public' })
      expect(tables).toEqual(['table', 'table2'])
      done()
    })
    it('should get tables for mssql', async (done) => {
      const mockSelect = jasmine.createSpy('select').and.returnValue([{ table_name: 'table' }, { table_name: 'table2' }])
      const mockDb: any = jasmine.createSpy('db').and.returnValue({ select: mockSelect })
      mockDb.client = {
        config: {
          dialect: 'mssql',
        }
      }
      const dat = new  Database(mockDb, {} as any)
      const tables = await dat.getAllTables()
      expect(mockDb).toHaveBeenCalledWith('information_schema.tables')
      expect(mockSelect).toHaveBeenCalledWith('table_name')
      expect(tables).toEqual(['table', 'table2'])
      done()
    })
    it('should throw an error when dialect is not supported', async (done) => {
      const mockSelect = jasmine.createSpy('select').and.returnValue([{ table_name: 'table' }, { table_name: 'table2' }])
      const mockDb: any = jasmine.createSpy('db').and.returnValue({ select: mockSelect })
      mockDb.client = {
        config: {
          dialect: 'notsupported',
        }
      }
      const dat = new Database(mockDb, {} as any)
      try {
        await dat.getAllTables()
      } catch (error) {
        expect((error as Error).message).toBe('Fetching all tables is not currently supported for dialect notsupported.')
        done()
      }
    })
  })
  describe('generateTables', () => {
    it('should use the tables in the config', async (done) => {
      const mockConfig = {
        tables: ['table1', 'table2']
      }
      const mockTableRet: any = { generateColumns: () => { [1, 2, 3] } }
      const mockTable = jasmine.createSpy('table').and.returnValue(mockTableRet)
      MockDatabase.__set__({
        Table_1: {
          default: mockTable
        }
      })
      const mockDb = {
        schema: {
          hasTable: jasmine.createSpy('hasTable').and.returnValue(Promise.resolve(true))
        }
      }
      const dat = new MockDatabase.default(mockDb as any, mockConfig)
      await dat.generateTables()
      expect(mockDb.schema.hasTable.calls.argsFor(0)).toEqual(['table1'])
      expect(mockDb.schema.hasTable.calls.argsFor(1)).toEqual(['table2'])
      expect(mockTable).toHaveBeenCalledTimes(2)
      expect(dat.tables).toEqual([mockTableRet, mockTableRet])
      done()
    })
    it('should get all tables if no tables were specified', async (done) => {
      const mockConfig = { }
      const mockGetAllTables = jasmine.createSpy('getAllTables').and.returnValue(['table1', 'table2'])
      const mockTableRet: any = { generateColumns: () => { [1, 2, 3] } }
      const mockTable = jasmine.createSpy('table').and.returnValue(mockTableRet)
      MockDatabase.__set__({
        Table_1: {
          default: mockTable
        }
      })
      const mockDb = {
        schema: {
          hasTable: jasmine.createSpy('hasTable').and.returnValue(Promise.resolve(true))
        }
      }
      const dat = new MockDatabase.default(mockDb as any, mockConfig)
      dat.getAllTables = mockGetAllTables
      await dat.generateTables()
      expect(mockGetAllTables).toHaveBeenCalled()
      expect(mockTable.calls.count()).toBe(2)
      expect(dat.tables).toEqual([mockTableRet, mockTableRet])
      done()
    })
    it('should not generate table definitions if the table is requested but does not exist', async (done) => {
      const mockConfig = {
        tables: ['table1', 'table2']
      }
      const mockTableRet: any = { generateColumns: () => { [1, 2, 3] } }
      const mockTable = jasmine.createSpy('table').and.returnValue(mockTableRet)
      MockDatabase.__set__({
        Table_1: {
          default: mockTable
        }
      })
      const mockDb = {
        schema: {
          hasTable: jasmine.createSpy('hasTable').and.returnValues(Promise.resolve(false), Promise.resolve(true))
        }
      }
      const dat = new MockDatabase.default(mockDb as any, mockConfig)
      await dat.generateTables()
      expect(mockDb.schema.hasTable.calls.argsFor(0)).toEqual(['table1'])
      expect(mockDb.schema.hasTable.calls.argsFor(1)).toEqual(['table2'])
      expect(mockTable).toHaveBeenCalledTimes(1)
      expect(mockTable).toHaveBeenCalledWith('table2', dat)
      expect(dat.tables).toEqual([mockTableRet])
      done()
    })
  })
  describe('stringify', () => {
    it('should stringify the tables', () => {
      const dat = new Database({} as any, {} as any)
      const mockStringify = jasmine.createSpy('stringify').and.returnValues('1', '2', '3')
      dat.tables = [{
          stringify: mockStringify
        }, {
          stringify: mockStringify
        }, {
          stringify: mockStringify
        },
      ] as any
      const res = dat.stringify()
      expect(mockStringify.calls.count()).toBe(3)
      expect(res).toBe('1\n\n2\n\n3')
    })
  })
})