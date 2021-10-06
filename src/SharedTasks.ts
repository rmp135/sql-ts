import { Config } from '.'
import { camelCase, pascalCase } from 'change-case'

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
      return pascalCase(name)
    case 'camel':
      return camelCase(name)
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
 * @param config The knex configuration.
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