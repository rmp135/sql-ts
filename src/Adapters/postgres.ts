import * as knex from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'

export default class implements AdapterInterface {
  async getAllEnums(db: knex, config: Config): Promise<EnumDefinition[]> {
    const query = db('pg_type')
      .select('pg_namespace.nspname AS schema')
      .select('pg_type.typname AS name')
      .select('pg_enum.enumlabel AS value')
      .join('pg_enum', 'pg_enum.enumtypid', 'pg_type.oid')
      .join('pg_namespace', 'pg_namespace.oid', 'pg_type.typnamespace')
    if (config.schemas?.length > 0)
      query.whereIn('pg_namespace.nspname', config.schemas)
    
    const enums: { schema: string, name: string, value: string }[] = await query
    const foundEnums: {[key: string]: EnumDefinition} = {}
    function getValues(schema: string, name: string) {
      const values = {}
      for (const row of enums.filter(e => e.schema == schema && e.name == name)) {
        values[row.value] = row.value
      }
      return values
    }
    for (const row of enums) {
      const mapKey = row.schema + '.' + row.name
      if (foundEnums[mapKey] == undefined) {
        foundEnums[mapKey] = { name: row.name, schema: row.schema, values: getValues(row.schema, row.name) }
      }
    }
    return Object.values(foundEnums)
  }
  async getAllTables(db: knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('pg_tables')
    .select('schemaname AS schema')
    .select('tablename AS name')
    .union(qb => {
      qb
      .select('schemaname AS schema')
      .select('matviewname AS name')
      .from('pg_matviews')
      if (schemas.length > 0)
        qb.whereIn('schemaname', schemas)
    })
    .whereNotIn('schemaname', ['pg_catalog', 'information_schema'])
    if (schemas.length > 0)
      query.whereIn('schemaname', schemas)
    return await query
  }
  async getAllColumns(db: knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    return (await db
    .select('typns.nspname AS enumSchema')
    .select('pg_type.typname AS enumType')
    .select('pg_attribute.attname AS name')
    .select('pg_namespace.nspname AS schema')
    .select(db.raw('pg_catalog.format_type(pg_attribute.atttypid, null) AS type'))
    .select('pg_attribute.attnotnull AS notNullable')
    .select('pg_attribute.atthasdef AS hasDefault')
    .select('pg_class.relname AS table')
    .select('pg_type.typcategory AS typcategory')
    .from('pg_attribute')
    .join('pg_class', 'pg_attribute.attrelid', 'pg_class.oid')
    .join('pg_type', 'pg_type.oid', 'pg_attribute.atttypid')
    .join('pg_namespace', 'pg_class.relnamespace', 'pg_namespace.oid')
    .join('pg_namespace AS typns', 'typns.oid', 'pg_type.typnamespace')
    .where({ 'pg_class.relname': table, 'pg_namespace.nspname': schema })
    .where('pg_attribute.attnum', '>', 0))
    .map((c: { name: string, type: string, notNullable: boolean, hasDefault: boolean, typcategory: string, enumSchema: string, enumType: string } ) => (
      {
        name: c.name,
        type: c.typcategory == "E" && config.schemaAsNamespace ? `${c.enumSchema}.${c.enumType}` : c.enumType,
        isNullable: !c.notNullable,
        isOptional: c.hasDefault,
        isEnum: c.typcategory == "E"
      }) as ColumnDefinition)
  }
}