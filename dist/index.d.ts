import { Config, Column, Table, Database, DecoratedDatabase } from './Typings';
/**
 * Generates a Database definition as a plain JavaScript object.
 *
 * @param {Config} config       The configuration to generate this database with.
 * @returns {Promise<DecoratedDatabase>} The Database definition as a plain JavaScript object.
 */
declare function toObject(config: Config): Promise<DecoratedDatabase>;
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
declare function fromObject(database: DecoratedDatabase, config: Config): string;
declare const _default: {
    toObject: typeof toObject;
    fromObject: typeof fromObject;
    toTypeScript: typeof toTypeScript;
};
export default _default;
export { toObject, fromObject, toTypeScript, Config, Column, Table, Database };
