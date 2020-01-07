exports.secure =[
    {
        _matchedRoute : '/sendMail',
        perfiles : [
            {perfil : 1,  permisos : ['A']},
            {perfil : 2,  permisos : ['R']}
        ]
    },
    {
        _matchedRoute : '/jugadores',
        perfiles : [
            {perfil : 1,  permisos : ['A']},
            {perfil : 2,  permisos : ['R']}
        ]
    },

    {
        _matchedRoute : '/partidos',
        perfiles : [
            {perfil : 1,  permisos : ['A']},
            {perfil : 2,  permisos : ['A']}
        ]
    },

    {
        _matchedRoute : '/cambiarPassword',
        perfiles : [
            {perfil : 1,  permisos : ['A']},
            {perfil : 2,  permisos : ['A']}
        ]
    },
    {
        _matchedRoute : '/pedirCodigoEmail',
        perfiles : [
            {perfil : 1,  permisos : ['A']},
            {perfil : 2,  permisos : ['A']}
        ]
    },
    {
        _matchedRoute : '/confirmarEmail',
        perfiles : [
            {perfil : 1,  permisos : ['A']},
            {perfil : 2,  permisos : ['A']}
        ]
    },

    
] ;

