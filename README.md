# Book Diary

A web application to track your reading journey. Create a personal library with book details, ratings, and cover images.

## Features

- Add, edit and delete book entries
- Auto-fetch book covers using ISBN
- Sort books by multiple criteria
- Star rating system (1-5)
- Monthly reading overview


## Tech Stack

- Node.js & Express
- PostgreSQL
- EJS templates
- Tailwind CSS
- Open Library API

## Prerequisites

- Node.js (v14+)
- PostgreSQL
- npm/yarn

## Database Configuration

1. Create a `.pgpass` file in your home directory:
```bash
touch ~/.pgpass
chmod 0600 ~/.pgpass
```

2. Add your database credentials to `~/.pgpass`:
```
hostname:port:database:username:password
```

3. Configure environment variables in `.env`:
```
PG_USER=yourusername
PG_HOST=localhost
PG_DATABASE=your_database_name
PG_PORT=5432
```

## Installation

1. Clone and install dependencies:
```bash
git clone <repository-url>
cd book-diary
npm install
```

2. Set up the database schema:
```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    rating INTEGER,
    date DATE,
    synopsis TEXT,
    isbn VARCHAR(13)
);
```

3. Start the server:
```bash
npm start
```

## API Endpoints

Test the endpoints using cURL:

### Get All Books
```bash
curl -X GET http://localhost:3000/
```

### Add a Book
```bash
curl -X POST http://localhost:3000/add \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "newTitle=The Hobbit" \
  -d "newAuthor=J.R.R. Tolkien" \
  -d "newRating=5" \
  -d "newDate=2024-04-22" \
  -d "newSynopsis=A hobbit's tale" \
  -d "newIsbn=9780261103344"
```

### Sort Books
```bash
curl -X GET "http://localhost:3000/sort?criteria=author"
```

### Edit a Book
```bash
curl -X POST http://localhost:3000/edit \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "updatedTitle=New Title" \
  -d "updatedAuthor=New Author" \
  -d "updatedBookId=1"
```

### Delete a Book
```bash
curl -X POST http://localhost:3000/delete \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "deleteBookId=1"
```

## Features Explained

- **Book Covers**: Fetched automatically from Open Library API using ISBN
- **Sorting**: Sort by title, author, date read, or rating
- **Responsive Design**: Optimized for desktop and mobile views
- **Data Persistence**: All entries stored in PostgreSQL database

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## License

MIT License

## Acknowledgments

- Open Library API for book covers
- Tailwind CSS for styling
- Icons from icons8.com