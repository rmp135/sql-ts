# sql-ts

[![Build Status](https://travis-ci.org/rmp135/sql-ts.svg?branch=master)](https://travis-ci.org/rmp135/sql-ts)

Generate TypeScript types from a SQL database.

Supports the following databases: MySQL, Microsoft SQL Server, SQLite and Postgres.

## Usage

Use as a global module and provide a configuration file.

`sql-ts -c ./config.json`

The file will be exported with the filename `Database.ts` at the current working directory. Warning: if this file exists, it will be overwritten.

---

Use as a node module, passing the configuration as the first argument.

The raw string of the definition file will be returned.

```javascript
import sqlts from 'sql-ts'

const config = {
  ...
}

const definitions = await sqlts.generate(config)
```

For those using TypeScript, you can import the Config definition.

```typescript
import sqlts, { Config } from 'sql-ts'

const config: Config = {
  ...
}

const definitions = await sqlts.generate(config)
```

## Config

The configuration extends the [knex configuration](http://knexjs.org/#Installation-client) with some additional properties for table filtering and type overriding.

For example, to connect to a mssql server, use the following.

```json
{
  "dialect": "mssql",
  "connection": {
    "server": "localhost",
    "database": "database",
    "user": "user",
    "password": "password"
  }
}
```

By default, no drivers are installed and the relevant driver must be installed as a dependency. Refer to the [knex documentation](http://knexjs.org/#Installation-node) on which drivers are used for which SQL variant. 

### tables

Filter the tables to include only those specified.

```json
{
  "tables": ["Table1", "Table2"]
}
```

### typeOverrides

Override the types on a per column basis.

```json
{
  "typeOverrides": {
    "Table_1.ColumnName": "string",
    "Table_2.Name": "number"
  }
}
```