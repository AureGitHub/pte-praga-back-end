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



const deleteJugador = async (ctx,next) => {
    const id=ctx.params.id;

    const sal = await db('jugador').where('id',id).del();
    console.log(sal);

    ctx.body = JSON.stringify(sal);

}



exports.register = function(router){
    router.get('/jugadores', getAll);
    router.post('/jugadores', bodyParser(), addJugador);
    router.delete('/jugadores/:id', bodyParser(), deleteJugador);
};
