const Koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');

const errorHandler = require('./middleware/errorHandler');
const Router = require('koa-router');

const router = new Router();

const authRoute = require('./routes/auth');


var app = new Koa();
app.use(cors());


app.use(errorHandler);

app.use(router.routes());
app.use(router.allowedMethods());

router.post('/auth',bodyParser(), authRoute);

//app.use(route);




app.listen(4000);
console.log('connected');