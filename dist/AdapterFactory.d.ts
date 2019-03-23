import { AdapterInterface } from './Adapters/AdapterInterface';
import { Config } from '.';
/**
 * Returns an AdapterInterface that matches the dialect.
 *
 * @export
 * @param {any} dialect The name of SQL adapter that should be returned.
 * @returns {AdapterInterface} The adapter for connecting to a SQL database.
 */
export declare function buildAdapter(config: Config): AdapterInterface;
