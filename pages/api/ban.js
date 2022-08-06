// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const mz_endpoint = process.env.MZ_ENDPOINT;
const mz_user = process.env.MZ_USER;
const mz_password = process.env.MZ_PASSWORD;
const upstash_user = process.env.UPSTASH_USER;
const upstash_password = process.env.UPSTASH_PASSWORD;
const upstash_endpoint = process.env.UPSTASH_ENDPOINT;

export default async function ban(req, res) {

  if (req.method === 'POST') {
    const { body } = req;
    const { IPv4 } = body;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Basic ' + Buffer.from(upstash_user + ":" + upstash_password).toString('base64'));

    const event = {
      ip: IPv4,
      event_time: Date.now(),
      event_ttl: "5 minutes",
    };

    fetch(upstash_endpoint, {
      method: "POST",
      body: JSON.stringify({ value: JSON.stringify(event) }),
      headers,
    }).then((r) => {
      if (r.status !== 200) {
        console.error("Status: ", r.status);
      }
    }).catch(console.error);

    res.status(200).json();
  } else if (req.method === "GET") {
    const { query: reqQuery } = req;
    const { IPv4 } = reqQuery;

    const query = `
      SELECT
        ip,
        (
          (
            extract(
              epoch from (
                to_timestamp(event_time::double / 1000) + interval '5 minutes'
              )
            ) * 1000 - mz_logical_timestamp()
          )
        ) AS remaining_seconds
      FROM (
        SELECT ip, MAX(event_time) as event_time
        FROM TTL.live_bans
        WHERE ip = '${IPv4}'
        GROUP BY ip
      );
    `;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Basic ' + Buffer.from(mz_user + ":" + mz_password).toString('base64'));

    try {
      const response = await fetch(mz_endpoint, {
        body: JSON.stringify({
          sql: query
        }),
        headers,
        method: "POST",
      });
      const { results } = await response.json();
      const [{ rows }] = results;

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
