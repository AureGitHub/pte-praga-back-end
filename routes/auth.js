const jwt = require('jsonwebtoken');
const db = require('../db');
const bcrypt = require('../utilities/bcrypt');

module.exports = async (ctx) => {

    const { email, password } = ctx.request.body;  

    if (!email) ctx.throw(422, 'email required.');  
    if (!password) ctx.throw(422, 'Password required.');

    const dbUser = await db.first(['id', 'passwordHash','alias'])  
    .from('jugador')  
    .where({ email });   

    console.log(JSON.stringify(dbUser));

    if (!dbUser) ctx.throw(401, 'No such user.');

    if (await bcrypt.compare(password, dbUser.passwordHash)) {
        const payload = { sub: dbUser.id };  
        const token = jwt.sign(payload, 'secret');  
        ctx.body = JSON.stringify(
            {dbUser, token});
    }else {
        ctx.throw(401, 'Incorrect password.');
      }
    

  };