import { it, describe, vi, expect } from 'vitest'
import knex, { Knex } from 'knex'
import * as ConnectionFactory from '../ConnectionFactory'

vi.mock('knex')

describe('createAndRun', () => {
  it('should create a new database context, run the provided function and destroy', async () => {
    const mockConfig = {} as any
    const mockFunction = vi.fn()
    const mockDb = {
      destroy: vi.fn()
    }
    vi.mocked(knex).mockReturnValue(mockDb as any)

    const result = await ConnectionFactory.createAndRun(mockConfig, mockFunction)
    expect(mockFunction).toHaveBeenCalled()
    expect(knex).toHaveBeenCalledWith(mockConfig)
  })
})
