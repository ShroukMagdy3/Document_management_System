# 📁 Document Management System

A backend system for managing documents, built with **Node.js** and **TypeScript**, providing a secure infrastructure for uploading, storing, and organizing files with support for **workspaces**, **nested folders**, and a complete authentication and authorization system.

🔗 **Live Demo:** https://document-management-system-eight.vercel.app

---

## ✨ Features

- **Authentication & Authorization** using JWT and password hashing with bcrypt
- **Workspace management** to organize documents into separate workspaces
- **Folder management** with support for nested folders
- **Bulk folder upload** while preserving the original folder structure
- **Single file upload** with secure cloud storage
- **File preview** for supported document and media types
- **Document operations** including rename, move, search, soft delete, and permanent delete
- **Dual database support**: MongoDB (via Mongoose) and MySQL (via Sequelize)
- **Data validation** using Zod
- **Email sending** via Nodemailer (account activation, password recovery, etc.)
- **Extra security** using Helmet, CORS, and Express Rate Limit
- **Request logging** using Morgan
- Fully written in **TypeScript** for better maintainability and type safety

---

## 📂 Document Management

The system provides a complete document management experience, including:

- Creating and managing multiple workspaces
- Creating nested folders
- Uploading individual files
- Uploading entire folders while preserving their hierarchy
- Organizing documents inside folders
- Previewing supported files
- Renaming and moving files and folders
- Searching documents
- Soft delete (Recycle Bin) and permanent deletion

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript |
| Runtime | Node.js + Express 5 |
| Databases | MongoDB (Mongoose) / MySQL (Sequelize) |
| Cloud Storage | Cloudinary |
| Authentication | JSON Web Token (JWT) + bcrypt |
| Validation | Zod |
| Email | Nodemailer |
| Security | Helmet, CORS, express-rate-limit |
| Deployment | Vercel |

---

## 📂 Project Structure

```text
Document_management_System/
├── api/                  # Entry point for Vercel deployment
├── src/
│   ├── DB/               # Database models and configuration
│   ├── middleware/       # Authentication, validation, uploads
│   ├── module/
│   │   ├── documents/
│   │   ├── users/
│   │   └── workspace/
│   ├── routes/
│   ├── service/
│   ├── utilities/
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## 🚀 Running Locally

### Prerequisites

- Node.js (Latest LTS recommended)
- MongoDB and/or MySQL
- Cloudinary account
- SMTP email account

### Installation

```bash
# Clone the repository
git clone https://github.com/ShroukMagdy3/Document_management_System.git

# Navigate into the project
cd Document_management_System

# Install dependencies
npm install

# Create a .env file and add your environment variables

# Run the development server
npm run dev

# Build the project
npm run build

# Start the production server
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root.

```env
PORT=5000

# MongoDB
MONGO_URI=your_mongodb_connection_string

# MySQL
MYSQL_HOST=your_mysql_host
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_mysql_database

# JWT
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

---

## 📜 Available Scripts

| Command | Description |
|----------|-------------|
| `npm run dev` | Run the development server |
| `npm run build` | Build the project |
| `npm start` | Run the production build |

---

## 🌐 Deployment

The project is configured for deployment on **Vercel** using `vercel.json`.

**Live Demo:** https://document-management-system-eight.vercel.app

---

## 📚 API

The project exposes RESTful APIs for:

- Authentication
- Users
- Workspaces
- Documents
- Folder Management
- File Upload
- Folder Upload
- Search
- Preview
- Recycle Bin Operations

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👩‍💻 Author

**Shrouk Magdy**

GitHub: https://github.com/ShroukMagdy3
