const db = require('../../db');
const bodyParser = require('koa-bodyparser');
const myConstants= require('./../../utilities/myConstants');
const transporter = require('./../../utilities/email');


const awaitErorrHandlerFactory=require('../interceptor').awaitErorrHandlerFactory;


const getAll = async (ctx,next) => {

    const sql = `select 
                    id,
                    idcreador,
                    datetime(dia,'localtime') as dia,
                    duracion,
                    pistas,
                    jugadorestotal,
                    jugadoresapuntados
                from partido 
                order by datetime(dia) desc`;

    const partidos = await db.raw(sql);

    // const partidos = await db
    // .select(
    //     'date(dia) as dia'
    //     // 'posicion.descripcion as posicion',
    //     // 'perfil.descripcion as perfil',
    //     // 'jugador_estado.descripcion as estado',

    //     )
    // .from('partido')
    // // .innerJoin('posicion', 'jugador.idposicion', '=', 'posicion.id')     
    // // .innerJoin('perfil', 'jugador.idperfil', '=', 'perfil.id') 
    // // .innerJoin('jugador_estado', 'jugador.idestado', '=', 'jugador_estado.id') 

    // // users.forEach(user => {
    // //     delete user.password;
    // //     delete user.passwordHas;
    // // })

    ctx.state['body'] ={data : partidos, error: false};    
}

const getById = async (ctx,next) => {

    const id=ctx.params.id;
    const partidos = await db.first(['*']).from('partido').where({id});    
    ctx.state['body'] ={data : partidos, error: false};

}

const addPartido = async (ctx,next) => {
    const NewPartido = ctx.request.body;
    delete NewPartido.id;
    NewPartido.jugadoresapuntados = 0;    
    NewPartido['id'] = await db('partido').insert(NewPartido);
    ctx.state['body'] ={data : NewPartido, error: false};
}

const updatePartido = async (ctx,next) => {
    try{
        const partido = ctx.request.body;
        sal = await db('partido').where('id',partido.id).update(partido);       
        ctx.state['body'] ={data : sal, error: false};

    }
    catch(err){
        ctx.throw(409, err.stack);
        
    }
}






exports.register = function(router){    
    router.get('/partidos', awaitErorrHandlerFactory(getAll));
    router.get('/partidos/:id', awaitErorrHandlerFactory(getById));
    router.post('/partidos', bodyParser(), awaitErorrHandlerFactory(addPartido)); 
    router.put('/partidos', bodyParser(), awaitErorrHandlerFactory(updatePartido)); 

   
    
};