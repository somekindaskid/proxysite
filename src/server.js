import { config } from './config.js'
import { createApp } from './app.js'

const app = createApp()

app.listen(config.port, () => {
  if (config.isProd) {
    console.log(`Server listening on port ${config.port}`)
    return
  }
  console.log(`Server ready at http://127.0.0.1:${config.port}`)
  console.log(`Upstream SOCKS5: ${config.socksHost}:${config.socksPort}`)
})
