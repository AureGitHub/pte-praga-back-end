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



const Jugadores = async () => {

    const sql = `select 
    j.id,
    j.alias,
    j.idposicion 
    from  jugador  j   
    order by j.alias`;
    const items = await db.raw(sql);     
    return items.rows;

}

const JugadoresEnPartido = async (idpartido) => {

    const sql = `select 
    j.id,
    j.alias || ' => ' ||  to_char("created_at", 'DD/MM/YYYY HH24:MI:SS') as alias,
    j.idposicion 
    from partidoxjugador pj
    inner join jugador j on pj.idjugador = j.id    
    where idpartido=?
    order by pj.created_at`;
    const items = await db.raw(sql,idpartido);     
    return items.rows;

}

const getByIdPardido = async (ctx,next) => {

    const idUser =  ctx.state['idUser'];
    const idpartido=ctx.params.id;    

    const jugadores  = await JugadoresEnPartido(idpartido);
    
    ctx.state['body'] ={data : jugadores, error: false}; 
}

const getByAddNewIdPardido = async (ctx,next) => {
    //devuelve jugadores para añadria a un partido
    // Jugadores - Apuntados
    const idpartido=ctx.params.id; 
    const jugadoresApuntados  = await JugadoresEnPartido(idpartido);
    const todosJugadores = await Jugadores();

    const jugadoresParaAdd = todosJugadores.filter(a=> !jugadoresApuntados.find(b => b.alias === a.alias));
    ctx.state['body'] ={data : jugadoresParaAdd, error: false}; 

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

    // const jugadoresEnPartido = await db
    // .first('jugadoresapuntados' ,'jugadorestotal')
    // .from('partido')
    // .where({id :item.idpartido }); 

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

const addArray = async (ctx,next) => {  

    const item = ctx.request.body;  

     const idpartido = item.idpartido;
     const JugadoresAdd =item.JugadoresAdd;

    const sal = await db.transaction(async function (trx) {
        try {


            for (let index = 0; index < JugadoresAdd.length; index++) {
                const idjugador = JugadoresAdd[index].id;
                await trx('partidoxjugador').insert({idpartido,idjugador});
              }
            // JugadoresAdd.forEach(e => {
            //     const idjugador = e.id;
            //     var sal1 = await trx('partidoxjugador').insert({idpartido,idjugador});
            // });            
             const sal2 = await trx('partido').where({id: item.idpartido}).increment('jugadoresapuntados',JugadoresAdd.length);


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
    router.get('/partidoxjugadorAddByIdPartido/:id', awaitErorrHandlerFactory(getByAddNewIdPardido));
    router.get('/partidoxjugadorByIdJugador/:id', awaitErorrHandlerFactory(getByIdJugador));
    router.post('/partidoxjugador', bodyParser(), awaitErorrHandlerFactory(add)); 
    router.delete('/partidoxjugador', bodyParser(),  awaitErorrHandlerFactory(remove)); 

    router.post('/partidoxjugadorAddArray', bodyParser(), awaitErorrHandlerFactory(addArray)); 


    


   
    
};