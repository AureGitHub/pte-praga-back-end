const path = require('path');
const knex = require('knex');

// module.exports = knex({
//     client: 'mysql',
//     connection: { 
//       host: 'sql2.freemysqlhosting.net',
//       user: 'sql2318796',
//       password: 'bT7*rD4*',
//       database: 'sql2318796',
//       port: 3306,
    
//     },
//     useNullAsDefault: true,
//   });

  module.exports = knex({
    client: 'sqlite3',
    connection: { filename: path.join(__dirname, 'ppraga.db') },
    useNullAsDefault: true,
  });