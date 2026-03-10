import { google } from "googleapis";

const SHEET_MAP = {
  UPDATED:    "1bRESXFZIv4J3ySaS1N2Ez6P6c1_3HZFgC2daXi1-BgU",
  SUMMARY:    "1bRESXFZIv4J3ySaS1N2Ez6P6c1_3HZFgC2daXi1-BgU",
  COMPLIANCE: "14Bz3QibO5MWiOjaF-pvSfDs3enW5Nd6R"
};

export default async function handler(req, res) {
  try {
    const raw = process.env.GOOGLE_CREDENTIALS_JSON;
    
    // Fix any real newlines inside the JSON string before parsing
    const fixed = raw.replace(/\n/g, '\\n').replace(/\r/g, '');
    const credentials = JSON.parse(fixed);
    
    // Restore actual newlines in private key
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    });

    const sheets = google.sheets({ version: "v4", auth });
    const range = req.query.range;

    const spreadsheetId = SHEET_MAP[range];
    if (!spreadsheetId) {
      return res.status(400).send(`Unknown sheet: ${range}`);
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${range}!A1:AZ1000`
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return res.status(200).send(
        `google.visualization.Query.setResponse(${JSON.stringify({ table: { cols: [], rows: [] } })});`
      );
    }

    const table = {
      cols: rows[0].map(() => ({ label: "", type: "string" })),
      rows: rows.slice(1).map(r => ({
        c: r.map(v => ({ v }))
      }))
    };

    const gviz = `google.visualization.Query.setResponse(${JSON.stringify({ table })});`;
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(gviz);

  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}