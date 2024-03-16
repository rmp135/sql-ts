import { Knex } from 'knex'
import { Config } from '../index.js'
import { EnumDefinition } from './AdapterInterface.js'

/**
 * Retrieves all table defined enums from the database using a simple select.
 *
 * @export
 * @param {Knex} db The database context to use.
 * @param {Config} config The configuration to use.
 * @returns {Promise<EnumDefinition[]>}
 */
export async function getTableEnums(db: Knex, config: Config): Promise<EnumDefinition[]> {
  const tableEnums = config.tableEnums
  const allEnums = await Promise.all(
    Object.entries(tableEnums).map(async ([key, enums]) => {
      const [schemaName, tableName] = key.split('.')
      const rawRows = (await db(tableName).select(`${enums.key} as Key`, `${enums.value} as Value`)) as Array<{ Key: string; Value: string }>
      const rows = rawRows.reduce((acc, row) => {
        acc[row.Key] = row.Value
        return acc
      }, {}) as Record<string, string>
      return {
        name: tableName,
        schema: schemaName,
        values: rows
      }
    })
  )
  return await Promise.all(allEnums)
}
