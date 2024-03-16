import { describe, it, vi, expect, beforeEach } from 'vitest'
import * as AdapterFactory from '../AdapterFactory'
import * as SharedTasks from '../SharedTasks'

vi.mock('../SharedTasks')

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getColumnForTable', () => {
  it('should find an adapter by name', async () => {
    vi.mocked(SharedTasks.resolveAdapterName).mockReturnValue('mysql')
    const result = AdapterFactory.buildAdapter('adapterName')
    expect(result).toBeDefined()
  })
  it('should throw when an adapter cannot be found', async () => {
    vi.mocked(SharedTasks.resolveAdapterName).mockReturnValue('notfound')
    const result = () => AdapterFactory.buildAdapter('adapterName')
    expect(result).toThrowError(`Unable to find adapter for dialect 'notfound'.`)
  })
})