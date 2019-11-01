'use strict'

const url = require('url');
const cheerio = require('cheerio');
const headers = require('./headers');
const syndications = require('./syndications');
const getTitle = require('./get-title');
const parseMultipart = require('./parse-multipart');
const upload = require('./upload');
const uploadImage = require('./upload-image');

async function createFile(message, type, data) {
  const time = Date.now();
  const buffer = Buffer.from(JSON.stringify(data, null, 2));
  const result = await upload(message, type, time, '.json', buffer);

  return `https://qubyte.codes/${type}/${time}`;
}

function convertQueryStringToObject(queryString) {
  const query = new URLSearchParams(queryString);
  const keys = new Set(query.keys());
  const properties = {};
  
  for (const key of keys) {
    const normalizedKey = key.endsWith('[]') ? key.slice(0, -2) : key;

    if (normalizedKey !== 'h') {
      properties[normalizedKey] = query.getAll(key).filter(Boolean);
    }
  }

  return { type: ['h-entry'], properties };
}

async function parseBody(req) {
  const type = req.headers['content-type'];

  if (type.match(/multipart/)) {
    return parseMultipart(req);
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString();

  if (type.match(/json/)) {
    return JSON.parse(body);
  }
  
  if (type.match(/x-www-form-urlencoded/)) {
    return convertQueryStringToObject(body);
  }
  
  throw new Error(`Unhandled MIME type: ${type}`);
}

module.exports = async function handleEndpoint(req, res) {
  const { query } = url.parse(req.url, true);

  if (query.q === 'syndicate-to') {
    console.log('Responding to syndication query.'); // eslint-disable-line no-console

    const body = JSON.stringify({ 'syndicate-to': syndications() });

    res.writeHead(200, headers({ 
      'Content-Type': 'application/json', 
      'Content-Length': Buffer.byteLength(body) 
    }));

    return res.end(body);
  }

  if (query.q === 'config') {
    console.log('Responding to config query.'); // eslint-disable-line no-console

    const body = JSON.stringify({
      'syndicate-to': syndications(),
      // 'media-endpoint': `https://${process.env.PROJECT_DOMAIN}.glitch.me/media`
    });

    res.writeHead(200, headers({ 
      'Content-Type': 'application/json', 
      'Content-Length': Buffer.byteLength(body) 
    }));

    return res.end(body);
  }

  let data;

  try {
    data = await parseBody(req);
  } catch (e) {
    res.writeHead(400, headers());
    console.error(e);
    return res.end();
  }

  delete data.access_token; // quill

  console.log({data})

  if (!Object.keys(data).length) {
    console.log('Responding to empty body.'); // eslint-disable-line no-console
    res.writeHead(204, headers());
    return res.end();
  }

  let created;

  if (data.properties['repost-of']) {
    data.name = await getTitle(data.properties['repost-of'][0]);
    created = await createFile('New link.', 'links', data);
  } else if (data.properties['bookmark-of']) {
    created = await createFile('New link.', 'links', data);
  } else if (data.properties['like-of']) {
    created = await createFile('New like.', 'likes', data);
  } else if (data.properties['in-reply-to']) {
    data.name = await getTitle(data.properties['in-reply-to'][0]);
    created = await createFile('New Reply.', 'replies', data);
  } else {
    // The default is a note, which I allow to have images.
    if (data.files && data.files.photo && data.files.photo.length) { // quill uses a photo field
      const uploadedImage = await uploadImage(data.files.photo[0]);
      
      delete data.files;
      
      data.photos = [uploadedImage];
    }
    created = await createFile('New note.', 'notes', data);
  }

  res.writeHead(202, headers({ Location: created })).end();
};
