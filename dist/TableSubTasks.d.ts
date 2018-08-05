import { Config } from './Typings';
/**
 * Returns the additional properties to add to the interface.
 *
 * @export
 * @param {string} tableName The name of the table.
 * @param {string} schemaName The schema of the table.
 * @param {Config} config The configuration to use.
 */
export declare function getAdditionalProperties(tableName: string, schemaName: string, config: Config): string[];
/**
 * Returns any extension that should be applied to the interface.
 *
 * @export
 * @param {string} tableName
 * @param {string} schemaName
 * @param {Config} config
 * @returns {string}
 */
export declare function getExtends(tableName: string, schemaName: string, config: Config): string;
