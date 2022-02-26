<div align="center">

<h1>sql-ts</h1>

[![npm (scoped)](https://img.shields.io/npm/v/@rmp135/sql-ts)](https://www.npmjs.com/package/@rmp135/sql-ts)
[![npm](https://img.shields.io/npm/dw/@rmp135/sql-ts)](https://www.npmjs.com/package/@rmp135/sql-ts)
[![Build Status](https://app.travis-ci.com/rmp135/sql-ts.svg?branch=master)](https://app.travis-ci.com/rmp135/sql-ts)

</div>


Generate TypeScript types for tables and views in a SQL database. 

Includes comments from tables, views and columns for [supported providers](https://rmp135.github.io/sql-ts/#/?id=comments).

Highly configurable: choose your own [naming](#interfacenameformat) and [casing schemes](#tablenamecasing), [add types](#typemap), [extend base types](#extends), and more.

Supports the following databases: MySQL, Microsoft SQL Server, SQLite and Postgres courtesy of [knex](https://knexjs.org/). 


<!-- panels:start -->

<div class="even-panels">
<!-- div:left-panel -->

```sql
CREATE TABLE [dbo].[Customers](
	[CustomerID] [nchar](5) NOT NULL,
	[CompanyName] [nvarchar](40) NOT NULL,
	[ContactName] [nvarchar](30) NULL
)
CREATE TABLE [dbo].[Employees](
	[EmployeeID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](20) NOT NULL,
	[BirthDate] [datetime] NULL,
	[Photo] [image] NULL
)

```

<!-- div:right-panel -->

```ts
export interface CustomersEntity {
  'CustomerID': string;
  'CompanyName': string;
  'ContactTitle'?: string | null;
}
export interface EmployeesEntity {
  'EmployeeID'?: number;
  'Name': string;
  'BirthDate'?: Date | null;
  'Photo'?: Buffer | null;
}
```

</div>
<!-- panels:end -->

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

`npx @rmp135/sql-ts -c ./mysql.json`

The file will be exported with the filename `Database.ts` (or with the name specified in the configuration) at the current working directory. 

!> Warning: if this file exists, it will be overwritten.

---
Alternatively, use as a node module, passing the configuration object as the first argument.

Both `toObject` and `toTypeScript` accept a knex connection object as the second argument. If this is passed it will be used to generate the file, and you will not require any knex related options in your config object. If this is not passed, a temporary connection will be made using the config.

For those using TypeScript, you can import the Config definition.

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

<!-- panels:start -->
<!-- div:title-panel -->
### tables

<!-- div:left-panel -->
Filter the tables to include only those specified. These must be in the format `schema.table`. See [Object Name Format](#object-name-format) for schema naming conventions.

<!-- div:right-panel -->

```json
{
  "client": "...",
  "connection": {},
  "tables": ["schema1.Table1", "schema2.Table2"]
}
```

<!-- div:title-panel -->

### excludedTables

<!-- div:left-panel -->

Filter the tables to exclude those specified. These must be in the format `schema.table`. See [Object Name Format](#object-name-format) for schema naming conventions.

Excluding a table takes precedence over including it. Specifying a table in both configuration options will exclude it.

<!-- div:right-panel -->

```json
{
  "client": "...",
  "connection": {},
  "excludedTables": [
    "schema1.knex_migrations", 
    "schema1.knex_migrations_lock", 
    "schema2.android_metadata"
  ]
}
```
<!-- div:title-panel -->
### typeOverrides
<!-- div:left-panel -->

Override the types on a per column basis. This requires the full name of the column in the format `schema.table.column`. See [Object Name Format](#object-name-format) for schema naming conventions. 
<!-- div:right-panel -->

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

<!-- div:title-panel -->
### typeMap

<!-- div:left-panel -->
Adds additional types to the type resolution. The order in which types are resolved is `typeOverrides` (see above), this `typeMap`, then the global TypeMap file before defaulting to `any`.

<!-- div:right-panel -->
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

<!-- div:title-panel -->
### filename

<!-- div:left-panel -->
Specifies the filepath and name that the file should be saved as. Defaults to "Database". The .ts extension is not required.

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "filename": "DatabaseModels"
}
```

<!-- div:title-panel -->
### folder

<!-- div:left-panel -->

Specifies a folder where the file will be generated. This will be relative to the current working directory if no absolute path is given. Folders will not be created and will error if they do not exist.

For unix systems, the home shortcut `~`  will not work, use the fully qualified path name.

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "folder": "outputdir/subdir"
}
```

<!-- div:title-panel -->
### interfaceNameFormat

<!-- div:left-panel -->
Specifies the pattern that the exported interface names will take. The token "${table}" will be replaced with the table name. Defaults to `${table}Entity`.

`${table}Model` will export interfaces with such names as `UserModel` and `LogModel` for tables with names `User` and `Log` respectively.

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "interfaceNameFormat": "${table}Model"
}
```

<!-- div:left-panel -->

<!-- panels:end -->
The following options concerns modifying the case values of certain elements.

Valid case values are "pascal" for PascalCase, "camel" for camelCase, "lower" for lowercase and "upper" for UPPERCASE. If the value is empty, missing or invalid, no case conversion will be applied to value. Some values will be modified to be TypeScript safe, others are wrapped in quotes.

<!-- panels:start -->
<!-- div:title-panel -->
### tableNameCasing

<!-- div:left-panel -->
Determines the casing for table names 

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "tableNameCasing": "pascal"
}
```

<!-- div:title-panel -->
### columnNameCasing

<!-- div:left-panel -->
Determines the casing for column names.

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "columnNameCasing": "camel"
}
```
<!-- div:title-panel -->
### enumNameCasing

<!-- div:left-panel -->
Determines the casing for enum names. Any none alphanumeric charaters will be removed. If the enum starts with numbers, those numbers will be removed.

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "enumNameCasing": "lower"
}
```

<!-- div:title-panel -->
### enumKeyCasing

<!-- div:left-panel -->
Determines the casing for enum keys. Keys are wrapped in quotes to allow for any value, use ["index notation"] to reference keys with none alphanumeric values.

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "enumKeyCasing": "upper"
}
```

<!-- div:title-panel -->
### singularTableNames

<!-- div:left-panel -->
Removes the "s" from the end of table names before being passed into the name generator. Defaults `false`.

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "singularTableNames": true
}
```

<!-- div:title-panel -->
### schemaAsNamespace

<!-- div:left-panel -->
Specifies whether the table schema should be used as a namespace. The functionality differs between database providers. Defaults to `false`.

See [Object Name Format](#object-name-format) for information on how schemas are read from different providers.

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "schemaAsNamespace": true
}
```

<!-- div:title-panel -->
### schemas

<!-- div:left-panel -->
Specifies which schemas to import. This has no effect on SQLite databases. If MySQL is connected to without specifying a database, this can be used to import from multiple databases. Default `[]` (all schemas).

!> The default schema on Postgres is `public` which is a reserved keyword in TypeScript. You may need to use the `noImplicitUseStrict` flag when transpiling.

This has no effect on SQLite as the concept of schemas do not exist. 

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "schemas": ["dbo", "schema1"]
}
```

<!-- div:title-panel -->
### additionalProperties

<!-- div:left-panel -->
Specifies additional properties to be assigned to the output TypeScript file. Key is in the format `schema.table` and the value is a list of raw strings. 

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "additionalProperties": {
    "dbo.Table_1": [
      "propertyOne: string",
      "propertyTwo?: number | null"
    ]
  }
}
```

<!-- div:title-panel -->
### extends

<!-- div:left-panel -->
Specifies the superclass than should be applied to the generated interface. Key is in the format `schema.table` and the value is the extension to apply. The following would generate `export interface Table_1 extends Extension, AnotherExtension { }`

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "extends": {
    "dbo.Table_1": "Extension, AnotherExtension"
  }
}
```

<!-- div:title-panel -->
### template

<!-- div:left-panel -->
Specifies the [handlebars](https://handlebarsjs.com) template to use when creating the output TypeScript file relative to the current working directory. See [src/template.handlebars](https://github.com/rmp135/sql-ts/blob/master/src/template.handlebars) for the default template. 

See the below section on [templating](#templating) for more info on how to use the template.

<!-- div:right-panel -->
```json
{
  "client": "...",
  "connection": {},
  "template": "./template.handlebars"
}
```
<!-- panels:end -->

## Comments

Comments provided on tables, views and columns are imported into the template. 

By default these will be inserted into the generated file as comments on interfaces and properties.

Different database providers provide these comments in different ways.

Provider   | Source
-----------|---------------------------------------------
MySQL      | "Comments" field
SQL Server | Extended property with name "MS_Description"
Postgres   | "Comment" field
SQLite     | Not supported


## Object Name Format

Objects are typically referred to using the pattern `{schema}.{table}.{column}`, or `{schema}.{table}` if the column is not required. 

Table and column are fairly obvious but schemas are used differently depending on the database provider. The below table lists how the schema is read for each provider.

Provider   | Source
-----------|-------------
Postgres   | The schema that the table belongs to.
SQL Server | The schema that the table belongs to.
MySQL      | The database name.
SQLite     | 'main'

For example, column `ID` in table `Customer` in database `Live` in a MySQL would be referred to as `Live.Customer.ID`.


## Templating

The [`template.handlbars`](https://github.com/rmp135/sql-ts/blob/master/src/template.handlebars) file controls the output of the generated .ts file. You can modify this file and use the `template` config option to specify a custom template file.

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
  }
}
```

## FAQ

### Why are properties optional?

By default, sql-ts builds the configuration from an INSERT perspective. That is to say, columns that can be NULL, have defaults, or are generated are set as optional (`?` on property) in the generated interface. This allows for not requiring them on the object and SQL will set the value on insert.

However, this can cause issues when using the generated interface for passing around to other areas of an application that are requiring a concrete value.

To resolve this, you will need to remove the optionality from the template. 

- Copy the [`template.handlbars`](https://github.com/rmp135/sql-ts/blob/master/src/template.handlebars) file, removing the `{{#if optional}}?{{/if}}` from the property definition and use the [template](#template) config option to specify the new template. This may require you to set the property to `null` on inserting to prevent TypeScript complaining.
- Alternatively, do the above with a second config file (e.g. `sql-ts-read.json`) that uses the [interfaceNameFormat](#interfacenameformat) config option to rename interfaces to be be readable (e.g. `${table}ReadEntity`) to generate read models of the database. 


## Bespoke Configuration

### Windows MSSQL Native Client

Windows authentication for the `mssql` client should be configured with with the `msnodesqlv8` driver (Windows only).

For instructions to setup the SQL Server Native client installed see [mode-mssql/issue/338](https://github.com/patriksimek/node-mssql/issues/338#issuecomment-278400345)

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
