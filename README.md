# sql-ts

[![Build Status](https://travis-ci.org/rmp135/sql-ts.svg?branch=master)](https://travis-ci.org/rmp135/sql-ts)

Generate TypeScript types from a SQL database.

Supports the following databases: MySQL, Microsoft SQL Server, SQLite and Postgres.

## Installation

Install into your project using npm / yarn.

`npm install @rmp135/sql-ts`

Install your relevant SQL driver. Refer to the [knex documentation](http://knexjs.org/#Installation-node) to determine which driver you should install.

For example `npm install mysql`.

Create a configuration file, for example `mysql.json`. This will mirror connection details from knex. The `dialect` or `client` property will determine the SQL type.

The most basic MySQL setup is below, modify as appropriate. Additional options can be applied by referring to the [Config](#config).

```json
{
  "dialect":"mysql",
  "connection": {
    "host": "localhost",
    "user": "user",
    "password": "password",
    "database" : "my_database"
  }
}
```

## Usage

Run `npx @rmp135/sql-ts` with the path of the configuration file created above.

`npx @rmp135/sql-ts -c ./config.json`

The file will be exported with the filename `Database.ts` (or with the name specified in the configuration) at the current working directory. Warning: if this file exists, it will be overwritten.

---

Alternatively, use as a node module, passing the configuration object as the first argument.

### toObject

Retrieves the database schema as a simple object.

```javascript
import sqlts from '@rmp135/sql-ts'

const config = {
  ...
}

const definitions = await sqlts.toObject(config)
```

### fromObject

Converts the object returned from `toObject` into a TypeScript definition. This can be used to manipulate the database definitions before they are converted into strings or files, which allows for greater control over the generated typescript.

```javascript
import sqlts from '@rmp135/sql-ts'

const config = {
  ...
}

const definitions = await sqlts.toObject(config)

const tsString = sqlts.fromObject(definitions, config)
```

For those using TypeScript, you can import the Config definition.

### toTypeScript

Retrieves the raw string of the definition file.

```javascript
import sqlts from '@rmp135/sql-ts'

const config = {
  ...
}

const definitions = await sqlts.toTypeScript(config)
```

## Config

The configuration extends the [knex configuration](http://knexjs.org/#Installation-client) with some additional properties for table filtering and type overriding.
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

Override the types on a per column basis. This requires the full name of the column in the format `schema.table.column`. See [interfaceNameFormat](#interfacenameformat) for schema naming conventions. Omit the schema for databases that do not use them.

```json
{
  "dialect": "...",
  "connection": {},
  "typeOverrides": {
    "dbo.Table_1.ColumnName": "string",
    "dbo.Table_1.Name": "number"
  }
}
```

### typeMap

Adds additional types to the type resolution. The order in which types are resolved is `typeOverrides` (see above), this `typeMap`, then the global TypeMap file before defaulting to `any`.

```json
{
  "dialect": "...",
  "connection": {},
  "typeMap": {
    "number": ["decimal", "float"],
    "string": ["nvarchar", "varchar"]
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

### fileReplaceWithinMarker

If set, instead of creating a new file, the command line tool will insert the definitions within the given markers in the existing `filename`. The marker can be any string but needs to be unique and there must be an opening and a closing one.

For example if Database.ts contains the following content:

```
// Some random code here

// INSERT_TYPES_HERE

// INSERT_TYPES_HERE

// Some other code after
```

And `fileReplaceWithinMarker` is set to `// INSERT_TYPES_HERE`, the type definitions will be inserted inside the file within these two "// INSERT_TYPES_HERE" comments.

IF the file does not exists, or if the markers cannot be found in the file, the insertion will fail.

### interfaceNameFormat

Specifies the pattern that the exported interface names will take. The token "${table}" will be replaced with the table name. Defaults to "${table}Entity".

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

### schemas

Specifies which schemas to import. This has no effect on SQLite databases. If MySQL is connected to without specifying a database, this can be used to import from multiple databases. Default `[]` (all schemas).

Note for Postgres users: The default schema on Postgres is `public` which is a reserved keyword in TypeScript. You may need to use the `noImplicitUseStrict` flag when transpiling.

This has no effect on SQLite as the concept of schemas do not exist. 

```json
{
  "dialect": "...",
  "connection": {},
  "schemas": ["dbo", "schema1"]
}
```

### additionalProperties

Specifies additional properties to be assigned to the output TypeScript file. Key is in the format `schema.table` and the value is a list of raw strings. 

```json
{
  "dialect": "...",
  "connection": {},
  "additionalProperties": {
    "dbo.Table_1": ["propertyOne: string", "propertyTwo?: number | null"]
  }
}
```

### extends

Specifies the superclass than should be applied to the generated interface. Key is in the format `schema.table` and the value is the extension to apply. The following would generate `export interface Table_1 extends Extension, AnotherExtension { }`

```json
{
  "dialect": "...",
  "connection": {},
  "extends": {
    "dbo.Table_1": "Extension, AnotherExtension"
  }
}
```

### template

Specifies the [handlebars](https://handlebarsjs.com) template to use when creating the output TypeScript file relative to the current working directory. See [dist/template.handlebars](./dist/template.handlebars) for the default template. 

```json
{
  "dialect": "...",
  "connection": {},
  "template": "./template.handlebars"
}
```

## Bespoke Configuration

### `mssql` dialect with `msnodesqlv8` driver (Windows only)

For instructions to setup the SQL Server Native client installed see [mode-mssql/issue/338](https://github.com/patriksimek/node-mssql/issues/338#issuecomment-278400345)

You will need to get the `connectionString` correct as this configuration has only been tested using the `connectionString`.

Sample configuration (replace the `HostName` and `DatabaseName` accordingly).

```json
{
    "dialect": "mssql",
    "connection": {
        "driver": "msnodesqlv8",
        "connectionString": "Driver={SQL Server Native Client 10.0};Server=HostName;Database=DatabaseName;Trusted_Connection=yes;"
    }
}
```
