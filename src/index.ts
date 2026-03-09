/**
 * Simple fileserver that serves static files from the project root.
 * Serves index.html at http://localhost:8080.
 */
import express from "express";

const PORT = 8080;
const app = express();

app.use(express.static("."));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
