const db = require('../../db');
const bodyParser = require('koa-bodyparser');
const awaitErorrHandlerFactory=require('../interceptor').awaitErorrHandlerFactory;



// en v1
const getpartidoxpistaxrankingByIdpartido = async (ctx,next) => {    

    const idpartido= parseInt(ctx.params.id);
    const sql = `
    select drive.alias drive, reves.alias reves, sum(gana) ganados, sum(juegos) juegos
    from partidoxpistaxranking ppr
    inner join jugador drive on ppr.iddrive = drive.id
    inner join jugador reves on ppr.idreves = reves.id
    where ppr.idpartido = ?
    group by drive, reves
    order by ganados desc, juegos desc`;
    const getBD = await db.raw(sql,idpartido);

    ctx.state['body'] ={data : getBD.rows, error: false};  

}

// en v1
const getpartidoxpistaByIdpartido = async (ctx,next) => {    
    const idpartido= parseInt(ctx.params.id);
    const sql = `select 
    pxpi.id,
    pxpi.nombre,
    coalesce(jd1.alias,'jd1') jd1,
    coalesce(jr1.alias,'jr1') jr1,
    coalesce(jd2.alias,'jd2') jd2,
    coalesce(jr2.alias,'jr2') jr2,
    pxpi.idpista,
    pxpi.idturno
    from partidoxpista pxpi
	left join  partidoxpareja pxpa1 on pxpi.idpartidoxpareja1 = pxpa1.id
	left join  partidoxpareja pxpa2 on pxpi.idpartidoxpareja2 = pxpa2.id
	
    left join jugador jd1 on pxpa1.iddrive= jd1.id
	left join jugador jr1 on pxpa1.idreves= jr1.id
	
	left join jugador jd2 on pxpa2.iddrive= jd2.id
	left join jugador jr2 on pxpa2.idreves= jr2.id
	
    
    where pxpi.idpartido=?
    order by idturno,idpista`;
    const getBD = await db.raw(sql,idpartido);

    let partidoxpista = getBD.rows;

    //todos los marcadores de todos los partidos del partido
    marcadores = await db
    .select('id','idpartidoxpista','idset','juegospareja1','juegospareja2')
    .from('partidoxpistaxmarcador').where({idpartido}).orderBy('idpartidoxpista', 'idset');
    
   

    partidoxpista.forEach(element => {
        let susMarcadores = marcadores.filter(a=> a.idpartidoxpista === element.id);

        susMarcadores.forEach(marcador => {            
            element[`set${marcador.idset}`] = marcador;
        });


        // element['marcador'] = marcadores.filter(a=> a.idpartidoxpista === element.id);
    });


    ctx.state['body'] ={data : partidoxpista, error: false};   

}

