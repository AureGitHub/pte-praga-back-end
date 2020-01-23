var Router = require('koa-router');
var router = new Router();


require('./services/auth').register(router);
require('./services/codes').register(router);

require('./services/jugador').register(router);
require('./services/partido').register(router);
require('./services/partidoxjugador').register(router);
require('./services/inteligencia').register(router);

// router.get('/*', async (ctx,next) => {ctx.throw(501, 'pagina no encontrada');})


module.exports = router.middleware();