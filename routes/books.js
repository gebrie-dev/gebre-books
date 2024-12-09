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

// ADMIN: Fetch all books
router.get("/all", verifyJWT, verifyRole(["admin"]), async (req, res) => {
  try {
    const books = await Book.find().lean();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// USER: Fetch books by user or filter by favorites
router.get("/", verifyJWT, verifyRole(["user"]), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { favorite } = req.query; // Optional filter by favorite
    const filter = { userId };
    if (favorite === "true") {
      filter.favorite = true;
    }

    const books = await Book.find(filter).lean();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

// USER: Add a new book
router.post(
  "/",
  verifyJWT,
  verifyRole(["user"]),
  validateBook,
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const { title, author, isbn, publishedYear, favorite } = req.body;

      // Check if a book with the same ISBN already exists
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res
          .status(400)
          .json({ error: "Book with this ISBN already exists." });
      }

      const book = new Book({
        userId, // Set the userId from the logged-in user
        title,
        author,
        isbn,
        publishedYear,
        favorite,
      });

      const savedBook = await book.save();
      res.status(201).json({
        success: true,
        message: "Book created successfully",
        data: savedBook,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to save book" });
    }
  }
);
// USER: Mark a book as favorite
router.post(
  "/favorite",
  verifyJWT,
  verifyRole(["user"]),
  validateObjectId,
  async (req, res) => {
    try {
      const book = await Book.findById(req.body.id);
      if (!book || book.createdBy.toString() !== req.user.userId) {
        return res
          .status(404)
          .json({ error: "Book not found or access denied" });
      }

      book.favorite = true;
      const updatedBook = await book.save();

      res.status(200).json({
        message: `Book "${updatedBook.title}" marked as favorite.`,
        book: updatedBook,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to mark book as favorite" });
    }
  }
);

// USER: Get book recommendations
// USER: Get personalized book recommendations
router.get(
  "/recommendations",
  verifyJWT,
  verifyRole(["user"]),
  async (req, res) => {
    const limit = parseInt(req.query.limit) || 2;

    try {
      const userId = req.user.userId;

      // Fetch the user's favorite books
      const favoriteBooks = await Book.find({ userId, favorite: true }).lean();

      let recommendations;

      if (favoriteBooks.length > 0) {
        // Use favorite books to find recommendations (e.g., same author)
        const authors = favoriteBooks.map((book) => book.author);

        recommendations = await Book.aggregate([
          { $match: { author: { $in: authors }, userId: { $ne: userId } } },
          { $sample: { size: limit } },
        ]).exec();
      }

      if (!recommendations || recommendations.length === 0) {
        // Fallback to generic recommendations if no favorites or matches found
        recommendations = await Book.aggregate([
          { $sample: { size: limit } },
        ]).exec();
      }

      if (recommendations.length === 0) {
        return res.status(404).json({ error: "No books available" });
      }

      res.json(recommendations);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  }
);


// USER: Update a book
router.put(
  "/:id",
  verifyJWT,
  verifyRole(["user"]),
  validateObjectId,
  validateBook,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const book = await Book.findOne({ _id: id, userId });
      if (!book) {
        return res
          .status(404)
          .json({ error: "Book not found or access denied" });
      }

      Object.assign(book, req.body); // Update book fields
      const updatedBook = await book.save();

      res.json({
        success: true,
        message: "Book updated successfully",
        data: updatedBook,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to update book" });
    }
  }
);

// ADMIN or USER: Delete a book
router.delete(
  "/:id",
  verifyJWT,
  verifyRole(["admin", "user"]),
  validateObjectId,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const role = req.user.role;

      const filter = role === "admin" ? { _id: id } : { _id: id, userId };
      const book = await Book.findOneAndDelete(filter);

      if (!book) {
        return res
          .status(404)
          .json({ error: "Book not found or access denied" });
      }

      res.json({ success: true, message: "Book deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete book" });
    }
  }
);

module.exports = router;
