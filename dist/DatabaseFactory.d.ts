import { Config, Database } from './Typings';
/**
 * Builds a Database and generates its definitions.
 *
 * @export
 * @param {Config} [config]     The configuration to use.
 * @returns {Promise<Database>} The generated Database.
 */
export declare function buildDatabase(config: Config): Promise<Database>;
