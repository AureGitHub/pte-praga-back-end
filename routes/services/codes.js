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

    ctx.body = JSON.stringify(perfiles);
    
}

const getPosicion = async (ctx,next) => {

    const posiciones = await db
    .select(        
        'posicion.id as value',
        'posicion.descripcion as label'
        )
    .from('posicion');    

    posiciones.unshift(selecciones);

    ctx.body = JSON.stringify(posiciones);
    
}




exports.register = function(router){
    router.get('/posicion', getPosicion);
    router.get('/perfil', getPerfil);

};
