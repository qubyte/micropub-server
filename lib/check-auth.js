'use strict';

const fetch = require('node-fetch');

module.exports = async function checkAuth(Authorization) {
  const res = await fetch('https://tokens.indieauth.com/token', {
    headers: {
      Accept: 'application/json',
      Authorization
    }
  });
  
  if (!res.ok) {
    console.log(`Unexpected response: ${await res.text()}`)
    throw new Error(`Unexpected status: ${res.status}`);
  }
  
  const body = await res.json();
  
  if (body.me !== 'https://qubyte.codes/') {
    throw new Error('Not authorized.');
  }

  if (!(body.scope.includes('create') || body.scope.includes('post'))) {
    throw new Error('Not an acceptable scope.');
  }

  console.log('Authorized');
};
