import { Config, Database } from './Typings';
/**
 * Generates a Database definition as a plain JavaScript object.
 *
 * @param {Config} config       The configuration to generate this database with.
 * @returns {Promise<Database>} The Database definition as a plain JavaScript object.
 */
declare function toObject(config: Config): Promise<Database>;
/**
 * Generates a Database definition as a series of TypeScript interfaces.
 *
 * @param {Config} config       The configuration to generate this database with.
 * @returns {Promise<string>}   The Database definition as a series of TypeScript interfaces.
 */
declare function toTypeScript(config: Config): Promise<string>;
/**
 * Generates TypeScript from an exported database definition.
 *
 * @param database The database object as exported from sql-ts
 * @param config The configuration to generate the TypeScript from.
 */
declare function fromObject(database: Database, config: Config): string;
declare var _default: {
    toObject: (config: Config) => Promise<Database>;
    fromObject: (database: Database, config: Config) => string;
    toTypeScript: (config: Config) => Promise<string>;
};
export default _default;
export { toObject, fromObject, toTypeScript, Config, Database };
