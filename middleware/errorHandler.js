module.exports = async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      console.log(err);
      ctx.app.emit('error', err, ctx);
    }
  };