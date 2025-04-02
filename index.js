import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const API_URL = `https://covers.openlibrary.org/b/isbn/`;
const size = 'M';

// Connect to database 
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "library",
    password: "postR095rock!!",
    port: 5432,
});
db.connect();


//Middlware
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static("public"));


//Get home page
app.get("/", async (req,res) => {
    const today = new Date();
    const month = today.getMonth();
    const monthNames = ["January", "February","March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = monthNames[month];

    try {
        const result = await db.query("SELECT * FROM books ORDER BY id ASC");
        const books = result.rows;
        console.log(books);
   
        //Fetch book covers for each book
        const bookWithCovers = await Promise.all(
            books.map(async (book) => {
                const coverUrl = `${API_URL}${book.isbn}-${size}.jpg`;
               
                try {
                    // Get the response type for the cover 
                    const response = await axios.get(coverUrl, {responseType: 'arraybuffer'});
                    // Check image size of file type
                    let contentLength = response.headers['content-length'];
                    if (!contentLength) {
                        contentLength = response.data.length;
                    }
                    const threshold = 300
                    if (parseInt(contentLength) < threshold) {
                        return {...book, coverUrl: '/images/placeholder.jpg'};
                    }
                        return {...book, coverUrl };
                } catch (apiError) {
                    console.error(`Error fetching cover for ISBN: ${book.isbn}`, apiError);
                    return {...book, coverUrl: null};
                }
            })
        );

        const latestBook = bookWithCovers.length > 0 ? bookWithCovers[bookWithCovers.length - 1] : null;


        res.render("index.ejs", { 
            currentMonthName,
            books: bookWithCovers,
            latestBook
        });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

//Render new book submission form
app.get("/add", (req,res) => {
    res.render("add.ejs");
});

//handle form submission from new ejs template
app.post("/add", async (req, res) => {
    console.log(req.body);
    const { newTitle, newAuthor, newRating, newDate, newSynopsis, newIsbn } = req.body;

    if (!newTitle || !newAuthor) {
        return res.status(400).send("Title and author are required.");
    }

    //insert new post in the db
    const insertQuery = 'INSERT INTO books (title, author, rating, date, synopsis, isbn) VALUES ($1, $2, $3, $4, $5, $6)';
    try {
        await db.query(insertQuery, [newTitle, newAuthor, newRating, newDate, newSynopsis, newIsbn]);
        res.redirect("/");
    } catch (err) {
        console.log(err);        
    } 
   
});


//Edit book
app.post("/edit", async (req, res) => {
    const {updatedTitle, updatedAuthor, updatedRating, updatedDate, updatedSynopsis, updatedIsbn, updatedBookId} = req.body;
    const updateQuery = 'UPDATE books SET title = ($1), author = ($2), rating = ($3), date = ($4), synopsis = ($5), isbn = ($6) WHERE id = ($7)';
    try {
        await db.query(updateQuery, [updatedTitle, updatedAuthor, updatedRating, updatedDate, updatedSynopsis, updatedIsbn, updatedBookId]);
        res.redirect("/");
    } catch (err) {
        console.error("Error updating book", err.stack);
        res.status(500).send("Internal Server Error");
    }
});


//Delete book




app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});