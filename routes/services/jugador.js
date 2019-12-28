parse = require('co-body');
var sqlite3 = require('sqlite3').verbose();





var login1 = exports.login = function *login(){    
    var body1 = yield parse(this);  
    console.log('entra');
    this.body = {                    
        data: 'pepe'
    };
    
//    var user = yield platform.users.loginN(body.email,body.password);

//    if (user) {
//        let userRet = {};
//        userRet.name = user.name;
//        userRet.email = user.email;
//        userRet.perfil = user.TipoUserId;
//        userRet.isAdmin = user.TipoUserId == 1;
//        userRet.minSession = token.minSession;
//        userRet.token = token.OnlygenToken(userRet);
     
//        this.body = { 
//            data : userRet
//        };
//    }
//    else {
//        this.body = {
//            data: null
//        };
//    }
  
}; 


const login = async (ctx,next) => {
    ctx.body = 'login!';
    await next();
}

const getAll = async (ctx,next) => {

    try{
        
        var db = new sqlite3.Database('ppraga.db');
        let sql = `SELECT * from jugador`;
     
        
        db.all(sql, [], (err, rows) => {
        if (err) {
            console.log(err); 
            ctx.body = err;
        }
        console.log(rows[0]); 
        ctx.body ={users: '1'};
       
        });

        db.close();

    }
    catch(err){
        console.log(err); 
    }
}


const getAll1 = async (ctx,next) => {
    
    ctx.body = {users: '1'};
};

exports.register = function(router){
    router.get('/aure', (ctx, next) => {
        ctx.body = 'aure!';
      });


    router.post('/login', login);
    // router.get('/users/:userId', show);
    router.get('/jugadores', getAll);
    router.get('/jugadores1', getAll1);
    // router.post('/users', create);     
    // router.post('/users/:userId', update);
    // router.delete('/users/:userId', destroy);
};
