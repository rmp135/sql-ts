/**
 * Generates the schema name, removing invalid values.
 *
 * @export
 * @param {string} name Schema name.
 * @returns
 */
export function generateSchemaName (name: string): string {
  if (name == null) return name
  return name
    .replace(/\W/g, '')
    .replace(/^\d+/g, '')
}
