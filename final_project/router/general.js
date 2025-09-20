const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req,res) => {
  const {username, password}=req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  let existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn=req.params.isbn;
  const book=books[isbn];
  if(book){
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else{
    return res.status(400).json({message: `Book with ISBN ${isbn} not found`});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author=req.params.author;
    const keys=Object.keys(books);
    let booksByAuthor=[];
    keys.forEach((key)=>{
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
            booksByAuthor.push(books[key]);
        }
    });
    if(booksByAuthor.length>0){
      return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } else{
      return res.status(400).json({message: `No books with author ${author} found`});
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title=req.params.title;
    const keys=Object.keys(books);
    let booksByTitle=[];
    keys.forEach((key)=>{
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
            booksByTitle.push(books[key]);
        }
    });
    if(booksByTitle.length>0){
      return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } else{
      return res.status(400).json({message: `No books with title ${title} found`});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn=req.params.isbn;
  if (books[isbn]) {
    const reviews = books[isbn].reviews;
    return res.status(200).send(JSON.stringify(reviews, null, 4));
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

async function getBooksAsync() {
    try {
      const response = await axios.get("http://localhost:5000/");
      console.log("Books retrieved using async-await:");
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching books (Async/Await):", error.message);
    }
}
// Fetch book by ISBN using Promises
function getBookByISBN(isbn) {
    axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then(response => {
        console.log(`Book details for ISBN ${isbn} (Promise):`);
        console.log(response.data);
      })
      .catch(error => {
        console.error(`Error fetching book by ISBN ${isbn} (Promise):`, error.message);
      });
}
// Fetch books by Author
async function getBooksByAuthorAsync(author) {
    try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      console.log(`Books by author "${author}" (Async/Await):`);
      console.log(response.data);
    } catch (error) {
      console.error(`Error fetching books by author "${author}" (Async/Await):`, error.message);
    }
}
// Fetch book by Title using Promises
function getBooksByTitle(title) {
    axios.get(`http://localhost:5000/title/${title}`)
      .then(response => {
        console.log(`Books with title "${title}" (Promise):`);
        console.log(response.data);
      })
      .catch(error => {
        console.error(`Error fetching books with title "${title}" (Promise):`, error.message);
      });
  }
if (require.main === module) {
    //getBooksAsync();
    //getBookByISBN("2");
    //getBooksByAuthorAsync("Samuel Beckett");
    getBooksByTitle("One Thousand and One Nights");
}

module.exports.general = public_users;
