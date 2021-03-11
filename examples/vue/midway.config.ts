import { defineConfig } from '@midwayjs/hooks'
import bodyParser from 'koa-bodyparser'

module.exports = defineConfig({
  middleware: [bodyParser()],
  source: 'src/apis',
  routes: [
    {
      baseDir: 'lambda',
      basePath: '/api',
    },
  ],
})
