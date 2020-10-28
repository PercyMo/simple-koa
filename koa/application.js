const http = require('http')
const Emitter = require('events')
const context = require('./context')
const request = require('./request')
const response = require('./respones')

class Application extends Emitter {
  constructor() {
    super()
    this.middlewares = []
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
  }

  /**
   * 开启http server，并传入callback
   */
  listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }
  
  /**
   * 中间件挂载
   */
  use(middleware) {
    this.middlewares.push(middleware)
  }

  /**
   * 构造ctx
   * @param {Object} req node req 实例
   * @param {Object} res node res 实例
   * @return {Object} ctx实例
   */
  createContext(req, res) {
    // 针对每个请求，都要创建ctx对象
    const ctx = Object.create(this.context)
    ctx.request = Object.create(this.request)
    ctx.response = Object.create(this.response)
    ctx.req = ctx.request.req = req
    ctx.res = ctx.response.res = res
    return ctx
  }

  compose() {
    // 将middlewares合并成一个函数，该函数接受一个ctx对象
    return async ctx => {
      // createNext函数的作用就是将上一个中间件的next当参数传给下一个中间件，并将上下文ctx绑定当前中间件
      // 当中间件执行完，调用next()的时候，其实就是去执行下一个中间件
      const createNext = (middleware, oldNext) => {
        return async () => {
          await middleware(ctx, oldNext)
        }
      }

      let next = async () => {
        return Promise.resolve()
      }
      const len = this.middlewares.length
      // 这是一个链式反向递归模型的实现
      // 当循环到第一个中间件的时候，只需要执行一次next()，就能链式地递归调用所有中间件
      for (let i = len - 1; i >= 0; i--) {
        const currentMiddleware = this.middlewares[i]
        next = createNext(currentMiddleware, next)
      }

      await next()
    }
  }

  /**
   * 获取http server所需的callback函数
   * @return {function} fn
   */
  callback() {
    return (req, res) => {
      const ctx = this.createContext(req, res)
      const respond = () => this.responseBody(ctx)
      const onerror = err => this.onerror(err, ctx)
      const fn = this.compose()
      fn(ctx).then(respond).catch(onerror)
    }
  }

  /**
   * 对客户端消息进行回复
   */
  responseBody(ctx) {
    const content = ctx.body
    if (typeof content === 'string') {
      ctx.res.end(content)
    } else if (typeof content === 'object') {
      ctx.res.end(JSON.stringify(content))
    }
  }

  /**
   * 错误处理
   */
  onerror(err, ctx) {
    if (err.code === 'ENOENT') {
      ctx.status = 404
    } else {
      ctx.status = 500
    }
    const msg = err.message || 'Internal error'
    ctx.res.end(msg)
    this.emit('error', err)
  }
}

module.exports = Application
