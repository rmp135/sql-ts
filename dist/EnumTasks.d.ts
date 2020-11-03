import * as knex from 'knex';
import { Config, Enum } from './Typings';
export declare function getAllEnums(db: knex, config: Config): Promise<Enum[]>;
/**
 * Converts an db enum name to an enum name given a configuration.
 *
 * @export
 * @param {string} name The name of the enum.
 * @param {Config} config The configuration to use.
 * @returns
 */
export declare function generateEnumName(name: string, config: Config): string;
