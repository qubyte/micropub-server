'use strict';

const fs = require('fs').promises;
const path = require('path');
const upload = require('./upload');

module.exports = async function uploadImage(photo) {
  const buffer = await fs.readFile(photo.path);
  const time = Date.now();
  const suffix = path.extname(photo.originalFilename);
  
  await upload('New photo.\n\n[skip ci]', 'images', time, suffix, buffer);
  
  return `/images/${time}${suffix}`;
};
