const tokenGen = require('../utilities/token');
const jwt = require("jwt-simple");
const variable = require('../utilities/variables');
const db = require('../db');


var GestionPermisos=async  (ctx)=>{  
  
    var token = ctx.request.headers[variable.KeySecure];
    if(!token){
      ctx.throw(403, 'no autorizado');
    }
  
    var decoded = jwt.decode(token, variable.JWT_SECRET);
  
    if (decoded.expire <= Date.now()) {
      ctx.throw(403, 'su sesión ha expirado');
    }
  
    if(!decoded.idUser){
      ctx.throw(403, 'token de seguridad incorrecto');
    }
  
    //paso de user en claro.. utilizo el Id del user encriptado
  
    const userInToken = await db.first(['id','idperfil'])  
    .from('jugador')      
    .where({ id : decoded.idUser });
  
    
    if(!userInToken){
      ctx.throw(403, 'token de seguridad incorrecto');
    }
  
    const item_matchedRoute = require('./secure').secure.find((a)=>  ctx._matchedRoute.includes(a._matchedRoute));

    if(item_matchedRoute == null){
      ctx.throw(403, 'no autorizado');      
    }

    if(variable.SecureActivated){

      var createToken =tokenGen.OnlygenToken(userInToken.id, ctx.request.ip); 

        const tokenOut = createToken.token;
        const expire = createToken.expire;
        ctx.state[variable.KeySecure]={token: tokenOut, expire}; 
      
    }
  
    // if(!perfiles.find(a=> a===userInToken.idperfil)){
    //       ctx.throw(403, 'no autorizado');      
    //   }
    return userInToken; 
  
  }
  
   

const awaitErorrHandlerFactory = middleware => {
    return async (ctx, next) => {
      try {
  
        //const perfiles=[1,2,3];
        if(variable.SecureActivated){
          var userInToken=await GestionPermisos(ctx);
        }
  
        
  
        await middleware(ctx, next);
  
        
        if(variable.SecureActivated){
          ctx.state[variable.KeySecure]=tokenGen.OnlygenToken(userInToken.id, ctx.request.ip); 
        }
  
  
        
  
        
      } catch (err) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.state['body'] = {
          status: ctx.status,
          message: err.message,
          error: true,
          url: ctx.url
        };
      }
    };
  };

  
  exports.awaitErorrHandlerFactory = awaitErorrHandlerFactory;
