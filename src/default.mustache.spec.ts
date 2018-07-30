import "jasmine";
import * as index from "./index";
import { Database, Config } from "./Typings";

const database: Database = {
  tables: [
    {
      columns: [
        {
          jsType: "string",
          nullable: false,
          name: "col1",
          type: "varchar",
          optional: false
        },
        {
          jsType: "string",
          nullable: true,
          name: "col2",
          type: "varchar",
          optional: false
        },
        {
          jsType: "Date",
          nullable: false,
          name: "created_at",
          type: "timestamp",
          optional: true
        }
      ],
      name: "table1",
      schema: "mySchema"
    },
    {
      columns: [
        {
          jsType: "string",
          nullable: false,
          name: "col10",
          type: "varchar",
          optional: false
        }
      ],
      name: "table2",
      schema: "mySchema"
    }
  ]
};

describe("DatabaseTasks", () => {
  it("uses a mustache template when provided", () => {
    const config: Config = {
      template: __dirname + "/../dist/default.mustache"
    };

    const typescript = index.fromObject(database, config);

    expect(typescript).toBe(
`export interface table1Entity {
  col1: string
  col2: string | null
  created_at?: Date
}
export interface table2Entity {
  col10: string
}
`);
  });
});
