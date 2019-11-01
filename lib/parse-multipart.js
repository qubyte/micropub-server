'use strict';

const multiparty = require('multiparty');

module.exports = function parseMultipart(req) { 
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      const result = { files };

      for (const [field, value] of Object.entries(fields)) {
        const values = [].concat(value).filter(Boolean);

        if (field.endsWith('[]')) {
          result[field.slice(0, -2)] = values;
        } else  {
          result[field] = values[0];
        }
      }

      resolve(result);
    });
  });
};
