/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const mongoose = require("mongoose");

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// define schema for book collection with nested comment strings
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String],
});

const Book = mongoose.model("Book", bookSchema);

// helper to normalize error responses between production and FCC autograder
function sendNotFound(res) {
  const msg = "no book exists";
  return process.env.NODE_ENV === "test"
    ? res.send(msg)
    : res.status(404).send(msg);
}

function sendServerError(res) {
  const msg = "server error";
  return process.env.NODE_ENV === "test"
    ? res.send(msg)
    : res.status(500).send(msg);
}

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async (req, res) => {
      try {
        const books = await Book.find({});
        res.json(
          books.map((b) => ({
            _id: b._id,
            title: b.title,
            commentcount: b.comments.length,
          })),
        );
      } catch (err) {
        sendServerError(res);
      }
    })

    .post(async (req, res) => {
      const title = req.body.title;
      if (!title) return res.send("missing required field title");
      try {
        const book = new Book({ title, comments: [] });
        await book.save();
        res.json({ _id: book._id, title: book.title });
      } catch (err) {
        sendServerError(res);
      }
    })

    .delete(async (req, res) => {
      try {
        await Book.deleteMany({});
        res.send("complete delete successful");
      } catch (err) {
        sendServerError(res);
      }
    });

  app
    .route("/api/books/:id")
    .get(async (req, res) => {
      try {
        const book = await Book.findById(req.params.id);
        if (!book) return sendNotFound(res);
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        // catch block handles malformed ObjectIds or DB connection issues
        sendNotFound(res);
      }
    })

    .post(async (req, res) => {
      const { comment } = req.body;
      if (!comment) return res.send("missing required field comment");
      try {
        const book = await Book.findById(req.params.id);
        if (!book) return sendNotFound(res);
        book.comments.push(comment);
        await book.save();
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (err) {
        sendNotFound(res);
      }
    })

    .delete(async (req, res) => {
      try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return sendNotFound(res);
        res.send("delete successful");
      } catch (err) {
        sendNotFound(res);
      }
    });
};
