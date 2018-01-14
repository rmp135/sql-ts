import { Config } from './Typings'

/**
 * Converts a database table name into a TypeScript enum name.
 * 
 * @export
 * @param {string} name The name of the table.
 * @param {Config} config The configuration to use.
 * @returns The name of the TypeScript enum.
 */
export function generateEnumName (name: string, config: Config): string {
  const enumNameFormat = config.enumNameFormat || '${enum}Enum'
  return enumNameFormat.replace('${enum}', name.replace(/ /g, '_'))
}