import * as path from 'path'
import { Config } from './Typings.js'
import { fileURLToPath } from 'url'

/**
 * Applies configuration defaults to a given configuration object.
 * 
 * @param config The raw configuration.
 * @returns The input configuration with missing fields defaulted.
 */
export function applyConfigDefaults(config: Config): Config {
  const defaultConfig: Config = {
    filename: 'Database',
    globalOptionality: 'dynamic',
    columnOptionality: {},
    tableEnums: {},
    columnSortOrder: 'alphabetical',
    tables: [],
    excludedTables: [],
    schemas: [],
    interfaceNameFormat: '${table}Entity',
    enumNameFormat: '${name}',
    enumNumericKeyFormat: '_${key}',
    additionalProperties: {},
    schemaAsNamespace: false,
    typeOverrides: {},
    typeMap: {},
    template: path.join(path.dirname(fileURLToPath(import.meta.url)), './template.handlebars'),
    custom: {}
  }
  return Object.assign(defaultConfig, config)
}