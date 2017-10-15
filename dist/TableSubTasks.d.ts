import { Config } from './Typings';
/**
 * Converts a table name to an interface name given a configuration.
 *
 * @export
 * @param {string} name The name of the table.
 * @param {Config} config The configuration to use.
 * @returns
 */
export declare function generateInterfaceName(name: string, config: Config): string;
