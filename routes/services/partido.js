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

        /*         
        tengo que detectar si cambia el número de pistas..
        Si aumenta => si hay suplentes, añadir los que se puedan
        Si disminuye => Pasar a suplente los apuntados que no entren

        Para hacer esto voy a tener que utilizar funciones de Jugador.
        Tendré que sacarlo a alguna capa intermedia
        */
        
        const partido = ctx.request.body;  

        const old_partido = await db('partido').first('pistas').where('id',partido.id);
        
        partido.jugadorestotal = parseInt(partido.pistas) * 4;

        const sal = await db.transaction(async function (trx) {
            try {  

                if(parseInt(old_partido.pistas) < parseInt(partido.pistas)){
                    //pasar suplentes a Aceptados
                    const cuantosSuplentesAscientes = (parseInt(partido.pistas) - parseInt(old_partido.pistas)) * 4;

                    //order ascendente. FIFO
                    const sql = `select 
                    pj.id                        
                    from partidoxjugador pj                    
                    where idpartido=? and idpartidoxjugador_estado=2
                    order by pj.created_at`;
                    const suplentes = await db.raw(sql,partido.id); 

                    const LosQuePuedoPasar = (cuantosSuplentesAscientes > suplentes.rows.length) ?  suplentes.rows.length : cuantosSuplentesAscientes;

                    for (let index = 0; index < LosQuePuedoPasar; index++){
                        if(suplentes.rows[index]){
                            await db('partidoxjugador').where({id : suplentes.rows[index].id })
                            .update('idpartidoxjugador_estado',1); 
                        } 
                    }
                } else  if(parseInt(old_partido.pistas) > parseInt(partido.pistas)){
                    //pasar Aceptados a suplentes                    
                    //order descendente. LIFO
                    
                    const sql = `select 
                    pj.id                        
                    from partidoxjugador pj                    
                    where idpartido=? and idpartidoxjugador_estado=1
                    order by pj.created_at desc`;
                    const aceptados = await db.raw(sql,partido.id); 

                    // los que hay apuntados menos los huecos que tengo
                    const cuantosAceptadosDescienden = aceptados.rows.length - (parseInt(partido.pistas) * 4);


                    for (let index = 0; index < cuantosAceptadosDescienden; index++){
                        if(aceptados.rows[index]){
                            await db('partidoxjugador').where({id : aceptados.rows[index].id })
                            .update('idpartidoxjugador_estado',2); 
                        }
                    }
                }
                await db('partido').where('id',partido.id).update(partido); 

            } catch (err) {
                await  ctx.throw(401, err.message);
            }
        });

        
              
        ctx.state['body'] ={data : sal, error: false};

    }
    catch(err){
        ctx.throw(409, err.stack);
        
    }
}



const prueba = async (ctx,next) => {

var helper = require('sendgrid').mail;
var from_email = new helper.Email('test@example.com');
var to_email = new helper.Email('auredecocccam@gmail.com');
var subject = 'Hello World from the SendGrid Node.js Library!';
var content = new helper.Content('text/plain', 'Hello, Email!');
var mail = new helper.Mail(from_email, subject, to_email, content);

require('dotenv').config();

var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON(),
});

sg.API(request, function(error, response) {
  console.log(response.statusCode);
  console.log(response.body);
  console.log(response.headers);
});
    ctx.state['body'] ={data : sal, error: false}; 
}


exports.register = function(router){    
    router.get('/prueba', prueba);
    router.get('/partidos', awaitErorrHandlerFactory(getAll));
    router.get('/partidos/:id', awaitErorrHandlerFactory(getById));
    router.post('/partidos', bodyParser(), awaitErorrHandlerFactory(addPartido)); 
    router.put('/partidos', bodyParser(),  awaitErorrHandlerFactory(updatePartido)); 

   
    
};