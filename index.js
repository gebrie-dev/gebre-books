const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors"); // Required for handling CORS
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

dotenv.config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://gebre-books.onrender.com"
      : "*", // Allow all in dev and specific frontend in production
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify the allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};


app.use(cors(corsOptions));


const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://gebre-books.onrender.com" // Render deployed API URL
    : "http://localhost:3700"; // Localhost for development

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
        url: baseUrl, // Use the dynamic URL based on environment
      },
    ],
  },
  apis: ["./routes/books.js"], // Adjust the path of your Swagger doc
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
  console.log(`Server running on ${baseUrl}`);
});
