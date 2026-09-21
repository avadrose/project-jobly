const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works with one field", function () {
    const result = sqlForPartialUpdate(
      { firstName: "Ava" },
      { firstName: "first_name" }
    );

    expect(result).toEqual({
      setCols: '"first_name"=$1',
      values: ["Ava"]
    });
  });

  test("works with multiple fields", function () {
    const result = sqlForPartialUpdate(
      {
        firstName: "Ava",
        lastName: "Rose",
        age: 30
      },
      {
        firstName: "first_name",
        lastName: "last_name"
      }
    );

    expect(result).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2, "age"=$3',
      values: ["Ava", "Rose", 30]
    });
  });

  test("throws BadRequestError when no data", function () {
    expect(() =>
      sqlForPartialUpdate({}, {})
    ).toThrow(BadRequestError);
  });
});