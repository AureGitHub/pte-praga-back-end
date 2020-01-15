const db = require('../../db');
const bodyParser = require('koa-bodyparser');
const myConstants= require('./../../utilities/myConstants');
const transporter = require('./../../utilities/email');
const addSubtractDate = require("add-subtract-date");


const awaitErorrHandlerFactory=require('../interceptor').awaitErorrHandlerFactory;


const getAll = async (ctx,next) => {


    var idUser =  ctx.state['idUser'];


    if(!idUser) {
        idUser = -1;
    }

    const sql = `select 
    p.id,
    p.idcreador,
    to_char("dia", 'DD/MM/YYYY HH24:MI') as dia,    
    p.duracion,
    p.pistas,
    p.jugadorestotal,
    p.jugadoresapuntados,
    pj.id as idpartidoxjugador
    from partido p
    left join partidoxjugador pj on p.id = pj.idpartido and pj.idjugador = ?
    order by dia desc`;

    const partidos = await db.raw(sql,idUser);
    ctx.state['body'] ={data : partidos.rows, error: false};    
}

const getById = async (ctx,next) => {

     const id=ctx.params.id;
    // const partidos = await db.first(['*']).from('partido').where({id});    
    // ctx.state['body'] ={data : partidos, error: false};


    const sql = `select 
    p.id,
    p.idcreador,
    to_char("dia", 'DD/MM/YYYY HH24:MI') as dia,    
    p.duracion,
    p.pistas,
    p.jugadorestotal,
    p.jugadoresapuntados   
    from partido p
    where id=?`;

    const partidos = await db.raw(sql,id);
    ctx.state['body'] ={data :partidos.rows.length === 0 ? {} : partidos.rows[0], error: false};    


}

const addPartido = async (ctx,next) => {
    const NewPartido = ctx.request.body;

    NewPartido.jugadorestotal = parseInt(NewPartido.pistas) * 4;
    delete NewPartido.id;
    NewPartido.jugadoresapuntados = 0;    
    NewPartido['id'] = await db('partido').insert(NewPartido);
    ctx.state['body'] ={data : NewPartido, error: false};
}

const updatePartido = async (ctx,next) => {
    try{
        
        const partido = ctx.request.body;  
        partido.jugadorestotal = parseInt(partido.pistas) * 4;
        sal = await db('partido').where('id',partido.id).update(partido);       
        ctx.state['body'] ={data : sal, error: false};

    }
    catch(err){
        ctx.throw(409, err.stack);
        
    }
}



const prueba = async (ctx,next) => {
    const sal = await db('prueba').insert({id: 1, valor: 'pepe'});
    ctx.state['body'] ={data : sal, error: false}; 
}


exports.register = function(router){    
    router.get('/prueba', prueba);
    router.get('/partidos', awaitErorrHandlerFactory(getAll));
    router.get('/partidos/:id', awaitErorrHandlerFactory(getById));
    router.post('/partidos', bodyParser(), awaitErorrHandlerFactory(addPartido)); 
    router.put('/partidos', bodyParser(),  awaitErorrHandlerFactory(updatePartido)); 

   
    
};