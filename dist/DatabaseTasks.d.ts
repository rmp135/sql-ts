import { Config, Database } from './Typings';
/**
 * Converts a Database definition to TypeScript.
 *
 * @export
 * @param {Database} database The Database definition.
 * @param {Config} config The configuration to use.
 * @returns A TypeScript definition, optionally wrapped in a namespace.
 */
export declare function stringifyDatabase(database: Database, config: Config): string;
export declare function decorateDatabase(database: Database, config: any): {
    tables: {
        interfaceName: string;
        columns: {
            propertyName: string;
            propertyType: string;
            name: string;
            type: string;
            optional: boolean;
            nullable: boolean;
        }[];
        name: string;
        schema: string;
        extends?: string;
        additionalProperties?: string[];
    }[];
};
