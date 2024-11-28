const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: "*", // Allow any origin (or specify your frontend URL here)
};
app.use(cors(corsOptions));

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Gebre Books collection",
      version: "1.0.0",
      description: "API for managing a collection of books",
    },
    servers: [
      {
        url: process.env.SERVER_URL || "http://localhost:3700", // Use environment variable for deployed URL
      },
    ],
  },
  apis: ["./routes/books.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Set up Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const booksRouter = require("./routes/books");
app.use("/books", booksRouter);

// Start server
const PORT = process.env.PORT || 3700; // Use dynamic port for cloud platforms
app.listen(PORT, () => {
  console.log(
    `Server running on ${process.env.SERVER_URL || `http://localhost:${PORT}`}`
  );
});
