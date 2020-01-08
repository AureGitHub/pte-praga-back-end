const tokenGen = require('../utilities/token');
const jwt = require("jwt-simple");
const variable = require('../utilities/variables');
const db = require('../db');


var SetToken = async (ctx,idUser) => {

  const userInToken = await db.first(['id', 'alias', 'nombre', 'email','idperfil','idestado'])  
  .from('jugador')      
  .where({ id :idUser });  
  var createToken =tokenGen.OnlygenToken(idUser, ctx.request.ip);     
  const token = createToken.token;
  const expire = createToken.expire;
  ctx.state[variable.KeySecure]={token, expire, user: userInToken}; 

  
}


var businessRules = async  (ctx,userInToken)=>{ 

  switch(ctx._matchedRoute){
    case '/jugadores':
      // si el que modifica no es un admin, solo se puede moficar a si mismo            
      if(ctx.request.method==='PUT'){
        const userToUpdate = ctx.request.body;

        if(userInToken.idperfil!=1 && userToUpdate.id != userInToken.id){
          //un no admin intenta modificar a otro jugador
          ctx.throw(403, 'No tiene permiso para modificar a otro jugador');
        }


      }

      break;
  }

 }


var GestionPermisos = async  (ctx)=>{  
  

  const item_matchedRoute = require('./secure').secure.find((a)=>  ctx._matchedRoute === a._matchedRoute);

  if(!item_matchedRoute){
    ctx.throw(403, 'no tiene definida la seguridad (' + ctx._matchedRoute + ')');   
  }

    var token = ctx.request.headers[variable.KeySecure];

    if(token){
      // si tiene token, tiene que ser todo correcto, aunque sea publico

      var decoded = jwt.decode(token, variable.JWT_SECRET);
  
    if (decoded.expire <= Date.now()) {
      ctx.throw(403, 'su sesión ha expirado');
    }
  
    if(!decoded.idUser){
      ctx.throw(403, 'token de seguridad incorrecto');
    } 
  
    const userInToken = await db.first(['id', 'idperfil'])  
    .from('jugador')      
    .where({ id : decoded.idUser });
  
    
    if(!userInToken){
      ctx.throw(403, 'token de seguridad incorrecto. No se puede establecer el usuario');
    }
  
    

    if(item_matchedRoute == null){
      ctx.throw(403, 'no tiene definida la seguridad');      
    }

    const perfilDelUser = item_matchedRoute.perfiles.filter(a => a.idperfil ===  userInToken.idperfil);
  
    if(!perfilDelUser || perfilDelUser.length === 0){
          ctx.throw(403, 'no tiene definido el perfil en la seguridad');      
     }

     if(!perfilDelUser[0].permisos ||  perfilDelUser[0].permisos.length === 0){
      ctx.throw(403, 'no tiene definido los permisos para el perfil');      
 }

     if(!perfilDelUser[0].permisos.find(a=> a === 'A') && !perfilDelUser[0].permisos.find(a=> a === ctx.request.method)){
      ctx.throw(403, 'no está autorizado para realizar esta operación'); 
     }

     await businessRules(ctx,userInToken);


    return userInToken; 


    } else{
      if(!item_matchedRoute.esPublico){
        // si no tiene token y no es publico => error
        ctx.throw(403, 'no se puede obtener la key de seguridad');
      }
      else{
        // es publico sin token
        return null;
      }
    }

      
    
  
  }  
   

const awaitErorrHandlerFactory = middleware => {
    return async (ctx, next) => {
      try {        
          
        var userInTokenDirty=await GestionPermisos(ctx);   
        if(userInTokenDirty){
          ctx.state['idUser'] = userInTokenDirty.id;  
        }
        
        await middleware(ctx, next);

        if(userInTokenDirty){
          await SetToken(ctx,userInTokenDirty.id); 
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
