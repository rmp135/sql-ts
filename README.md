# sql-ts

[![Build Status](https://travis-ci.org/rmp135/sql-ts.svg?branch=master)](https://travis-ci.org/rmp135/sql-ts)

Generate TypeScript types from a SQL database.

Supports the following databases: MySQL, Microsoft SQL Server, SQLite and Postgres.

## Usage

Use as a global module and provide a configuration file.

`sql-ts -c ./config.json`

The file will be exported with the filename `Database.ts` (or with the name specified in the configuration below) at the current working directory. Warning: if this file exists, it will be overwritten.

---

Use as a node module, passing the configuration as the first argument.

### toObject

Retrieves the database schema as a simple object.

```javascript
import sqlts from '@rmp135/sql-ts'

const config = {
  ...
}

const definitions = await sqlts.toObject(config)
```

For those using TypeScript, you can import the Config definition.

```typescript
import sqlts, { Config, Database } from '@rmp135/sql-ts'

const config: Config = {
  ...
}

const definitions: Database = await sqlts.toObject(config)
// The above type declaration isn't required, but you can import it if you wish.
```

### toTypeScript

Retrieves the raw string of the definition file.

```javascript
import sqlts from '@rmp135/sql-ts'

const config = {
  ...
}

const definitions = await sqlts.toTypeScript(config)
```

For those using TypeScript, you can import the Config definition.

```typescript
import sqlts, { Config } from '@rmp135/sql-ts'

const config: Config = {
  ...
}

const definitions = await sqlts.toTypeScript(config)
```

## Config

The configuration extends the [knex configuration](http://knexjs.org/#Installation-client) with some additional properties for table filtering and type overriding.

For example, to connect to a mysql server, use the following.

```json
{
  "dialect": "mssql",
  "connection": {
    "host": "localhost",
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
  "dialect": "...",
  "connection": {},
  "tables": ["Table1", "Table2"]
}
```

### typeOverrides

Override the types on a per column basis.

```json
{
  "dialect": "...",
  "connection": {},
  "typeOverrides": {
    "Table_1.ColumnName": "string",
    "Table_2.Name": "number"
  }
}
```

### filename

Specifies the name that the file should be saved as. Defaults to "Database.ts". The .ts extensions is not required.

```json
{
  "dialect": "...",
  "connection": {},
  "filename": "DatabaseModels"
}
```

### interfaceNameFormat

Specifies the pattern the the exported interface names will take. The token "${table}" will be replaced with the table name. Defaults to "${table}Entity".

The below will export interfaces with such names as `UserModel` and `LogModel` for tables with names `User` and `Log` respectively.

```json
{
  "dialect": "...",
  "connection": {},
  "interfaceNameFormat": "${table}Model"
}
```

### schemaAsNamespace

Specifies whether the table schema should be used as a namespace. The functionality differs between database providers. Defaults to `false`.

Provider   | Source
-----------|-------------
Postgres   | The schema that the table belongs to.
SQL Server | The schema that the table belongs to.
MySQL      | The database name.
SQLite     | 'main'


```json
{
  "dialect": "...",
  "connection": {},
  "schemaAsNamespace": true
}
```

## schemas

Specifies which schemas to import. This has not effect on SQLite databases. If MySQL is connected to without specifying a database, this can be used to import different databases. Default `[]` (all schemas).

Note for Postgres users: The default schema on Postgres is `public` which is a reserved keyword in TypeScript. You may need to use the `noImplicitUseStrict` flag when transpiling.

This has no effect on SQLite as the concept of schemas do not exist. 

```json
{
  "dialect": "...",
  "connection": {},
  "schemas": ["dbo", "schema1"]
}
```
