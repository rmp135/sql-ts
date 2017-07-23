/// <reference types="knex" />
import * as knex from 'knex';
import { Config } from './Typings';
import Column from './Column';
import Database from './Database';
export default class  {
    /**
     * The name of this Table.
     *
     * @type {string}
     */
    name: string;
    /**
     * The Columns that this Table contains.
     *
     * @type {Column[]}
     */
    schema: string;
    columns: Column[];
    /**
     * The Database that this Table belongs to.
     *
     * @type {Database}
     */
    database: Database;
    /**
     * The name of the interface that will be generated from this table.
     *
     * @type {string}
     */
    interfaceName: string;
    /**
     * A representation of a Database Table.
     *
     * @param name     The name of the Table.
     * @param database The Database that this Table belongs to.
     */
    constructor(name: string, schema: string, config: Config);
    /**
     * Queries the database and generates the Column definitions for this table.
     *
     */
    generateColumns(db: knex, config: Config): Promise<void>;
    /**
     * This Table as an exported TypeScript interface definition.
     * Contains all Columns as types.
     *
     * @returns {string}
     */
    stringify(includeSchema: boolean): string;
    /**
     * This Table as a plain JavaScript object.
     *
     * @returns
     */
    toObject(): {
        name: string;
        schema: string;
        columns: {
            name: string;
            type: string;
            jsType: string;
            nullable: boolean;
        }[];
    };
}
