var sqlite3 = require('sqlite3').verbose();
const db = require('../../db');
const bodyParser = require('koa-bodyparser');
const bcrypt = require('./../../utilities/bcrypt');
const myConstants= require('./../../utilities/myConstants');
const transporter = require('./../../utilities/email');

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

const sendMail = async (ctx,next) => {

    let info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "aure.desande@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>" // html body
      }
    
    );

    ctx.state['body'] ={data : info.messageId, error: false};    

}

const cambiarPassword = async (ctx,next) => {

    const UpdateuserPass = ctx.request.body;    
    const passwordHash = await  bcrypt.hash(UpdateuserPass.password);
    const idUser =  ctx.state['idUser'];
    const idestado = 4;


    sal = await db('jugador').where('id',idUser).update({passwordHash,idestado});   

    ctx.state['body'] ={data : sal, error: false};    

}





exports.register = function(router){
    router.get('/sendMail', awaitErorrHandlerFactory(sendMail));
    router.get('/jugadores', awaitErorrHandlerFactory(getAll));
    router.post('/jugadores', bodyParser(), awaitErorrHandlerFactory(addJugador));
    router.post('/registro', bodyParser(), awaitErorrHandlerFactory(registerJugador));
    router.put('/jugadores', bodyParser(), awaitErorrHandlerFactory(updateJugador));
    router.delete('/jugadores/:id', bodyParser(), awaitErorrHandlerFactory(deleteJugador));
    router.post('/cambiarPassword', bodyParser(), awaitErorrHandlerFactory(cambiarPassword));
};
