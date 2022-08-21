const { Pool } = require("pg");

const mz_sql_endpoint = process.env.MZ_SQL_ENDPOINT;
const mz_user = process.env.MZ_USER;
const mz_password = process.env.MZ_PASSWORD;
const mz_db = process.env.MZ_DATABASE;

export const mzpool = new Pool({
    host: mz_sql_endpoint,
    port: 6875,
    user: mz_user,
    password: mz_password,
    database: mz_db,
    ssl: true
});
