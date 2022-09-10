import { camelCase, pascalCase, camelCaseTransformMerge, pascalCaseTransformMerge } from 'change-case'

/**
 * Converts the casing of a string.
 *
 * @export
 * @param {string} name The name to convert.
 * @param {string} caseType The case type to convert into.
 * @returns The converted name.
 */
export function convertCase (name: string, caseType: string) {
  switch (caseType) {
    case 'pascal':
      return pascalCase(name, { transform: pascalCaseTransformMerge })
    case 'camel':
      return camelCase(name, { transform: camelCaseTransformMerge })
    case 'lower':
      return name.toLowerCase()
    case 'upper':
      return name.toUpperCase()
    default:
      return name
  }
}

/**
 * Resolves a common adapter name from an alias.
 * 
 * @param dialect The ambiguous adapter name.
 * @returns The resolved dialect name.
 */
export function resolveAdapterName (dialect: string) {
  const aliases = {
    'postgresql' : 'postgres',
    'pg' : 'postgres',
    'sqlite3' : 'sqlite',
    'mysql2': 'mysql'
  }
  return aliases[dialect] ?? dialect
}