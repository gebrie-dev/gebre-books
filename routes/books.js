const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Book = require("../models/book");

// Joi schema for validating book data
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

// Middleware to validate the book data
const validateBook = (req, res, next) => {
  const { error } = bookSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  next();
};

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get a list of all books
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send("Failed to fetch books");
  }
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Add a new book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: Book added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 */
router.post("/", validateBook, async (req, res) => {
  try {
    const { title, author, isbn, publishedYear, favorite } = req.body;
    const existingBook = await Book.findOne({ isbn });
    if (existingBook)
      return res.status(400).send("Book with this ISBN already exists.");

    const book = new Book({ title, author, isbn, publishedYear, favorite });
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(500).send("Failed to save book");
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update an existing book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       400:
 *         description: Invalid ID format
 */
router.put("/:id", validateBook, async (req, res) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedBook) return res.status(404).send("Book not found");
    res.json(updatedBook);
  } catch (err) {
    res.status(500).send("Failed to update book");
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book successfully deleted
 *       404:
 *         description: Book not found
 *       400:
 *         description: Invalid ID format
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) return res.status(404).send("Book not found");
    res.status(200).send("Book successfully deleted");
  } catch (err) {
    res.status(500).send("Failed to delete book");
  }
});

/**
 * @swagger
 * /books/recommendations:
 *   get:
 *     summary: Get book recommendations
 *     parameters:
 *       - in: query
 *         name: limit
 *         description: Limit the number of recommendations
 *         required: false
 *         schema:
 *           type: integer
 *           default: 2
 *     responses:
 *       200:
 *         description: List of recommended books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: No books available
 */
router.get("/recommendations", async (req, res) => {
  const limit = parseInt(req.query.limit) || 2;
  try {
    const books = await Book.aggregate([{ $sample: { size: limit } }]);
    if (books.length === 0) return res.status(404).send("No books available");
    res.json(books);
  } catch (err) {
    res.status(500).send("Failed to fetch recommendations");
  }
});

/**
 * @swagger
 * /books/favorite:
 *   post:
 *     summary: Mark a specific book as a favorite
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the book to mark as favorite
 *                 example: "67440e98d9734765f737daad"
 *     responses:
 *       200:
 *         description: Book marked as favorite successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       400:
 *         description: Invalid ID format
 */
router.post("/favorite", async (req, res) => {
  const { id } = req.body;

  // Validate the ID format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).send("Invalid ID format");
  }

  try {
    // Find the book by ID
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send("Book not found");
    }

    // Mark the book as favorite
    book.favorite = true;

    // Save the updated book to the database
    const updatedBook = await book.save();

    // Respond with the updated book
    res.json({
      message: `Book "${updatedBook.title}" marked as favorite.`,
      book: updatedBook,
    });
  } catch (err) {
    res.status(500).send("Failed to mark book as favorite");
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *         - publishedYear
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the book
 *         title:
 *           type: string
 *           description: Title of the book
 *         author:
 *           type: string
 *           description: Author of the book
 *         isbn:
 *           type: string
 *           description: ISBN number of the book
 *         publishedYear:
 *           type: integer
 *           description: Year the book was published
 *         favorite:
 *           type: boolean
 *           description: Whether the book is marked as a favorite
 */

module.exports = router;
