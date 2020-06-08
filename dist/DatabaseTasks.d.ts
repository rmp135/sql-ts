import { Config, Database, DecoratedDatabase } from './Typings';
/**
 * Converts a Database definition to TypeScript.
 *
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns A TypeScript definition, optionally wrapped in a namespace.
 */
export declare function stringifyDatabase(database: DecoratedDatabase, config: Config): string;
/**
 * Decorates the database object before sending to template compiler.
 *
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns The decorated database definition.
 */
export declare function decorateDatabase(database: Database, config: Config): DecoratedDatabase;
