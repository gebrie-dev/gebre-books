# **Gebre-Books Collection** 📖

## Overview

Gebre-Books Collection is a RESTful API designed to simplify the management of book collections. With robust features like user authentication, CRUD operations, and random book recommendations, it provides a seamless experience for managing personal or shared libraries.

## Key Features

- **Authentication**: Secure login/signup with JWT tokens.
- **Authorization**: Role-based access (Admin/User).
- **CRUD Operations**: Add, update, view, and delete books based on you role.
- **Recommendations**: Get book suggestions.
- **Favorites**: Mark or unmark books as favorites.
- **Validation**: Ensures only valid data is processed.

## 📋 Endpoints

### 🔑 **Authentication**

| Method | Endpoint        | Description                                  |
| ------ | --------------- | -------------------------------------------- |
| POST   | `/auth/signup`  | Sign up a new user.                          |
| POST   | `/auth/login`   | Login and receive a JWT token.               |
| GET    | `/auth/profile` | Fetch the profile of the authenticated user. |

### 📚 **Books**

| **Method** | **Endpoint**             | **Description**                                     |
| ---------- | ------------------------ | --------------------------------------------------- |
| **GET**    | `/books/all`             | **Admin**: Fetch all books.                         |
| **GET**    | `/books`                 | **User**: Fetch limited books (filter by favorite). |
| **POST**   | `/books`                 | Add a new book.                                     |
| **PUT**    | `/books/:id`             | Update book details by ID.                          |
| **DELETE** | `/books/:id`             | Delete a book by ID.                                |
| **GET**    | `/books/recommendations` | Get a book recommendation.                          |
| **GET**    | `/books/favorite`        | Toggle favorite status for a random book.           |

## 🔐 **Authorization Guide**

Follow the steps below to sign up, log in, and access protected endpoints.

### **1. Log In with already existng users**

- **Admin**:
  - Email: `fermin@gmail.com`, Password: `123456`
- **User**:

  - Email: `hero@gmail.com`, Password: `123456`

- Use the `/auth/login` endpoint to obtain a JWT token.

### **2. Authorize**

1. Click the **"Authorize"** button in Swagger UI.
2. Enter the token in the format:

```plaintext
   Bearer <your-token>
```

### **. Sign Up with new users or admin**

if you want to create a new user and admin of your own
You can sign up as either **Admin** or **User**

#### Admin Sign-Up:

assign role to **admin** as following

```json
{
  "username": "adminName",
  "email": "name@example.com",
  "password": "yourpassword",
  "role": "admin"
}
```

### user Sign-Up:

assign role to **user** as following

```bash

{
"username": "userName",
"email": "name@example.com",
"password": "yourpassword",
"role": "user"
}

```

then login based on the above login instruction

## Quick Start

### Clone the repository:

```bash
 git clone https://github.com/gebrie-dev/gebre-books.git
```

## Install dependencies:

```javascript

    npm install
```

## Set up .env with your MongoDB URI and desired port:

```bash
 MONGO_URI=<your-mongodb-uri>
 PORT=3600
```

## Start the server:

```bash
  npm start

```

Access the API at

```bash
 http://localhost:3600/api-docs

```

## Live Demo

For a live demo, visit the deployed version of the API:

[Live Demo 🌍](https://gebre-books.onrender.com/api-docs)
