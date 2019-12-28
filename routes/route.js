var Router = require('koa-router');
var router = new Router();


require('./services/auth').register(router);
require('./services/codes').register(router);

require('./services/jugador').register(router);


module.exports = router.middleware();