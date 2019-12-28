const jwt = require('jsonwebtoken');
const db = require('../../db');
const bcrypt = require('../../utilities/bcrypt');
const bodyParser = require('koa-bodyparser');

const login  = async (ctx) => {

    const { email, password } = ctx.request.body;  

    if (!email) ctx.throw(422, 'email required.');  
    if (!password) ctx.throw(422, 'Password required.');

   

    const dbUser = await db.first(['id', 'alias', 'nombre', 'email','idperfil','passwordHash'])  
    .from('jugador')      
    .where({ email });
    
    console.log(dbUser);


    if (!dbUser) ctx.throw(401, 'Credenciales incorrectas.');

    if (await bcrypt.compare(password, dbUser.passwordHash)) {

        delete dbUser.passwordHash;

        const payload = { sub: dbUser.id };  
        const token = jwt.sign(payload, 'secret');  
        ctx.body = JSON.stringify(
            {data: dbUser, token});
    }else {
        ctx.throw(401, 'Credenciales incorrectas.');
      }
    

  };


  exports.register = function(router){    
    router.post('/login', bodyParser(), login);   
};