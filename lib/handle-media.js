'use strict';

const mime = require('mime-types');
const headers = require('./headers');
const githubAuth = require('./github-authorization');
const parseMultipart = require('./parse-multipart');
const uploadImage = require('./upload-image');

async function createFile(message, content, extension) {
  const body = JSON.stringify({ message, content });
  const filename = `${Date.now()}${extension}`;

  console.log('CREATING FILE:', filename); // eslint-disable-line

  const res = await fetch(`https://api.github.com/repos/qubyte/qubyte-codes/contents/src/notes-media/${filename}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: githubAuth
    },
    body
  });

  if (!res.ok) {
    const body = await res.text()
    console.log(`Unexpected response from GitHub: ${body}`);
    throw new Error(`Unexpected response from GitHub: ${res.status}`);
  }

  return filename;
}

module.exports = async function handleMedia(req, res) {
  const parsed = await parseMultipart(req);
  
  if (!parsed.files) {
    return res.writeHead(400).end();
  }
  
  const keys = Object.keys(parsed.files).sort();
  
  if (!keys.length) {
    return res.writeHead(400).end();
  }
  
  if (keys.length > 1) {
    console.warn(`Unexpected number of file keys: ${keys}`);
  }
  
  const media = keys.flatMap(key => parsed.files[key]);
  const photo = media[0];
  
  if (!photo) {
    console.error('No photo.');
    return res.writeHead(400).end();
  }
  
  const path = await uploadImage(photo);
  const body = JSON.stringify({ path });
  
  res.writeHead(202, headers({ 
    Location: `https://qubyte.codes${path}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  })).end(body);
};

// module.exports = async function handleMedia(req, res) {
//   const chunks = [];
  
//   for await (const chunk of req) {
//     chunks.push(chunk);
//   }
  
//   const photo = Buffer.concat(chunks);
  
//   if (!photo) {
//     console.error('No photo.');
//     return res.writeHead(400).end();
//   }
  
//   const path = await uploadImage(photo);
//   const body = JSON.stringify({ path });
  
//   res.writeHead(202, headers({ 
//     Location: `https://qubyte.codes${path}`,
//     'Content-Type': 'application/json',
//     'Content-Length': Buffer.byteLength(body)
//   })).end(body);
// };
