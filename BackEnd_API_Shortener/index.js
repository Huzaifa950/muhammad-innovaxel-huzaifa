const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

async function initializeDatabase() {
  const db = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Huzaifa@440",
    database: "urlShortener",
  });

  console.log("Database connected");

  return db;
}

initializeDatabase().then((db) => {
  const generateShortId = () => Math.random().toString(36).substring(2, 8);

  const addUrl = async (longUrl) => {
    const shortId = generateShortId();
    console.log(`🔹 Saving to DB: shortId=${shortId}, longUrl=${longUrl}`);

    try {
      await db.execute("INSERT INTO urls (shortId, longUrl) VALUES (?, ?)", [
        shortId,
        longUrl,
      ]);
      console.log("URL Inserted Successfully");
      return shortId;
    } catch (error) {
      console.error("Error inserting URL:", error);
      throw error;
    }
  };

  app.post("/shorten", async (req, res) => {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: "Missing longUrl" });
    }

    try {
      const shortId = await addUrl(longUrl);
      console.log(`🆕 Shortened URL: http://localhost:5000/${shortId}`);

      res.json({ shortId });
    } catch (error) {
      console.error("Error in /shorten:", error);
      res.status(500).json({ error: "Failed to shorten URL" });
    }
  });

  app.get("/stats/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;

      await db.query("UPDATE urls SET visits = visits + 1 WHERE shortId = ?", [
        shortId,
      ]);

      const [result] = await db.query("SELECT * FROM urls WHERE shortId = ?", [
        shortId,
      ]);

      if (result.length === 0) {
        return res.status(404).json({ error: "Shortened URL not found" });
      }

      res.json(result[0]);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/shorten/:shortId", async (req, res) => {
    try {
      const { shortId } = req.params;
      const [result] = await db.query("SELECT * FROM urls WHERE shortId = ?", [
        shortId,
      ]);

      if (result.length === 0) {
        return res.status(404).json({ error: "Shortened URL not found" });
      }

      res.json({
        id: result[0].id,
        url: result[0].longUrl,
        shortCode: result[0].shortId,
        createdAt: result[0].createdAt,
        updatedAt: result[0].updatedAt,
      });
    } catch (error) {
      console.error("Error retrieving original URL:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.put('/api/update/:shortId', (req, res) => {
    const { shortId } = req.params;
    const { newLongUrl } = req.body;  
    console.log("Update Call", shortId)
  
    const sql = 'UPDATE urls SET longUrl = ? WHERE shortId = ?';
    db.query(sql, [newLongUrl, shortId], (err, result) => {
        if (err) {
            console.error('Error updating URL:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Short ID not found' });
        }
        res.json({ message: 'URL updated successfully' });
    });
  });

  app.listen(5000, () => console.log("Server running on port 5000"));
});
