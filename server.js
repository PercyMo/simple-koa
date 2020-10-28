const koa = require('./koa/application.js')
const app = new koa()

app.on('error', err => {
  console.log('error happends: ', err.stack)
})

app.use(async (ctx, next) => {
  console.log('1')
  await next()
  console.log('5')
})

app.use(async (ctx, next) => {
  console.log('2')
  await next()
  console.log('4')
})

app.use(async (ctx, next) => {
  console.log('3')
  ctx.body = 'hello world!'
})

app.listen(8081, () => {
  console.log('监听：', 8081)
})