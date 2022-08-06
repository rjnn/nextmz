// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const { Pool } = require("pg");

const mz_api_endpoin = process.env.MZ_API_ENDPOINT;
const mz_sql_endpoint = process.env.MZ_SQL_ENDPOINT;
const mz_user = process.env.MZ_USER;
const mz_password = process.env.MZ_PASSWORD;

const pool = new Pool({
  host: mz_sql_endpoint,
  port: 6875,
  user: mz_user,
  password: mz_password,
  database: "materialize",
  ssl: true
});

const insertQuery = "INSERT INTO TTL.bans_table VALUES ($1, to_timestamp($2))";
const filteringQuery = `SELECT
    ip,
    ((
        extract(epoch from (ban_time + interval '5 minutes')) * 1000
        - mz_logical_timestamp()
    )) AS remaining_seconds
  FROM (
    SELECT ip, MAX(ban_time) as ban_time
    FROM TTL.bans
    WHERE ip = $1
    GROUP BY ip
  );`;

export default async function ban(req, res) {
  const client = pool.connect();
  const before = new Date();

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', 'Basic ' + Buffer.from(mz_user + ":" + mz_password).toString('base64'));

  if (req.method === 'POST') {
    const { body } = req;
    const { IPv4 } = body;

    try {
      await (await client).query(insertQuery, [IPv4, Date.now() / 1000]);
      const results = await (await client).query(filteringQuery, [IPv4]);
      const { rows } = results;
      const [row] = rows;
      const after = new Date();
      console.log("Performance A: ", after.getTime() - before.getTime())

      res.status(200).json(row);
    } catch (err) {
      console.log(err);
      res.status(500).json();
      return;
    }
  } else if (req.method === "GET") {
    const { query: reqQuery } = req;
    const { IPv4 } = reqQuery;

    try {
      const query = filteringQuery.replace("$1", `'${IPv4}'`);
      const response = await fetch(mz_api_endpoin, {
        body: JSON.stringify({
          sql: query
        }),
        headers,
        method: "POST",
      });
      const { results } = await response.json();
      const [{ rows }] = results;

      const after = new Date();
      console.log("Performance B: ", after.getTime() - before.getTime())

      if (rows.length > 0) {
        const [row] = rows;

        res.status(401).json(row);
      } else {
        res.status(200).json();
      }

    } catch (err) {
      console.error("Error: ", err);
      res.status(500).json();
    }
  } else {
      // Handle any other HTTP method
      res.status(500).json();
  }
}
