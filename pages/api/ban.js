// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { mzpool } from '../../lib/mz';

var v = 1;

export default async function ban(req, res) {
  var mzr = -1;
  mzpool
    .query('SELECT $1', [v])
    .then(r => {
      mzr = r.rows[0]
      console.log(mzr);
      v++
    })
    .catch(e => {
      console.error(e.stack)
    })

  res.status(200).json(mzr);
  return;
}
