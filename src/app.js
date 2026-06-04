import express from 'express'
import path from 'path'
import { config } from './config.js'
import apiRouter from './routes/api.js'
import browseRouter from './routes/browse.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'no-referrer')
    next()
  })

  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true, limit: '2mb' }))

  app.use(express.static(config.publicDir, {
    maxAge: config.isProd ? '1d' : 0,
    etag: true,
  }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api', apiRouter)
  app.use('/browse', browseRouter)

  app.get('/', (_req, res) => {
    res.sendFile(path.join(config.publicDir, 'index.html'))
  })

  return app
}
