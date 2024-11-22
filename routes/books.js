const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Book = require("../models/book");
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

const validateBook = (req, res, next) => {
  const { error } = bookSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  next();
};
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send("Failed to fetch books");
  }
});
router.post("/", validateBook, async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(500).send("Failed to save book");
  }
});
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

router.get("/favorite", async (req, res) => {
  try {
    const book = await Book.aggregate([{ $sample: { size: 1 } }]);
    if (book.length === 0) return res.status(404).send("No books available");

    const selectedBook = book[0];
    selectedBook.favorite = !selectedBook.favorite;

    const updatedBook = await Book.findByIdAndUpdate(
      selectedBook._id,
      { favorite: selectedBook.favorite },
      { new: true }
    );

    res.json({
      message: `Book "${updatedBook.title}" favorite status toggled.`,
      book: updatedBook,
    });
  } catch (err) {
    res.status(500).send("Failed to toggle favorite status");
  }
});

module.exports = router;
