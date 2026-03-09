import { google } from "googleapis";

export default async function handler(req, res) {

  const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const sheets = google.sheets({ version: "v4", auth });

  const range = req.query.range;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: "14Bz3QibO5MWiOjaF-pvSfDs3enW5Nd6R",
    range: range
  });

  const rows = response.data.values;

  const table = {
    cols: rows[0].map(() => ({ label: "", type: "string" })),
    rows: rows.slice(1).map(r => ({
      c: r.map(v => ({ v }))
    }))
  };

  const gviz = `google.visualization.Query.setResponse(${JSON.stringify({
    table
  })});`;

  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(gviz);
}