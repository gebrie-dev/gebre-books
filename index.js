const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", // Use OpenAPI 3.0 specification
    info: {
      title: "Gebrie Books collection",
      version: "1.0.0",
      description: "API for managing a collection of books",
    },
    servers: [
      {
        url: "http://localhost:3700",
      },
    ],
  },
  apis: ["./routes/books.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const booksRouter = require("./routes/books");
app.use("/books", booksRouter);

// Start server
const PORT = process.env.PORT || 3700;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
