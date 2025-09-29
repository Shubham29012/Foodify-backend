// Reusable Joi validator for params/query/body/headers
const Joi = require("joi");

const PARTS = /** @type {const} */ (["params", "query", "body", "headers"]);

function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      for (const part of PARTS) {
        const schema = schemas[part];
        if (!schema) continue;

        const { value, error } = schema.validate(req[part], {
          abortEarly: false,    // show all errors
          convert: true,        // coerce "1" -> 1, "true" -> true, etc.
          stripUnknown: true,   // drop unknown keys
        });

        if (error) {
          return res.status(400).json({
            error: "ValidationError",
            details: error.details.map(d => ({
              message: d.message,
              path: d.path.join("."),
              type: d.type,
            })),
          });
        }
        req[part] = value; // sanitized data back on the request
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { validate, Joi };
