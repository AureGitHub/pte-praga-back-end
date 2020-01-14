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
    const partidos = await db.first(['*']).from('partido').where({id});    
    ctx.state['body'] ={data : partidos, error: false};

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

        // if(partido.dia.indexOf('Z')<0){
        //     const hora = partido.dia.split(' ')[1];
        //     const anno = partido.dia.split(' ')[0].split('/')[2];
        //     const mes = partido.dia.split(' ')[0].split('/')[1];
        //     const dia = partido.dia.split(' ')[0].split('/')[0];
    
        //     partido.dia =anno + '-' + mes + '-' + dia + ' ' + hora;
        //    // partido.dia = partido.dia.toString('yyyy-mm-dd HH:mm');
        // }
        // else{
        //     // Date.prototype.addHours = function(h) {
        //     //     this.setTime(this.getTime() + (h*60*60*1000));
        //     //     return this;
        //     //   }               
            
            
            
        //     partido.dia = new Date(partido.dia.toString());
        //     partido.dia = partido.dia.toLocaleString();

        //     ctx.throw(509, 'dia :' + partido.dia);

        //     var hora = partido.dia.split(' ')[1].split(':')[0];
        //     var min = partido.dia.split(' ')[1].split(':')[1];
        //     var anno = partido.dia.split(' ')[0].split('-')[0];
        //     var mes = partido.dia.split(' ')[0].split('-')[1];
        //     var dia = partido.dia.split(' ')[0].split('-')[2];

        //     hora = hora.padStart(2, "0"); 
        //     min = min.padStart(2, "0"); 

        //     mes = mes.padStart(2, "0"); 
        //     dia = dia.padStart(2, "0"); 

        //     partido.dia = anno + '-' + mes + '-' + dia + ' ' + hora + ':' + min;

            
        // }

       

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