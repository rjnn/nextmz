// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { mzpool } from '../../lib/mz';

var v = 1;

export default async function ban(req, res) {
  mzpool
    .query('SELECT $1', [v])
    .then(r => {
      console.log(r.rows[0]);
      v++
    })
    .catch(e => {
      console.error(e.stack)
    })

  res.status(200).json(0);
  return;
}
