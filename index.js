'use strict';

const url = require('url');
const checkAuth = require('./lib/check-auth');
const headers = require('./lib/headers');
const handleEndpoint = require('./lib/handle-endpoint');
const handleMedia = require('./lib/handle-media');

const port = process.env.PORT;

const server = require('http').createServer(async (req, res) => {
  console.log('GOT REQUEST:', req.url, { ...req.headers, authorization: undefined });

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers())
    return res.end();
  }

  const { pathname } = url.parse(req.url);

  if (pathname === '/') {
    return res.writeHead(200, headers()).end('Remix me: https://glitch.com/edit/#!/remix/micropub-server');
  }

  console.log('CHECKING AUTH');

  try {
    if (req.headers['short-circuit-auth']) {
      if (req.headers.authorization !== `Bearer ${process.env.SECRET}`) {
        throw new Error(`Secret mismatch. Got: ${req.headers.authorization}`);
      }
    } else {
      await checkAuth(req.headers.authorization);
    }
  } catch (e) {
    console.error(e.stack);
    return res.writeHead(401).end();
  }
  
  switch (url.parse(req.url).pathname) {
    case '/endpoint':
      console.log('USING /endpoint');
      return handleEndpoint(req, res);
    
    case '/media':
      console.log('USING /media');
      return handleMedia(req, res);
    
    default:
      console.log('USING 404');
      return res.writeHead(404).end();
  }
});

server.listen(port, () => console.log(`Listening on ${port}.`));