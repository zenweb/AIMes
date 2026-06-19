const http = require('http')

const server = http.createServer((req, res) => {
  const targetPort = (req.url.startsWith('/api') || req.url.startsWith('/hubs')) ? 5003 : 3000
  const request = http.request({
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${targetPort}` },
  }, (upstream) => {
    res.writeHead(upstream.statusCode || 502, upstream.headers)
    upstream.pipe(res)
  })

  request.on('error', (error) => {
    res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(`AIMes local proxy failed: ${error.message}`)
  })

  req.pipe(request)
})

server.listen(4173, '127.0.0.1')
