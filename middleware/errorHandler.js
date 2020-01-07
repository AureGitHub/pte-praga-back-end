module.exports = async (ctx, next) => {
    try {
      await next();
    } catch (err) {

      ctx.status = err.statusCode || err.status || 500;
      ctx.state['body'] = {
        status: ctx.status,
        message: err.message,
        error: true,
        url: ctx.url
      };
     // ctx.app.emit('error', err, ctx);
    }
  };