'use strict';

module.exports = `Basic ${Buffer.from(`${process.env.GITHUB_USERNAME}:${process.env.GITHUB_TOKEN}`).toString('base64')}`;