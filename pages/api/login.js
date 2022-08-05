// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const mz_endpoint = process.env.MZ_ENDPOINT;
const mz_user = process.env.MZ_USER;
const mz_password = process.env.MZ_PASSWORD;
const upstash_user = process.env.UPSTASH_USER;
const upstash_password = process.env.UPSTASH_PASSWORD;
const upstash_endpoint = process.env.UPSTASH_ENDPOINT;

export default async function name(req, res) {
  if (req.method === 'POST') {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Basic ' + Buffer.from(upstash_user + ":" + upstash_password).toString('base64'));

    const event = {
      ip: req.connection.remoteAddress,
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
  } else {
    // Handle any other HTTP method
    res.status(500).json();
  }
}

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     const { body } = req;
//     const { email, password } = body;

//     const query = `SELECT * FROM TTL.logins WHERE email = ${email} and password = ${password};`;

//     let headers = new Headers();
//     headers.append('Content-Type', 'application/json');
//     headers.append('Authorization', 'Basic ' + Buffer.from(mz_user + ":" + mz_password).toString('base64'));

//     try {
//       const response = await fetch("https://eh788lb307wpz2rntwct1z0a8.0.us-east-1.aws.materialize.cloud/api/sql", {
//         body: JSON.stringify({
//           sql: query
//         }),
//         headers,
//         method: "POST",
//       });
//       const { results } = await response.json();
//       const [{ rows }] = results;

//       if (rows.length > 0) {
//         res.status(200).json();
//       } else {
//         res.status(401).json();
//       }

//     } catch (err) {
//       console.error("Error: ", err);
//       res.status(500).json();
//     }
//   } else {
//     // Handle any other HTTP method
//     res.status(500).json();
//   }
// }
