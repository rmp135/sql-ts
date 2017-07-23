import { Config } from './Typings';
import Table from './Table';
export default class  {
    /**
     * The name of this Column.
     *
     * @type {string}
     */
    name: string;
    /**
     * Whether this Column is nullable.
     *
     * @type {boolean}
     */
    nullable: boolean;
    /**
     * The type of this Column, as dictated in the database schema.
     *
     * @type {string}
     */
    type: string;
    /**
     * The Table that this Column belongs to.
     *
     * @type {Table}
     */
    jsType: string;
    /**
     * A representation of a database column.
     *
     * @param name     The name of this table.
     * @param nullable Whether this column is nullable.
     * @param type     The type of this column, as retrieved from the database schema.
     * @param table    The Table that this column belongs to.
     */
    constructor(name: string, nullable: boolean, type: string, table: Table, config: Config);
    /**
     * This Column as a TypeScript type definition.
     *
     * @returns {string}
     */
    stringify(): string;
    /**
     * This Column as a plain JavaScript object.
     *
     * @returns
     */
    toObject(): {
        name: string;
        type: string;
        jsType: string;
        nullable: boolean;
    };
}
