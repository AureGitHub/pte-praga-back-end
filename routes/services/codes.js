parse = require('co-body');
var sqlite3 = require('sqlite3').verbose();
const db = require('../../db');


const selecciones={label:'seleccione...'};

const getPerfil = async (ctx,next) => {

    const perfiles = await db
    .select(        
        'perfil.id as value',
        'perfil.descripcion as label'
        )
    .from('perfil');    

    perfiles.unshift(selecciones);

    ctx.state['body'] ={data : perfiles, error: false}; 
    
}

const getPosicion = async (ctx,next) => {

    const posiciones = await db
    .select(        
        'posicion.id as value',
        'posicion.descripcion as label'
        )
    .from('posicion');    
    posiciones.unshift(selecciones);    
    ctx.state['body'] ={data : posiciones, error: false}; 
    
}

const getEstadoJugdor = async (ctx,next) => {

    const estados = await db
    .select(        
        'jugador_estado.id as value',
        'jugador_estado.descripcion as label'
        )
    .from('jugador_estado');    

    estados.unshift(selecciones);
    ctx.state['body'] ={data : estados, error: false}; 

    
}




exports.register = function(router){
    router.get('/posicion', getPosicion);
    router.get('/perfil', getPerfil);
    router.get('/estadoJugador', getEstadoJugdor);
    

};
