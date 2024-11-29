const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors"); // Required for handling CORS
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

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


const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://gebre-books.onrender.com" 
    : "http://localhost:3700"; 
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Gebrie Books collection",
      version: "1.0.0",
      description: "API for managing a collection of books",
    },
    servers: [
      {
        url: baseUrl, 
      },
    ],
  },
  apis: ["./routes/books.js"], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));
const booksRouter = require("./routes/books");
app.use("/books", booksRouter);
const PORT = process.env.PORT || 3700;
app.listen(PORT, () => {
  console.log(`Server running on ${baseUrl}`);
});
