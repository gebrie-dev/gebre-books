# **Gebre-Books Collection** 📖

## Overview

Gebre-Books Collection is a RESTful API for managing your book collection. It supports CRUD operations, random book recommendations, and marking books as favorites, all while ensuring data validation and seamless database integration.

## Key Features

- **CRUD Operations**: Manage your books effortlessly.
- **Recommendations**: Get random book suggestions.
- **Favorites**: Mark or unmark books as favorites.
- **Validation**: Ensures only valid data is processed.

## Endpoints

### CRUD Endpoints

| Method | Endpoint     | Description                |
| ------ | ------------ | -------------------------- |
| GET    | `/books`     | Retrieve all books.        |
| POST   | `/books`     | Add a new book.            |
| PUT    | `/books/:id` | Update book details by ID. |
| DELETE | `/books/:id` | Delete a book by ID.       |

### Custom Endpoints

| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| GET    | `/books/recommendations` | Get random book recommendations.          |
| GET    | `/books/favorite`        | Toggle favorite status for a random book. |

##Quick Start
###Clone the repository:

git clone <https://github.com/gebrie-dev/gebre-books.git>

## Install dependencies:

npm install

## Set up .env with your MongoDB URI and desired port:

MONGO_URI=<your-mongodb-uri>  
PORT=3700

## Start the server:

npm start  
Access the API at http://localhost:3700/api-docs

** ## Live Demo **
For a live demo, visit the deployed version of the API:

[View Live Demo](https://gebre-books.onrender.com/api-docs)