// en v1
const getAll = async (ctx,next) => {


    var idUser =  ctx.state['idUser'];


    if(!idUser) {
        idUser = -1;
    }

    const sql = `select 
    p.id,
    p.idcreador,
    p.idpartido_estado,
    to_char("dia", 'DD/MM/YYYY HH24:MI') as dia,    
    p.duracion,
    p.pistas,
    p.jugadorestotal,
    p.jugadoresapuntados,
    pj.id as idpartidoxjugador
    from partido p
    left join partidoxjugador pj on p.id = pj.idpartido and pj.idjugador = ?
    order by p.id desc`;

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
    p.idpartido_estado,
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

const addpartidosxpistaxmarcador= async (ctx,next) => {

    const item = ctx.request.body;

    if(item.id){
        //update
        await db('partidoxpistaxmarcador').where('id',item.id).update({juegospareja1:item.juegospareja1,juegospareja2:item.juegospareja2 }); 
    } else{        
        delete item.id;
         const getBD= await db('partidoxpistaxmarcador').insert(item).returning('id');    
         item['id'] = getBD[0];
        
    }

    ctx.state['body'] ={data : item, error: false};


    
}


const addPartido = async (ctx,next) => {
    const NewPartido = ctx.request.body;

    NewPartido.jugadorestotal = parseInt(NewPartido.pistas) * 4;
    delete NewPartido.id;
    NewPartido.jugadoresapuntados = 0;    
    NewPartido['idpartido_estado'] = 1;
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

        /*
            Crear las pistas de los partidos:
                Si solo hay una pista => se crea una sola pista
                Si hay varias pistas
                    3 partidos * pista (de 35 min cada uno)
        */
        
        const partido = ctx.request.body;  

        const idpartido = partido.id;

        const old_partido = await db('partido').first('pistas').where({id: idpartido});
        
        partido.jugadorestotal = parseInt(partido.pistas) * 4;        

        let subpartido = 'pista';

        let nombre = subpartido + '1';
        let idpista = 1;
        let idturno = 1;

        const sal = await db.transaction(async function (trx) {
            try {   
                await trx('partidoxpistaxmarcador').where({idpartido}).del();                 
                await trx('partidoxpista').where({idpartido}).del();                 
                await trx('partidoxpareja').where({idpartido}).del();   

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
                            await trx('partidoxjugador').where({id : suplentes.rows[index].id })
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
                            await trx('partidoxjugador').where({id : aceptados.rows[index].id })
                            .update('idpartidoxjugador_estado',2); 
                        }
                    }
                }
                await trx('partido').where('id',partido.id).update(partido); 

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


const remove = async (ctx,next) => {

    const idpartido=ctx.params.id;

    const sal = await db.transaction(async function (trx) {
        try {
            
            await trx('partidoxpistaxmarcador').where({idpartido}).del();                 
            await trx('partidoxpista').where({idpartido}).del();                 
            await trx('partidoxpareja').where({idpartido}).del(); 
            await trx('partidoxjugador').where({idpartido}).del(); 
            await trx('partido').where('id',idpartido).del();   
           

        } catch (err) {
            await  ctx.throw(401, err.message);
        }
    });
    ctx.state['body'] ={data : sal, error: false};

}


const cierra = async (ctx,next) => {
    const id=ctx.params.id;
    const sal = await db('partido').where({id}).update('idpartido_estado', 2); 
    ctx.state['body'] ={data : sal, error: false};
}

const finaliza = async (ctx,next) => {
    const id=ctx.params.id;

    const sal = await db.transaction(async function (trx) {
        try {
            
            await trx('partido').where({id}).update('idpartido_estado', 3);  

            const sql = `
            insert into partidoxpistaxranking (idpartido,idpartidoxpista,iddrive,idreves,juegos,gana)
            select * from
            (
            select 
            par.id idpartido,
            pp.id idpartidoxpista,
            drive1.id drive,
            reves1.id reves,
            ppm.juegospareja1 juegos,	 
            (CASE WHEN ppm.juegospareja1 > ppm.juegospareja2 THEN 1  ELSE  0 END) AS Gana
            from partidoxpistaxmarcador ppm
            inner join partido par on ppm.idpartido = par.id
            inner join partidoxpista pp on ppm.idpartidoxpista = pp.id
            inner join partidoxpareja ppa1 on pp.idpartidoxpareja1 = ppa1.id
            inner join partidoxpareja ppa2 on pp.idpartidoxpareja2 = ppa2.id
            inner join jugador drive1 on ppa1.iddrive = drive1.id
            inner join jugador reves1 on ppa1.idreves = reves1.id
            inner join jugador drive2 on ppa2.iddrive = drive2.id
            inner join jugador reves2 on ppa2.idreves = reves2.id
            where ppm.idpartido = 5

            union
            select 
            par.id idpartido,
            pp.id idpartidoxpista,
            drive2.id drive,
            reves2.id reves,
            ppm.juegospareja2 juegos,
                
            (CASE WHEN ppm.juegospareja2 > ppm.juegospareja1 THEN 1  ELSE  0 END) AS Gana
            from partidoxpistaxmarcador ppm
            inner join partido par on ppm.idpartido = par.id
            inner join partidoxpista pp on ppm.idpartidoxpista = pp.id
            inner join partidoxpareja ppa1 on pp.idpartidoxpareja1 = ppa1.id
            inner join partidoxpareja ppa2 on pp.idpartidoxpareja2 = ppa2.id
            inner join jugador drive1 on ppa1.iddrive = drive1.id
            inner join jugador reves1 on ppa1.idreves = reves1.id
            inner join jugador drive2 on ppa2.iddrive = drive2.id
            inner join jugador reves2 on ppa2.idreves = reves2.id
            where ppm.idpartido = ?
            )T
            `;
        
            await trx.raw(sql,id);   

        } catch (err) {
            await  ctx.throw(401, err.message);
        }
    });
    
    ctx.state['body'] ={data : sal, error: false};
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
    router.get('/partidosxpista/:id', awaitErorrHandlerFactory(getpartidoxpistaByIdpartido));

    router.get('/partidoxpistaxranking/:id', awaitErorrHandlerFactory(getpartidoxpistaxrankingByIdpartido));

    router.get('/partidos', awaitErorrHandlerFactory(getAll));
    router.get('/partidos/:id', awaitErorrHandlerFactory(getById));
    router.post('/partidos', bodyParser(), awaitErorrHandlerFactory(addPartido)); 
    router.put('/partidos', bodyParser(),  awaitErorrHandlerFactory(updatePartido)); 
    router.delete('/partidos/:id', bodyParser(), awaitErorrHandlerFactory(remove));
    router.post('/partidosxpistaxmarcador', bodyParser(), awaitErorrHandlerFactory(addpartidosxpistaxmarcador)); 

    router.get('/partidos_cierre/:id', awaitErorrHandlerFactory(cierra));
    router.get('/partidos_finaliza/:id', awaitErorrHandlerFactory(finaliza));


   
    
};