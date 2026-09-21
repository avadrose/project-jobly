/** Build a SQL SET clause for a partial update.
 *
 * dataToUpdate:
 *   object containing fields/values to update
 *
 * jsToSql:
 *   mapping of JavaScript field names to database column names
 *
 * Returns:
 *   {
 *     setCols: '"first_name"=$1, "age"=$2',
 *     values: ['Aliya', 32]
 *   }
 *
 * Throws BadRequestError if no data is provided.
 */

const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
