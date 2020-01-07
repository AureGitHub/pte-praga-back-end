const Koa = require('koa');
const cors = require('koa-cors');
const errorHandler = require('./middleware/errorHandler');
const router = require('./routes/route');
const variable=require('./utilities/variables');






var app = new Koa();
app.use(cors());

app.use(errorHandler);

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const end = Date.now();
    //set the header
    ctx.set('X-Response-Time-Start', `${start} ms`);
    ctx.set('X-Response-Time', `${end - start} ms`);

   

    ctx.body = ctx.state['body'];
    if(ctx.state[variable.KeySecure]!=null){
        ctx.body[variable.KeySecure]=ctx.state[variable.KeySecure];
    }
    
    //ctx.set(variable.KeySecure, JSON.stringify(ctx.state[variable.KeySecure]));

});

app.use(router);

app.listen(process.env.PORT || 4000);
console.log('connected');