const assert = require('assert');
const fs = require('fs');
const joi = require('joi');

const schema = joi.array().items(
  joi.alternatives(
    joi.string(),
    joi.object({
      emoji: joi.string().optional(),
      name: joi.string().optional(),
      text: joi.string().required()
    })
  )
);

fs.readdir('.', (err, files) => {
  if (err) {
    throw err;
  }

  files
    .filter(f => f.endsWith('.json') && !f.match(/package(-lock)?\.json/))
    .forEach(file => {
      const json = JSON.parse(fs.readFileSync(file));

      joi.validate(json, schema, (e, v) => {
        if (e) {
          const index = e.details[0].path[0];
          const message = e.details.map(d => d.message).join(', ');
          throw new Error(`item at index ${index} is invalid: ${message}`);
        }
      });
    });
});
