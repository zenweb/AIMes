process.env.HOST ||= '127.0.0.1'
process.env.PORT ||= '4173'

await import('../.output/server/index.mjs')
