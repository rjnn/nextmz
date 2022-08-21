// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const { Pool } = require("pg");

const mz_sql_endpoint = process.env.MZ_SQL_ENDPOINT;
const mz_user = process.env.MZ_USER;
const mz_password = process.env.MZ_PASSWORD;
const mz_db = process.env.MZ_DATABASE;

const pool = new Pool({
  host: mz_sql_endpoint,
  port: 6875,
  user: mz_user,
  password: mz_password,
  database: mz_db,
  ssl: true
});

const testQuery = "SELECT 17";
var v = 1;

export default async function ban(req, res) {
  pool
    .query('SELECT $1', [v])
    .then(r => {
      console.log(r.rows[0]);
      v++
    })
    .catch(e => {
      console.error(e.stack)
    })

  res.status(200).json();
  return;
}
