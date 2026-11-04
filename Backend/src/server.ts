import "dotenv/config";
import app from "./app.js";
import { pool } from "./db/db.js";

const port = Number(process.env.PORT || 8000);
app.listen(port, async () => {
  try {
    await pool.query("SELECT 1");
    console.log(`Meeting Room API running at http://localhost:${port}`);
    console.log("Database connected successfully.");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
});