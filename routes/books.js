const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Joi = require("joi");
const { verifyJWT, verifyRole } = require("../middleware/auth");

// Joi validation schema for book data
const bookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  isbn: Joi.string().required(),
  publishedYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .required(),
  favorite: Joi.boolean(),
});

// Middleware to validate book data
const validateBook = (req, res, next) => {
  const { error } = bookSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

// Utility to validate ObjectId format
const validateObjectId = (req, res, next) => {
  const id = req.params.id || req.body.id;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  next();
};

// ADMIN: Fetch all books (Admin only)
router.get("/all", verifyJWT, verifyRole(["admin"]), async (req, res) => {
  try {
    const books = await Book.find().lean();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// USER: Fetch books based on user-specific criteria
router.get("/", verifyJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const books = await Book.find({ userId }).lean();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user-specific books" });
  }
});

router.post("/", verifyJWT,verifyRole(["user"]), validateBook, async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { title, author, isbn, publishedYear, favorite } = req.body;

    
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res
        .status(400)
        .json({ error: "Book with this ISBN already exists." });
    }

    const book = new Book({
      userId,
      title,
      author,
      isbn,
      publishedYear,
      favorite,
    });

    console.log("Saving book:", book); 

    const savedBook = await book.save();
    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: savedBook,
    });
  } catch (err) {
    console.error("Error while saving book:", err); 
    res.status(500).json({
      error: "Failed to save book",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});
router.post("/favorite", verifyJWT, validateObjectId, async (req, res) => {
  try {
    console.log("Favorite request body:", req.body);

    const book = await Book.findById(req.body.id);
    if (!book) {
      console.error("Book not found:", req.body.id);
      return res.status(404).json({ error: "Book not found" });
    }

    book.favorite = true;
    const updatedBook = await book.save();

    console.log(`Book "${updatedBook.title}" marked as favorite`);
    res.status(200).json({
      message: `Book "${updatedBook.title}" marked as favorite.`,
      book: updatedBook,
    });
  } catch (err) {
    console.error("Error marking book as favorite:", err);
    res.status(500).json({ error: "Failed to mark book as favorite" });
  }
});


router.get("/recommendations", verifyJWT, async (req, res) => {
  const limit = parseInt(req.query.limit) || 2;
  try {
    const books = await Book.aggregate([{ $sample: { size: limit } }]).exec();
    if (books.length === 0) {
      return res.status(404).json({ error: "No books available" });
    }
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

module.exports = router;
