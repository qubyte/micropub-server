'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');

module.exports = async function getTitle(url) {
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Unexpected response from ${url}`);
  }
  
  const body = await res.text();
  const $ = cheerio.load(body);
  
  try {
    return $('title').text();
  } catch (e) {
    return url;
  }
};
