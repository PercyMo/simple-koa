module.exports = {
  get body() {
    // body的读写是对 this._body 进行读写和操作，并没有使用原生的this.res.end
    // 因为我们在编写koa代码时，会对body进行多次的读取和修改
    return this._body
  },
  set body(data) {
    this._body = data
  },
  get status() {
    return this.res.statusCode
  },
  set status(code) {
    if (typeof code !== 'number') {
      throw new Error('statusCode must be a number!')
    }
    this.res.statusCode = code
  }
}
