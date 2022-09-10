export default {
  global: {
    string: ['nchar', 'nvarchar', 'varchar', 'char', 'tinytext', 'text', 'longtext', 'mediumtext', 'ntext', 'citext', 'varbinary', 'uuid', 'uniqueidentifier', 'character varying', 'bigint', 'xml'],
    'string[]': ['_text', '_uuid'],
    number: ['tinyint', 'int', 'numeric', 'integer', 'real', 'smallint', 'decimal', 'float', 'float4', 'float8', 'double precision', 'double', 'dec', 'fixed', 'year', 'serial', 'bigserial', 'int2', 'int4', 'money', 'smallmoney'],
    Date: ['datetime', 'timestamp', 'date', 'time', 'timestamptz', 'datetime2', 'smalldatetime', 'datetimeoffset'],
    boolean: ['bit', 'boolean', 'bool'],
    Object: ['json', 'TVP'],
    Buffer: ['binary', 'varbinary', 'image', 'UDT']
  },
  postgres: {
    string: ['numeric', 'decimal', 'int8', 'money', 'bpchar', 'character_data' ] ,
    'string[]' : ['_char', '_varchar', '_bpchar', '_character_data']
  },
  mssql: {
    string: ['timestamp']
  }
}
