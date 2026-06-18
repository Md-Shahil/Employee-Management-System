# Employee Management System

A full-stack web application designed to streamline employee record management. Built using the MERN stack (MongoDB, Express.js, React, Node.js) and bundled with Vite, this system allows users to seamlessly handle personnel data, perform secure CRUD operations, and manage profile image uploads locally on the server.

## 🚀 Features

- **Employee Dashboard**: Interactive and clean interface showcasing active employee profiles.
- **Full CRUD Support**: Create, Read, Update, and Delete employee records with instant data synchronization.
- **Profile Picture Uploads**: Handles binary file uploads using Multer and maps public asset availability through static routes.
- **Environment-Driven Architecture**: Fully isolated environment variables ensuring effortless switching between local development and production cloud infrastructures.
- **Seamless Router Routing**: Pre-configured to rewrite client-side pathways, preventing 404 broken routes when refreshed on cloud hosting platforms.

---

## 🛠️ Tech Stack & Dependencies

### Frontend
- **React.js & Vite**: Rapid client-side compilation rendering modular user interfaces.
- **Vite Environment Engine**: Secure dynamic runtime mapping using `import.meta.env.VITE_API_URL`.
- **CSS3 / UI Framework**: Fully responsive data grids and modal design layouts.

### Backend
- **Node.js & Express.js**: Asynchronous RESTful API framework managing data endpoint queries.
- **MongoDB Atlas**: Scalable cloud database enforcing structured object modeling schemas via Mongoose.
- **Multer Middleware**: Multipart/form-data streaming pipeline processing local physical file directory ingestion.

---

## 📁 Project Structure

```text
your-project-repository/
├── .gitignore
├── README.md
├── backend/
│   ├── models/
│   │   └── Employee.js        # Mongoose database models & schemas
│   ├── uploads/               # Local directory holding uploaded avatar photos
│   ├── package.json           # Backend dependency scripts
│   └── server.js              # Node/Express application server entry point
└── frontend/
    ├── src/
    │   ├── components/        # UI components (Forms, Lists, Cards)
    │   ├── App.jsx            # Core layout routing and state configurations
    │   └── main.jsx
    ├── .env                   # Local environment pointer file
    ├── package.json           # Frontend modules configuration
    └── vite.config.js         # Port settings (Pre-configured to Port 3000)
```

---

---

## 🏗️ Project Architecture & Data Flow

The system follows a decoupled Client-Server architecture. The React frontend handles user interactions and makes HTTP requests, while the Node/Express backend serves RESTful API endpoints and connects to MongoDB Atlas for persistence.

```text
       +-------------------------------------------------------+
       |                  Vite React Frontend                  |
       |  (Manages State, Renders UI Components, Handles Forms)|
       +-------------------------------------------+-----------+
                                                   |
                        HTTP Requests (Axios/Fetch)| [Multipart Form Data]
                        Via VITE_API_URL           | [JSON Payloads]
                                                   v
       +-------------------------------------------+-----------+
       |                 Express.js Backend                    |
       |  (Defines REST Routes, Runs Middleware, Serves Files) |
       +--------+----------------------------------+-----------+
                |                                  |
                | [Saves Files Locally]            | [Queries & Mutates]
                v                                  v
       +--------+----------+             +-------------+-----------+
       |  /backend/uploads |             |      MongoDB Atlas      |
       | (Static Asset     |             | (Stores Document Records|
       |  Storage Folder)  |             |  & Image String Paths)  |
       +-------------------+             +-------------------------+
