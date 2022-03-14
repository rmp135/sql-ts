import { Knex } from 'knex'
import { Config } from '..'
import { EnumDefinition } from './AdapterInterface'

/**
 * Retrieves all table defined enums from the database.
 *
 * @export
 * @param {Knex} db The database context to use.
 * @param {Config} config The configuration to use.
 * @returns {Promise<EnumDefinition[]>}
 */
export async function getTableEnums (db: Knex, config: Config): Promise<EnumDefinition[]> {
  const tableEnums = config.tableEnums
  const allEnums = Object.entries(tableEnums).map(async ([key, enums]) => {
    const split = key.split('.')
    const schema = split[0]
    const table = split[1]
    const rows = (
      await db(table)
        .select(`${enums.key} as Key`, `${enums.value} as Value`)
      )
      .reduce((acc, curr) => {
        acc[curr.Key] = curr.Value
        return acc
      }, {}) as { [key: string]: string | number }
    return {
      name: table,
      schema,
      values: rows
    }
  })
  return await Promise.all(allEnums)
}

