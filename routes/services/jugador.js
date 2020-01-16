const db = require('../../db');
const bodyParser = require('koa-bodyparser');
const bcrypt = require('./../../utilities/bcrypt');
const myConstants= require('./../../utilities/myConstants');
const SendEmail = require('./../../utilities/email');
const uuidv4 = require('uuid/v4');

const awaitErorrHandlerFactory=require('../interceptor').awaitErorrHandlerFactory;

const getAll = async (ctx,next) => {

    const users = await db
    .select(
        'jugador.*',
        'posicion.descripcion as posicion',
        'perfil.descripcion as perfil',
        'jugador_estado.descripcion as estado',

        )
    .from('jugador')
    .innerJoin('posicion', 'jugador.idposicion', '=', 'posicion.id')     
    .innerJoin('perfil', 'jugador.idperfil', '=', 'perfil.id') 
    .innerJoin('jugador_estado', 'jugador.idestado', '=', 'jugador_estado.id') 

    users.forEach(user => {
        delete user.password;
        delete user.passwordHas;
    })

    ctx.state['body'] ={data : users, error: false};    
}

const getById = async (ctx,next) => {

    const id=ctx.params.id;
    const user = await db.first(['id','alias','nombre','email','idposicion']).from('jugador').where({id});    
    ctx.state['body'] ={data : user, error: false};

}




const addJugador = async (ctx,next) => {
    const Newuser = ctx.request.body;
    delete Newuser.id;

    Newuser.passwordhash = await  bcrypt.hash('123456');
    Newuser.idestado = 2;  //debe cambiar la password
    
    Newuser['id'] = await db('jugador').insert(Newuser);

    ctx.state['body'] ={data : Newuser, error: false};


}

const registerJugador =async (ctx,next) => {
    const Newuser = ctx.request.body;
    Newuser.idestado = 1; //debe confirmar email
    Newuser.idperfil = 2; //jugador
    Newuser.passwordhash = await  bcrypt.hash(Newuser.password);
    delete Newuser.id;
    delete Newuser.password;
    delete Newuser.confirm_password;
    Newuser['id'] = await db('jugador').insert(Newuser);
    // passwordhash    
    ctx.state['body'] ={data : Newuser, error: false};
    

};

const updateJugador = async (ctx,next) => {
    try{
        const user = ctx.request.body;
        sal = await db('jugador').where('id',user.id).update(user);       
        ctx.state['body'] ={data : sal, error: false};

    }
    catch(err){
        ctx.throw(409, err.stack);
        
    }
}



const deleteJugador = async (ctx,next) => {
    const id=ctx.params.id;
    const sal = await db('jugador').where('id',id).del();   
    ctx.state['body'] ={data : sal, error: false};

}




const cambiarPasswordForget = async (ctx,next) => {

    const form = ctx.request.body;    
    
    

    const confirm_jugador = await db.first(['iduser'])  
    .from('jugador_confirmar')      
    .where({ uuid :form.uuid });

    if(!confirm_jugador){
        ctx.throw(401, 'No ha pedido el código de confirmación o código incorrecto');
    }

    const passwordhash = await  bcrypt.hash(form.password);

    const iduser = confirm_jugador.iduser;

    const sal = await db.transaction(async function (trx) {

        try {
            const sal1 = await trx('jugador_confirmar').where({iduser}).del();            
            const sal2 = await trx('jugador').where({id: iduser}).update({passwordhash});  


        } catch (err) {
            await  ctx.throw(401, err.message);
        }
    })


    ctx.state['body'] ={data : false, error: false};  



    

     

}

const cambiarPassword = async (ctx,next) => {

    const UpdateuserPass = ctx.request.body;    
    const passwordhash = await  bcrypt.hash(UpdateuserPass.password);
    const idUser =  ctx.state['idUser'];
    const idestado = 4;


    sal = await db('jugador').where('id',idUser).update({passwordhash,idestado});   

    ctx.state['body'] ={data : sal, error: false};    

}


const SaveCodigoConfirmacion = async (ctx,iduser, email) => {

    const uuid = uuidv4();

    const sal = await db.transaction(async function (trx) {
        try {

            await db('jugador_confirmar').where({iduser}).del();   
            await db('jugador_confirmar').insert({iduser, uuid});

            SendEmail(email,"Solicitud de confirmación de correo sunday praga ✔",
            'text/plain','Hola, este es tu código de confirmación: ' + uuid );

        } catch (err) {
            await  ctx.throw(401, err.message);
        }
    });



    ctx.state['body'] ={data : true, error: false};    

}


const pedirCodigoForgetPass = async (ctx,next) => {

    const user = ctx.request.body;  

    const userInDB = await db.first(['id'])  
    .from('jugador')      
    .where({ email: user.email });

    if(!userInDB){
        ctx.throw(401, 'no existe el email proporcionado (' + user.email + ')');
    }


    await SaveCodigoConfirmacion(ctx,userInDB.id, user.email);

}

const pedirCodigoEmail = async (ctx,next) => {

    
    const idUser =  ctx.state['idUser'];

    const user = await db.first(['email'])  
    .from('jugador')      
    .where({ id: idUser });

    await SaveCodigoConfirmacion(ctx,idUser, user.email);

}



const confirmarEmail = async (ctx,next) => {


    const form = ctx.request.body;    
    
    const iduser =  ctx.state['idUser'];

    const user = await db.first(['uuid'])  
    .from('jugador_confirmar')      
    .where({ iduser });

    if(!user){
        ctx.throw(401, 'No ha pedido el código de confirmación');
    }




    if(user.uuid === form.codConfirmEmail){
        
        const idestado = 4;

        db.transaction(async function (trx) {

            try {


                const sal1 = await trx('jugador_confirmar').where({iduser}).del();
                const sal2  = await trx('jugador').where('id',idUser).update({idestado}); 

    
            } catch (err) {
                await  ctx.throw(401, err.message);
            }
        })


        
        ctx.state['body'] ={data : true, error: false}; 

    } else{
        ctx.throw(401, 'Código de confirmación incorrecto');
    }

  

    

    

}





exports.register = function(router){    
    router.get('/jugadores', awaitErorrHandlerFactory(getAll));
    router.get('/jugadores/:id', awaitErorrHandlerFactory(getById));
    router.post('/jugadores', bodyParser(), awaitErorrHandlerFactory(addJugador));    
    router.put('/jugadores', bodyParser(), awaitErorrHandlerFactory(updateJugador));    
    router.delete('/jugadores/:id', bodyParser(), awaitErorrHandlerFactory(deleteJugador));
    router.post('/registro', bodyParser(), awaitErorrHandlerFactory(registerJugador));
    router.post('/cambiarPassword', bodyParser(), awaitErorrHandlerFactory(cambiarPassword));
    router.post('/cambiarPasswordForget', bodyParser(), cambiarPasswordForget);
    router.get('/pedirCodigoEmail', bodyParser(), awaitErorrHandlerFactory(pedirCodigoEmail));
    router.post('/pedirCodigoForgetPass', bodyParser(), pedirCodigoForgetPass);
    router.post('/confirmarEmail', bodyParser(), awaitErorrHandlerFactory(confirmarEmail));
    
};
