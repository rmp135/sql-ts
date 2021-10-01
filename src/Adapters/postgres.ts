import { Knex } from 'knex'
import { AdapterInterface, TableDefinition, ColumnDefinition, EnumDefinition } from './AdapterInterface'
import { Config } from '..'

export default class implements AdapterInterface {
  async getAllEnums(db: Knex, config: Config): Promise<EnumDefinition[]> {
    const query = db('pg_type')
      .select('pg_namespace.nspname AS schema')
      .select('pg_type.typname AS name')
      .select('pg_enum.enumlabel AS value')
      .join('pg_enum', 'pg_enum.enumtypid', 'pg_type.oid')
      .join('pg_namespace', 'pg_namespace.oid', 'pg_type.typnamespace')
    if (config.schemas?.length > 0)
      query.whereIn('pg_namespace.nspname', config.schemas)
    
    const enums: { schema: string, name: string, value: string }[] = await query
    const foundEnums: {[key: string]: EnumDefinition} = { }
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
        foundEnums[mapKey] = {
          name: row.name,
          schema: row.schema,
          values: getValues(row.schema, row.name)
        }
      }
    }
    return Object.values(foundEnums)
  }
  
  async getAllTables(db: Knex, schemas: string[]): Promise<TableDefinition[]> {
    const query = db('pg_tables')
    .select("*").from((qb: Knex) => {
      qb.select('schemaname AS schema')
      .select('tablename AS name')
      .from('pg_tables')
      .union(qb => {
        qb
        .select('schemaname AS schema')
        .select('matviewname AS name')
        .from('pg_matviews')
      })
      .union(qb => {
        qb
        .select('schemaname AS schema')
        .select('viewname AS name')
        .from('pg_views')
      }).as('Unioned')
    })
    .whereNotIn('schema', ['pg_catalog', 'information_schema'])
    if (schemas.length > 0)
      query.whereIn('schema', schemas)
    return await query
  }

  async getAllColumns(db: Knex, config: Config, table: string, schema: string): Promise<ColumnDefinition[]> {
    const sql = `
      SELECT
        typns.nspname typeschema,
        pg_type.typname,
        pg_attribute.attname AS name,
        pg_namespace.nspname AS schema,
        pg_catalog.format_type(pg_attribute.atttypid, null) as type,
        pg_attribute.attnotnull AS notNullable,
        pg_attribute.atthasdef OR pg_attribute.attidentity <> '' AS hasDefault,
        pg_class.relname AS table,
        pg_type.typcategory AS typcategory,
        CASE WHEN EXISTS (
          SELECT null FROM pg_index
          WHERE pg_index.indrelid = pg_attribute.attrelid
          AND  pg_attribute.attnum = any(pg_index.indkey)
        AND pg_index.indisprimary) THEN 1 ELSE 0 END isPrimaryKey
      FROM pg_attribute
      JOIN pg_class ON pg_class.oid = pg_attribute.attrelid
      JOIN pg_type ON pg_type.oid = pg_attribute.atttypid
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      JOIN pg_namespace AS typns ON typns.oid = pg_type.typnamespace
      where pg_attribute.attnum > 0
      AND pg_class.relname = :table
      AND pg_namespace.nspname = :schema
    `
    return (await db.raw(sql, { table, schema }))
      .rows
      .map((c: { name: string, type: string, notnullable: boolean, hasdefault: boolean, typcategory: string, typeschema: string, typname: string, isprimarykey: number } ) => (
        {
          name: c.name,
          type: c.typname,
          nullable: !c.notnullable,
          optional: c.hasdefault || !c.notnullable,
          isEnum: c.typcategory == 'E',
          isPrimaryKey: c.isprimarykey == 1,
          enumSchema: c.typeschema
        }) as ColumnDefinition)
  }
}
