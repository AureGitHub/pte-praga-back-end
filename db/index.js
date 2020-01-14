const knex = require('knex');
require('dotenv').config()

module.exports = knex({
  client: "pg", // pg is the database library for postgreSQL on knexjs
  connection: {
    host: process.env.HOST, // Your local host IP
    user: process.env.USER, // Your postgres user name
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port : process.env.PORTDB
  }
  });

  // module.exports = knex({
  //   client: 'sqlite3',
  //   connection: { filename: path.join(__dirname, 'ppraga.db') },
  //   useNullAsDefault: true,
  // });