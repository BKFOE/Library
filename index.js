import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();


const API_URL = `https://covers.openlibrary.org/b/isbn/`;
const size = 'M';


// Connect to database 
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
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

//Sort books by criteria
app.get('/sort', async (req, res) => {
    const critieria = req.query.criteria;
    let sortedBooks;

    try {
        switch (critieria) {
            case 'author':
                sortedBooks = await db.query("SELECT * FROM books ORDER BY author ASC");
                break;
            case 'title':
                sortedBooks = await db.query("SELECT * FROM books ORDER BY title ASC");
                break;
            case 'date':
                sortedBooks = await db.query("SELECT * FROM books ORDER BY date DESC");
                break;
            case 'rating':
                sortedBooks = await db.query("SELECT * FROM books ORDER BY rating DESC");
                break;
            default:    
                sortedBooks = await db.query("SELECT * FROM books ORDER BY id ASC");
    }

    //Add coverUrl to each book
    const bookWithCovers = await Promise.all(
        sortedBooks.rows.map(async(book) => {
            const coverUrl = `${API_URL}${book.isbn}-${size}.jpg`;
            try {
                const response = await axios.get(coverUrl, {responseType: 'arraybuffer'});
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
                return {...book, coverUrl: '/images/placeholder.jpg'};
            }
        })
    ); 
        res.json({books: bookWithCovers});
    } catch (err) {
        console.error("Error fetching sorted books", err.stack);
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
app.post("/delete", async (req, res) => {
    const bookId = req.body.deleteBookId;
    const deleteQuery = 'DELETE FROM books WHERE id = ($1)';
    try {
        await db.query(deleteQuery, [bookId]);
        res.redirect("/");
    } catch {
        console.error("Error executing query", err.stack);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});