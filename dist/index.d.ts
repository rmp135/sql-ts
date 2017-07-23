import { Config, Database } from './Typings';
/**
 * Generates a Database definition as a series of TypeScript interfaces.
 *
 * @deprecated
 * @param {Config} config       The configuration to generate this database with.
 * @returns {Promise<string>}   The Database definition as a series of TypeScript interfaces.
 */
declare function generate(config: Config): Promise<string>;
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
declare const _default: {
    generate: (config: Config) => Promise<string>;
    toObject: (config: Config) => Promise<Database>;
    toTypeScript: (config: Config) => Promise<string>;
};
export default _default;
export { generate, toObject, toTypeScript, Config, Database };
