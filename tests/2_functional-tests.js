/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  let testId; // variable to persist the ID of a created book for subsequent GET/POST/DELETE tests

  test("GET /api/books returns array", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        if (res.body.length > 0) {
          assert.property(res.body[0], "commentcount");
          assert.property(res.body[0], "title");
          assert.property(res.body[0], "_id");
        }
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function () {
        test("POST /api/books with title", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Test Book" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.property(res.body, "_id");
              assert.property(res.body, "title");
              assert.equal(res.body.title, "Test Book");
              testId = res.body._id;
              done();
            });
        });

        test("POST /api/books with no title given", function (done) {
          chai
            .request(server)
            .post("/api/books")
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field title");
              done();
            });
        });
      },
    );

    suite("GET /api/books => array of books", function () {
      test("GET /api/books returns array of books", function (done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            if (res.body.length > 0) {
              assert.property(res.body[0], "title");
              assert.property(res.body[0], "_id");
              assert.property(res.body[0], "commentcount");
            }
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("GET /api/books/[id] with id not in db", function (done) {
        // using a syntactically valid, non-existent ObjectId
        chai
          .request(server)
          .get("/api/books/64b64b64b64b64b64b64b64b")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .get("/api/books/" + testId)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "_id");
            assert.property(res.body, "title");
            assert.property(res.body, "comments");
            assert.isArray(res.body.comments);
            assert.equal(res.body._id, testId);
            done();
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("POST /api/books/[id] with comment", function (done) {
          chai
            .request(server)
            .post("/api/books/" + testId)
            .send({ comment: "Great book!" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.property(res.body, "_id");
              assert.property(res.body, "title");
              assert.property(res.body, "comments");
              assert.include(res.body.comments, "Great book!");
              done();
            });
        });

        test("POST /api/books/[id] without comment field", function (done) {
          chai
            .request(server)
            .post("/api/books/" + testId)
            .send({})
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field comment");
              done();
            });
        });

        test("POST /api/books/[id] with comment, id not in db", function (done) {
          chai
            .request(server)
            .post("/api/books/64b64b64b64b64b64b64b64b")
            .send({ comment: "Test comment" })
            .end(function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.text, "no book exists");
              done();
            });
        });
      },
    );

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/" + testId)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "delete successful");
            done();
          });
      });

      test("DELETE /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .delete("/api/books/64b64b64b64b64b64b64b64b")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });

    suite("DELETE /api/books => delete all books", function () {
      test("DELETE /api/books deletes all books", function (done) {
        chai
          .request(server)
          .delete("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "complete delete successful");
            done();
          });
      });
    });
  });
});
