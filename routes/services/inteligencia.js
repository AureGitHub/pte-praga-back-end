
const db = require('../../db');
const bodyParser = require('koa-bodyparser');


function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }


const hacerparejasByIdpartido = async (ctx,next) => {    
    
    const idpartido= parseInt(ctx.params.id);
    
    const sql = `select 
    j.id idjugador,
    j.idposicion 
    from partidoxjugador pj
    inner join jugador j on pj.idjugador = j.id
    where 
    idpartido = ? and
    idpartidoxjugador_estado=1`;

    let getBD = await db.raw(sql,idpartido);

    let jugadoresDrive = getBD.rows.filter(a=> a.idposicion === 1);
    let jugadoresReves = getBD.rows.filter(a=> a.idposicion === 2);

    getBD = await db('partido').first('jugadorestotal','pistas').where({id: idpartido});

    const Totalparejas = parseInt(getBD.jugadorestotal) / 2;
    const pistas = getBD.pistas;

    let lstparejas = [];
    let partidoxpista = [];


    for (let index = 1; index <= Totalparejas; index++) {
        // cada iteración hago una pareja
        let numero = index;
        
        
        
        // Busco un DRIVE
        let iddrive = null;

        if(jugadoresDrive.length > 0){

            iddrive = jugadoresDrive[getRndInteger(0, jugadoresDrive.length-1)].idjugador;
            //lo borro de la lista
            jugadoresDrive = jugadoresDrive.filter(a=> a.idjugador!=iddrive);            
        }
        else{
            // si no hay drive disponibles, lo busco en la lista de reves
            if(jugadoresReves.length > 0){
                iddrive = jugadoresReves[getRndInteger(0, jugadoresReves.length-1)].idjugador;
                //lo borro de la lista
                jugadoresReves = jugadoresReves.filter(a=> a.idjugador!=iddrive);            

            }
        }

        

        // Busco un REVES
        let idreves = null;

        if(jugadoresReves.length > 0){

            idreves = jugadoresReves[getRndInteger(0, jugadoresReves.length-1)].idjugador;
            //lo borro de la lista
            jugadoresReves = jugadoresReves.filter(a=> a.idjugador!=idreves);            
        }
        else{
            // si no hay drive disponibles, lo busco en la lista de reves
            if(jugadoresDrive.length > 0){
                idreves = jugadoresDrive[getRndInteger(0, jugadoresDrive.length-1)].idjugador;
                //lo borro de la lista
                jugadoresDrive = jugadoresDrive.filter(a=> a.idjugador!=idreves);            

            }
        }

        if(iddrive || idreves){
            lstparejas.push({idpartido,numero,iddrive,idreves});
        }
    }
    
    //distribuyo las parejas en las pistas

    if(pistas === 1){
        //solo hay una pista... y dos parejas



    }



    let idpista = null;
    let idturno = null;

    let subpartido = 'pista';

    let nombre = subpartido + '1';

    let idpartidoxpareja1 = null;
    let idpartidoxpareja2 = null;

    

    const sal = await db.transaction(async function (trx) {           

        if(lstparejas && lstparejas.length > 0){
            
            //hago las parejas
            // borro antes de procesar
            await trx('partidoxpista').where({idpartido}).del(); 
            await trx('partidoxpareja').where({idpartido}).del(); 

            for (let index = 0; index < lstparejas.length; index++) {                
                let idpareja = await trx('partidoxpareja').insert(lstparejas[index]).returning('id');
                lstparejas[index]['idpareja'] = idpareja[0];
            }    
            
        }

        //Hago la pistas y le asignno las parejas (si hay parejas)


        if(pistas === 1){
            //solo habrá 1
            idpista = 1;
            idturno = 1;
            idpartidoxpareja1 = lstparejas[0] ? lstparejas[0].idpareja : null;
            idpartidoxpareja2 = lstparejas[1] ? lstparejas[1].idpareja : null;

            await trx('partidoxpista').insert({idpartido,idpista,idturno,nombre,idpartidoxpareja1,idpartidoxpareja2});

            
        } else {

            let parejas_i = [];
            
            let total = 6; //lstparejas.length;

            for (var i = 1; i <= total; i++) {                
                parejas_i.push(i);

            };

            let pos = 0;
            let pairs=[];

            for (var i = 0; i < parejas_i.length; i++) {

                for (var j = i; j < parejas_i.length; j++) {        
                    if(parejas_i[i] != parejas_i[j]){
                        if(pairs.length < (6 / 2)*3){
                            pairs.push({x: parejas_i[i], y: parejas_i[j]});        
                        }
                        
                    }
                    
                }
        
            }

/*
            1  Num Pareja  (se borran)
            1  Num Pareja -1  (se borran)
*/

            for (let index = 0; index < pistas; index++) {
                //por cada pista, 3 partidos

                idpista = index + 1;

                idturno = 1;

                nombre = subpartido + (index + 1)  +  '_' + idturno;
                await trx('partidoxpista').insert({idpartido,idpista,idturno,nombre});

                idturno++;

                nombre = subpartido + (index + 1)  +  '_' + idturno;
                await trx('partidoxpista').insert({idpartido,idpista,idturno,nombre});

                idturno++;

                nombre = subpartido + (index + 1)  +  '_' + idturno;
                await trx('partidoxpista').insert({idpartido,idpista,idturno,nombre});
             }
        }
        

        
            

    });

        

    



    ctx.state['body'] ={data : lstparejas, error: false};   

}


const awaitErorrHandlerFactory=require('../interceptor').awaitErorrHandlerFactory;

exports.register = function(router){        
    router.get('/hacerparejas/:id', awaitErorrHandlerFactory(hacerparejasByIdpartido));
    

   
    
};