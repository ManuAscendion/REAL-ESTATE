const express = require("express");
const { google } = require("googleapis");
const app = express();

const auth = new google.auth.GoogleAuth({
  keyFile: "./credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
});

app.get("/api/sheets", async (req, res) => {

  try {

    const sheets = google.sheets({ version: "v4", auth });

    const sheetName = req.query.range;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1bRESXFZIv4J3ySaS1N2Ez6P6c1_3HZFgC2daXi1-BgU",
      range: `${sheetName}!A1:AZ1000`
    });

    const rows = response.data.values || [];

    const table = {
      cols: rows[0].map(() => ({ label: "", type: "string" })),
      rows: rows.slice(1).map(r => ({
        c: r.map(v => ({ v }))
      }))
    };

    const gviz = "google.visualization.Query.setResponse(" +
JSON.stringify({
  version: "0.6",
  status: "ok",
  table
}) +
");";

    res.send(gviz);

  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.use(express.static("./"));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});