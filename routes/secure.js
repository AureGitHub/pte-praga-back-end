exports.secure =[
   


    {
        _matchedRoute : '/jugadores',
        esPublico: false,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['PUT']}
        ]
    },

    {
        _matchedRoute : '/jugadores/:id',
        esPublico: false,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['GET']}
        ]
    },

    {
        _matchedRoute : '/partidoxjugadorAddArray',
        esPublico: false,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},            
        ]
    },


    

    {
        _matchedRoute : '/partidos',
        esPublico: true,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['A']}
        ]
    },

    {
        _matchedRoute : '/partidos/:id',
        esPublico: true,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['A']}
        ]
    },


    {
        _matchedRoute : '/partidoxjugador',
        esPublico: true,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['A']}
        ]
    },   

    {
        _matchedRoute : '/partidoxjugadorAddByIdPartido/:id',
        esPublico: true,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['A']}
        ]
    },


    {
        _matchedRoute : '/partidoxjugadorByIdPartido/:id',
        esPublico: true,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['A']}
        ]
    },


    

    {
        _matchedRoute : '/cambiarPassword',
        esPublico: false,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['A']}
        ]
    },
    {
        _matchedRoute : '/pedirCodigoEmail',
        esPublico: false,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['A']}
        ]
    },
    {
        _matchedRoute : '/confirmarEmail',
        esPublico: false,
        perfiles : [
            {idperfil : 1,  permisos : ['A']},
            {idperfil : 2,  permisos : ['A']}
        ]
    },

    
] ;

