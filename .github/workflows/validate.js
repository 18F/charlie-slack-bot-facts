const fs = require("fs");
const joi = require("joi");

const schema = joi.array().items(
  joi.alternatives(
    joi.string(),
    joi.object({
      emoji: joi.string().optional(),
      name: joi.string().optional(),
      text: joi.string().required(),
    })
  )
);

fs.readdir(".", (err, files) => {
  if (err) {
    throw err;
  }

  files
    .filter((f) => f.endsWith(".json") && !f.match(/package(-lock)?\.json/))
    .forEach((file) => {
      const json = JSON.parse(fs.readFileSync(file));

      const { error } = schema.validate(json);
      if (error) {
        error.details.forEach(({ message, path, context: { value } }) => {
          console.log(`Invalid value "${value}" at ${path.join(".")}:`);
          console.log(`  | ${message}`);
        });
        throw new Error(`JSON is invalid`);
      }
    });
});
