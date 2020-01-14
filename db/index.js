const path = require('path');
const knex = require('knex');

module.exports = knex({
  client: "pg", // pg is the database library for postgreSQL on knexjs
  connection: {
    host: "ec2-54-228-237-40.eu-west-1.compute.amazonaws.com", // Your local host IP
    user: "kkqnnfhbymrygb", // Your postgres user name
    password: "8f8d143e04ac0ebb2e3056e21508a343901890c1cb17d79087fea35576cebd84", // Your postgres user password
    database: "d855f3uoib5amg" // Your database name
  }
  });

  // module.exports = knex({
  //   client: 'sqlite3',
  //   connection: { filename: path.join(__dirname, 'ppraga.db') },
  //   useNullAsDefault: true,
  // });