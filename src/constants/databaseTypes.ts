// Common database data types for ER diagrams
export const DATABASE_TYPES = [
  // Numeric Types
  'INT',
  'INTEGER',
  'BIGINT',
  'SMALLINT',
  'TINYINT',
  'DECIMAL',
  'NUMERIC',
  'FLOAT',
  'DOUBLE',
  'REAL',

  // String Types
  'VARCHAR',
  'CHAR',
  'TEXT',
  'LONGTEXT',
  'MEDIUMTEXT',
  'TINYTEXT',

  // Date and Time Types
  'DATE',
  'TIME',
  'DATETIME',
  'TIMESTAMP',
  'YEAR',

  // Binary Types
  'BINARY',
  'VARBINARY',
  'BLOB',
  'LONGBLOB',
  'MEDIUMBLOB',
  'TINYBLOB',

  // Boolean
  'BOOLEAN',
  'BOOL',

  // Other Types
  'JSON',
  'ENUM',
  'SET',
  'UUID',
] as const;

export type DatabaseType = typeof DATABASE_TYPES[number];
