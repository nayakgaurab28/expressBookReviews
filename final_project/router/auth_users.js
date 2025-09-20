const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }
    let accessToken = jwt.sign({ username: username }, "access", { expiresIn: 60*60 });

    // Save token in session
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "Customer successfully logged in", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  // Check login
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Check review text
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Review for book ISBN ${isbn} has been added/updated.`,
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
  
    // Check login
    if (!username) {
      return res.status(403).json({ message: "User not logged in" });
    }
  
    // Check if book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if user has a review
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username]; // remove review
      return res.status(200).json({
        message: `Review by ${username} for book ISBN ${isbn} deleted.`,
        reviews: books[isbn].reviews
      });
    } else {
      return res.status(404).json({ message: "No review by this user to delete" });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
