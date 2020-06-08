import * as knex from 'knex';
import { Config, Enum } from './Typings';
export declare function getAllEnums(db: knex, config: Config): Promise<Enum[]>;
