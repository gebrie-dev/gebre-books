const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const apiDocs = require("./utils/swagger-config.json");
const booksRouter = require("./routes/books"); // Books routes
const { authRouter, verifyJWT } = require("./routes/auth");

dotenv.config();
const app = express();
app.use(express.json());

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://gebre-books.onrender.com"
      : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiDocs));

app.use("/auth", authRouter); 


app.use("/books", verifyJWT, booksRouter); 

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
});
const PORT = process.env.PORT || 3600;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
