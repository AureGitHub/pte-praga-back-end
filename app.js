const Koa = require('koa');
const cors = require('koa-cors');
const errorHandler = require('./middleware/errorHandler');
const router = require('./routes/route');

var app = new Koa();
app.use(cors());

app.use(errorHandler);

app.use(router);

app.listen(4000);
console.log('connected');