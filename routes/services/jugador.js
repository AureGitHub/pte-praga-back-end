const db = require('../../db');
const bodyParser = require('koa-bodyparser');
const bcrypt = require('./../../utilities/bcrypt');
const myConstants= require('./../../utilities/myConstants');
const transporter = require('./../../utilities/email');
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

    Newuser.passwordHash = await  bcrypt.hash('123456');
    Newuser.idestado = 2;  //debe cambiar la password
    
    Newuser['id'] = await db('jugador').insert(Newuser);

    ctx.state['body'] ={data : Newuser, error: false};


}

const registerJugador =async (ctx,next) => {
    const Newuser = ctx.request.body;
    Newuser.idestado = 1; //debe confirmar email
    Newuser.idperfil = 2; //jugador
    Newuser.passwordHash = await  bcrypt.hash(Newuser.password);
    delete Newuser.id;
    delete Newuser.password;
    delete Newuser.confirm_password;
    Newuser['id'] = await db('jugador').insert(Newuser);
    // passwordHash    
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



const cambiarPassword = async (ctx,next) => {

    const UpdateuserPass = ctx.request.body;    
    const passwordHash = await  bcrypt.hash(UpdateuserPass.password);
    const idUser =  ctx.state['idUser'];
    const idestado = 4;


    sal = await db('jugador').where('id',idUser).update({passwordHash,idestado});   

    ctx.state['body'] ={data : sal, error: false};    

}

const pedirCodigoEmail = async (ctx,next) => {

    
    const idUser =  ctx.state['idUser'];

    const user = await db.first(['email'])  
    .from('jugador')      
    .where({ id: idUser });

    const uuid = uuidv4();

    // let info = await transporter.sendMail({
    //     from: '"sunday praga sunday 👻" <sunday.praga@padel.com>', // sender address
    //     to: user.email, // list of receivers
    //     subject: "Solicitud de confirmación de correo sunday praga ✔", // Subject line
    //     text: 'Hola, este es el código para confirmar tu email: ' + uuid, // plain text body
    //     html: 'Hola, este es el código para confirmar tu email: <b>' + uuid + '</b>' // html body
    //   }
    
    // );
       

    const sal = await db('jugador_conf_email').where('idUser',idUser).del();   
    const user_uuid = await db('jugador_conf_email').insert({idUser, uuid});

    ctx.state['body'] ={data : sal, error: false};    

}



const confirmarEmail = async (ctx,next) => {


    const form = ctx.request.body;    
    
    const idUser =  ctx.state['idUser'];

    const user = await db.first(['uuid'])  
    .from('jugador_conf_email')      
    .where({ idUser });

    if(!user){
        ctx.throw(401, 'No ha pedido el código de confirmación');
    }




    if(user.uuid === form.codConfirmEmail){
        
        const idestado = 4;

        db.transaction(async function (trx) {

            try {


                const sal1 = await trx('jugador_conf_email').where('idUser',idUser).del();
                const sal2  = await trx('jugador').where('id',idUser).update({idestado}); 

    
            } catch (err) {
                await  ctx.throw(401, err.message);
            }
        })


        
        ctx.state['body'] ={data : true, error: false}; 

    } else{
        ctx.state['body'] ={data : false, error: false};    
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
    router.get('/pedirCodigoEmail', bodyParser(), awaitErorrHandlerFactory(pedirCodigoEmail));
    router.post('/confirmarEmail', bodyParser(), awaitErorrHandlerFactory(confirmarEmail));
    
};
