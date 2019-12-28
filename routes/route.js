var Router = require('koa-router');
var router = new Router();





require('./services/jugador').register(router);


module.exports = router.middleware();