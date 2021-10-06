import 'jasmine'
import * as ConnectionFactory from '../ConnectionFactory'
import rewire from 'rewire'

const MockConnectionFactory = rewire<typeof ConnectionFactory>('../ConnectionFactory')

describe('ConnectionFactory', () => {
  describe('createAndRun', () => {
    it('should create a new database context, run the provided function and destroy', (done) => {
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }
      const mockKnexImport = {
        default: jasmine.createSpy('knex').and.returnValue(mockKnex)
      }
      const mockFunction = jasmine.createSpy().and.returnValue('test')
      MockConnectionFactory.__with__({
        knex_1: mockKnexImport
      })(async () => {
        const mockConfig = {} as any
        const dat = await MockConnectionFactory.createAndRun(mockConfig, mockFunction)
        expect(dat).toEqual('test')
        expect(mockKnexImport.default).toHaveBeenCalledWith(mockConfig)
        expect(mockKnex.destroy).toHaveBeenCalled()
        expect(mockFunction).toHaveBeenCalled()
        done()
      })
    })
    it('should throw an error when an error occurs', (done) => {
      const mockKnex = {
        destroy: jasmine.createSpy('knex.destroy')
      }
      const mockKnexImport = {
        default: jasmine.createSpy('knex').and.returnValue(mockKnex)
      }
      const mockFunction = jasmine.createSpy().and.throwError('error')
      MockConnectionFactory.__with__({
        knex_1: mockKnexImport
      })(async () => {
        const mockConfig = {} as any
        try {
          await MockConnectionFactory.createAndRun(mockConfig, mockFunction)
        } catch (error) {
          expect(error.message).toEqual('error')
        }
        expect(mockKnexImport.default).toHaveBeenCalledWith(mockConfig)
        expect(mockKnex.destroy).toHaveBeenCalled()
        expect(mockFunction).toHaveBeenCalled()
        done()
      })
    })
  })
})
