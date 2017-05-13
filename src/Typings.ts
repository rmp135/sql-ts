import * as knex from 'knex' 

export interface Config extends knex.Config { 
  tables?: string[], 
  typeOverrides?: { 
    [key: string]: string 
  } 
} 