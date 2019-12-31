var sqlite3 = require('sqlite3').verbose();
const db = require('../../db');
const bodyParser = require('koa-bodyparser');



const getAll = async (ctx,next) => {

    const users = await db
    .select(
        'jugador.*',
        'posicion.descripcion as posicion',
        'perfil.descripcion as perfil'
        )
    .from('jugador')
    .innerJoin('posicion', 'jugador.idposicion', '=', 'posicion.id')     
    .innerJoin('perfil', 'jugador.idperfil', '=', 'perfil.id') 

    users.forEach(user => {
        delete user.password;
        delete user.passwordHas;
    })

    ctx.body = JSON.stringify(users);
    
}


const addJugador = async (ctx,next) => {
    const Newuser = ctx.request.body;
    delete Newuser.id;
    
    Newuser['id'] = await db('jugador').insert(Newuser);

    ctx.body = Newuser;


}

const updateJugador = async (ctx,next) => {
    try{
        const user = ctx.request.body;
        sal = await db('jugador').where('id',user.id).update(user);
       
        ctx.body = sal;
        ctx.body = JSON.stringify(sal);
    }
    catch(err){
        ctx.throw(409, err.stack);
        
    }
    

}




const deleteJugador = async (ctx,next) => {
    const id=ctx.params.id;

    const sal = await db('jugador').where('id',id).del();
   

    ctx.body = JSON.stringify(sal);

}



exports.register = function(router){
    router.get('/jugadores', getAll);
    router.post('/jugadores', bodyParser(), addJugador);
    router.put('/jugadores', bodyParser(), updateJugador);
    router.delete('/jugadores/:id', bodyParser(), deleteJugador);
};
