
const db = require('../../db');
const bcrypt = require('../../utilities/bcrypt');
const bodyParser = require('koa-bodyparser');
const tokenGen = require('../../utilities/token');
const variable=require('../../utilities/variables');





const login  = async (ctx) => {

    const { email, password } = ctx.request.body;  
    if (!email) ctx.throw(422, 'email required.');  
    if (!password) ctx.throw(422, 'Password required.');
    const dbUser = await db.first(['id', 'alias', 'nombre', 'email','idperfil','idestado','passwordhash'])  
    .from('jugador')      
    .where({ email });

    if (!dbUser) ctx.throw(401, 'Credenciales incorrectas 1.');

    if (await bcrypt.compare(password, dbUser.passwordhash)) {

        delete dbUser.passwordhash;

        var createToken =tokenGen.OnlygenToken(dbUser.id, ctx.request.ip); 

        const token = createToken.token;
        const expire = createToken.expire;

        ctx.state['body'] ={data : dbUser, error: false};
        ctx.state[variable.KeySecure]={token, expire, user: dbUser}; 

        // ctx.body = JSON.stringify(
        //     {data: dbUser, token, expire});
    }else {
        ctx.throw(401, 'Credenciales incorrectas.');
      }
    

  };



  exports.register = function(router){    
    router.post('/login', bodyParser(), login);   
};