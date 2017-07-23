/// <reference types="knex" />
import { TableDefinition } from './Adapters/AdapterInterface';
import * as knex from 'knex';
import { Config } from './Typings';
import Table from './Table';
export default class  {
    /**
     * The Tables that this Database contains.
     *
     * @type {Table[]}
     */
    tables: Table[];
    /**
     * Query the database for table definitions.
     * Not implemented for all database schemas.
     *
     * @returns {Promise<string[]>}
     */
    getAllTables(db: knex, config: Config): Promise<TableDefinition[]>;
    /**
     * Creates Tables based on the configuration and generates their definitions.
     *
     */
    generateTables(db: knex, config: Config): Promise<void>;
    /**
     * This Database as a line separated list of TypeScript interface definitions.
     *
     * @returns {string}
     */
    stringify(includeSchema: boolean): string;
    /**
     * This Database as a plain JavaScript object.
     *
     * @returns
     */
    toObject(): {
        tables: {
            name: string;
            schema: string;
            columns: {
                name: string;
                type: string;
                jsType: string;
                nullable: boolean;
            }[];
        }[];
    };
}
