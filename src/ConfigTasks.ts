import path = require('path')
import { Config } from './Typings'

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
    folder: '.',
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
    template: path.join(__dirname, './template.handlebars')
  }
  return Object.assign(defaultConfig, config)
}
