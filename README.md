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

Each table definition generated from sql-ts can be manually extended with further properties that are not generated from tables.

- additionalProperties:
  - A string array of additional properties to be assigned to the exported TypeScript definition.
- extends
  - Extends the generated TypeScript interface / class with the given string. 

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

Override the types on a per column basis. This requires the full name of the column in the format `table.schema.column`. See [interfaceNameFormat](##interfaceNameFormat) for schema naming conventions. Omit the schema for databases that do not use them.

```json
{
  "dialect": "...",
  "connection": {},
  "typeOverrides": {
    "Table_1.dbo.ColumnName": "string",
    "Table_2.dbo.Name": "number"
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

### template

Specifies the path to a mustache template file. The database object created by the toObject function will be passed to this template for rendering. By preprocessing the database object, you can provide additional properties to your template. If this is not provided a default format will be used.  See [default.mustache](dist/default.mustache) for a default template.

```json
{
  "dialect": "...",
  "connection": {},
  "template": "path/to/template.mustache"
}
```

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

### propertyOptionality

Determines whether properties are optional. Valid values are `optional` (all properties are optional), `required` (all properties are required) and `dynamic` (optionality will be determined by whether the column has a default value or is a primary key). Default `optional`.

```json
{
  "dialect": "...",
  "connection": {},
  "propertyOptionality": "dynamic"
}
```

### createClasses

Allows creation of concrete classes instead of interfaces. Valid values are `true` or `false`. This property is optional and defaults to `false`.

```json
{
  "dialect": "...",
  "connection": {},
  "createClasses": true
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
