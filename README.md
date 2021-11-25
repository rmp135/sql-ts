# sql-ts

[![npm (scoped)](https://img.shields.io/npm/v/@rmp135/sql-ts)](https://www.npmjs.com/package/@rmp135/sql-ts)
[![npm](https://img.shields.io/npm/dw/@rmp135/sql-ts)](https://www.npmjs.com/package/@rmp135/sql-ts)
[![Build Status](https://app.travis-ci.com/rmp135/sql-ts.svg?branch=master)](https://app.travis-ci.com/rmp135/sql-ts)

Generate TypeScript types for tables and views in a SQL database.

Highly configurable: choose your own naming and casing schemes, add types, extend base types, and more.

Supports the following databases: MySQL, Microsoft SQL Server, SQLite and Postgres.

```ts
// ./Database.ts

export interface UserEntity {
  "id": number
  "name": string
  "email": string | null
}
```

## Installation

Install into your project using npm / yarn.

`npm install @rmp135/sql-ts`

Install your relevant SQL driver. Refer to the [knex documentation](http://knexjs.org/#Installation-node) to determine which driver you should install.

For example `npm install mysql`.

Create a configuration file, for example `mysql.json`. This will mirror connection details from knex. The `client` property will determine the SQL type.

The most basic MySQL setup is below, modify as appropriate. Additional options can be applied by referring to the [Config](#config).

```json
{
  "client":"mysql",
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

Both `toObject` and `toTypeScript` accept a knex connection object as the second argument. If this is passed it will be used to generate the file, and you will not require any knex related options in your config object. If this is not passed, a temporary connection will be made using the config.

### toObject

Retrieves the database schema as a simple object.

```javascript
import sqlts from '@rmp135/sql-ts'

const config = {
  ...
}

const definitions = await sqlts.toObject(config)

// If you have a knex connections already, you can pass that along with the schema.
const db = knex({ ... })
const definition = await sqlts.toObject(config, db)
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

Retrieves the raw TypeScript string from a config file. Essentially combining the two functions above. 

```javascript
import sqlts from '@rmp135/sql-ts'

const config = {
  ...
}

const tsString = await sqlts.toTypeScript(config)

// If you have a knex connection already, you can pass that along with the schema.
const db = knex({ ... })
const tsString = await sqlts.toObject(config, db)

```

## Config

The configuration extends the [knex configuration](http://knexjs.org/#Installation-client) with some additional properties. If you're using your own knex object, the knex related information is not required.

### tables

Filter the tables to include only those specified. These must be in the format `schema.table`. See [interfaceNameFormat](#interfacenameformat) for schema naming conventions.

```json
{
  "client": "...",
  "connection": {},
  "tables": ["schema1.Table1", "schema2.Table2"]
}
```

### excludedTables

Filter the tables to exclude those specified. These must be in the format `schema.table`. See [interfaceNameFormat](#interfacenameformat) for schema naming conventions.

Excluding a table takes precedence over including it. Specifying a table in both configuration options will exclude it.

```json
{
  "client": "...",
  "connection": {},
  "excludedTables": ["schema1.knex_migrations", "schema1.knex_migrations_lock", "schema2.android_metadata"]
}
```

### typeOverrides

Override the types on a per column basis. This requires the full name of the column in the format `schema.table.column`. See [interfaceNameFormat](#interfacenameformat) for schema naming conventions. Omit the schema for databases that do not use them.

```json
{
  "client": "...",
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
  "client": "...",
  "connection": {},
  "typeMap": {
    "number": ["decimal", "float"],
    "string": ["nvarchar", "varchar"]
  }
}
```

### filename

Specifies the name that the file should be saved as. Defaults to "Database". The .ts extension is not required.

```json
{
  "client": "...",
  "connection": {},
  "filename": "DatabaseModels"
}
```

### folder

Specifies a folder where the file will be generated. This will be relative to the current working directory if no absolute path is given. Folders will not be created and will error if they do not exist.

For unix systems, the home shortcut `~`  will not work, use the fully qualified path name.

```json
{
  "client": "...",
  "connection": {},
  "folder": "outputdir/subdir"
}
```

### interfaceNameFormat

Specifies the pattern that the exported interface names will take. The token "${table}" will be replaced with the table name. Defaults to `${table}Entity`.

The below will export interfaces with such names as `UserModel` and `LogModel` for tables with names `User` and `Log` respectively.

```json
{
  "client": "...",
  "connection": {},
  "interfaceNameFormat": "${table}Model"
}
```

The following options concerns modifying the case values of certain elements.

Valid case values are "pascal" for PascalCase, "camel" for camelCase, "lower" for lowercase and "upper" for UPPERCASE. If the value is empty, missing or invalid, no case conversion will be applied to value. Some values will be modified to be TypeScript safe, others are wrapped in quotes.

### tableNameCasing

Determines the casing for table names 

```json
{
  "client": "...",
  "connection": {},
  "tableNameCasing": "pascal"
}
```

### columnNameCasing

Determines the casing for column names.

```json
{
  "client": "...",
  "connection": {},
  "columnNameCasing": "camel"
}
```
### enumNameCasing

Determines the casing for enum names. Any none alphanumeric charaters will be removed. If the enum starts with numbers, those numbers will be removed.

```json
{
  "client": "...",
  "connection": {},
  "enumNameCasing": "lower"
}
```

### enumKeyCasing

Determines the casing for enum keys. Keys are wrapped in quotes to allow for any value, use ["index notation"] to reference keys with none alphanumeric values.

```json
{
  "client": "...",
  "connection": {},
  "enumKeyCasing": "upper"
}
```

### singularTableNames

Removes the "s" from the end of table names before being passed into the name generator. Defaults `false`.

```json
{
  "client": "...",
  "connection": {},
  "singularTableNames": true
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
  "client": "...",
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
  "client": "...",
  "connection": {},
  "schemas": ["dbo", "schema1"]
}
```

### additionalProperties

Specifies additional properties to be assigned to the output TypeScript file. Key is in the format `schema.table` and the value is a list of raw strings. 

```json
{
  "client": "...",
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
  "client": "...",
  "connection": {},
  "extends": {
    "dbo.Table_1": "Extension, AnotherExtension"
  }
}
```

### template

Specifies the [handlebars](https://handlebarsjs.com) template to use when creating the output TypeScript file relative to the current working directory. See [dist/template.handlebars](./dist/template.handlebars) for the default template. 

See the below section on templating for more info on how to use the template.

```json
{
  "client": "...",
  "connection": {},
  "template": "./template.handlebars"
}
```

## Templating

The `template.handlebars` file controls the output of the generated .ts file. You can modify this file and use the `template` config option to specify a custom template file.

The inputs to this file are as followed.

```js
{
  {
    "dbo": { // Key is schema name.
      "tables": [ // List of all non-filtered tables.
        {
          "name": "User", // The original database table name.
          "schema": "dbo", // The schema the table belongs to.
          "additionalProperties": { // Any additional properties that should be added.
            "PropertyName": "number" // Property name and type.
          },
          "extends": "DBEntity", // The superclass, if any, that should be extended.
          "interfaceName": "UserEntity", // The computed interface name.
          "comment": "a table comment", // A table comment (see Comments below).
          "columns": [ // List of columns in this table.
            {
              "name": "ID", // The original database column name.
              "type": "int", // The original database type.
              "propertyName": "ID", // The computed Typescript property name 
              "propertyType": "number", // The computed Typescript type 
              "nullable": false, // Whether the column is nullable.
              "optional": true, // Whether the column is optional for insertion (has a default value).
              "isEnum": false, // Whether the column is an enum type (currently only Postgres).
              "isPrimaryKey": true // Whether the column is a primary key.
              "comment": "a comment" // A column comment (see Comments below).
            }
          ]
        }
      ],
      "enums": [ // List of enums (Postgres only).
        { 
          "name": "Severity", // The original database enum name.
          "convertedName": "SeverityEnum", // The converted name of the enum.
          "schema": "dbo", // The schema the enum belongs to.
          "values": [
            {
              "originalKey": "very high", // The original database key that represents the enum.
              "convertedKey": "veryhigh", // Converted value name (strips spaces).
              "value": "Very High" // Value this enum represents.
            }
          ]
        }
      ]
    }
  },
  custom : {} , // Attach custom data if needed.
}
```

### Comments

Comments provided on tables, views and columns can be imported into the template. 

Different database providers provide these comments in different ways.

Provider   | Source
-----------|---------------------------------------------
MySQL      | "Comments" field
SQL Server | Extended property with name "MS_Description"
Postgres   | "Comment" field
SQLite     | Not supported

## Bespoke Configuration

### `mssql` client with `msnodesqlv8` driver (Windows only)

For instructions to setup the SQL Server Native client installed see [mode-mssql/issue/338](https://github.com/patriksimek/node-mssql/issues/338#issuecomment-278400345)

You will need to get the `connectionString` correct as this configuration has only been tested using the `connectionString`.

Sample configuration (replace the `HostName` and `DatabaseName` accordingly).

```json
{
    "client": "mssql",
    "connection": {
        "driver": "msnodesqlv8",
        "connectionString": "Driver={SQL Server Native Client 10.0};Server=HostName;Database=DatabaseName;Trusted_Connection=yes;"
    }
}
```
