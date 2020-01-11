const db = require('../../db');
const bodyParser = require('koa-bodyparser');
const myConstants= require('./../../utilities/myConstants');
const transporter = require('./../../utilities/email');
const addSubtractDate = require("add-subtract-date");


const awaitErorrHandlerFactory=require('../interceptor').awaitErorrHandlerFactory;


const getAll = async (ctx,next) => {

    const idUser =  ctx.state['idUser'];
    const items = await db
    .select('*')
    .from('partidoxjugador');

    ctx.state['body'] ={data : items, error: false};    
}

const getByIdPardido = async (ctx,next) => {

    const idUser =  ctx.state['idUser'];
    const idpartido=ctx.params.id;
    
    const sql = `select 
    j.alias,
    j.idposicion 
    from partidoxjugador pj
    inner join jugador j on pj.idjugador = j.id    
    where idpartido=?
    order by j.alias`;

    const items = await db.raw(sql,idpartido);
     
    ctx.state['body'] ={data : items, error: false}; 

}

const getByIdJugador  = async (ctx,next) => {

    const idUser =  ctx.state['idUser'];
    
    const id=ctx.params.id;
    const items = await db
    .select('*')
    .from('partidoxjugador')
    .where({idjugador :id });

    ctx.state['body'] ={data : items, error: false}; 

}

const add = async (ctx,next) => {   


    const item = ctx.request.body;  

    const jugadoresEnPartido = await db
    .first('jugadorestotal' ,'jugadorestotal')
    .from('partido')
    .where({id :item.idpartido });

    if(jugadoresEnPartido.jugadorestotal >= jugadoresEnPartido.jugadorestotal){
        ctx.throw(401, 'El partido está lleno');
    }



    const sal = await db.transaction(async function (trx) {
        try {
            const sal1 = await trx('partidoxjugador').insert(item);
            const sal2 = await trx('partido').where({id: item.idpartido}).increment('jugadoresapuntados',1);


        } catch (err) {
            await  ctx.throw(401, err.message);
        }
    });

    ctx.state['body'] ={data : sal, error: false};
}


const remove = async (ctx,next) => {
    const item = ctx.request.body;
    const idjugador = item.idjugador;
    const idpartido = item.idpartido;
    
    
    
    const sal = await db.transaction(async function (trx) {
        try {
            const sal1 = await trx('partidoxjugador').where({idjugador, idpartido}).del(); 
            const sal2 = await trx('partido').where({id: item.idpartido}).increment('jugadoresapuntados',-1);


        } catch (err) {
            await  ctx.throw(401, err.message);
        }
    });

    ctx.state['body'] ={data : sal, error: false};


}



exports.register = function(router){    
    router.get('/partidoxjugador', awaitErorrHandlerFactory(getAll));
    router.get('/partidoxjugadorByIdPartido/:id', awaitErorrHandlerFactory(getByIdPardido));
    router.get('/partidoxjugadorByIdJugador/:id', awaitErorrHandlerFactory(getByIdJugador));
    router.post('/partidoxjugador', bodyParser(), awaitErorrHandlerFactory(add)); 
    router.delete('/partidoxjugador', bodyParser(),  awaitErorrHandlerFactory(remove)); 

   
    
};