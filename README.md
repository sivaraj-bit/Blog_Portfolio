# Blog Portfolio — Personal Portfolio & Blog Platform

A full-stack blog portfolio web application built to showcase development projects, share technical experiences, and manage blog content through a secure admin dashboard.

The platform provides a public-facing portfolio where visitors can explore published articles and projects, along with an administrative interface for creating, editing, and managing content.

## Live Demo

**Website:** https://blog-portfolio-oq8q.vercel.app/

**Admin Dashboard:** https://blog-portfolio-oq8q.vercel.app/admin/login

## GitHub Repository

https://github.com/sivaraj-bit/Blog_Portfolio

## Project Overview

The Blog Portfolio application is designed to provide a central platform for presenting development work and sharing technical knowledge.

Visitors can browse published blog posts and project articles through a clean, responsive interface. The admin dashboard provides authenticated content management, including blog creation, editing, image uploading, and deletion.

The application uses Firebase Authentication for user authentication, MongoDB Atlas for persistent data storage, and Cloudinary for image hosting.

## Features

### Public Website

- Clean and responsive portfolio interface.
- Browse published blog articles and projects.
- View individual blog posts.
- Category-based content organisation.
- Search and explore published content.
- Responsive layouts for desktop, tablet, and mobile.
- Professional editorial-style design.

### Admin Dashboard

- Secure admin authentication using Firebase.
- Protected admin routes.
- Create and publish blog articles.
- Edit existing blog content.
- Delete blog posts.
- Upload blog images using Cloudinary.
- Store blog information in MongoDB Atlas.
- Manage project links and article details.

### Image Management

- Cloudinary integration for image uploads.
- Store image URLs with blog information.
- Display uploaded images in published articles.
- Avoid storing image files directly in MongoDB.

### Authentication & Security

- Firebase Authentication.
- Firebase Admin integration for backend token verification.
- Protected API routes.
- Environment-based configuration.
- Secure handling of API credentials.

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript (ES6+)
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Firebase Admin SDK
- Cloudinary
- Multer

### Authentication & Storage
- Firebase Authentication
- MongoDB Atlas
- Cloudinary Image Storage

### Development & Deployment
- Git
- GitHub
- Vercel
- Render
- npm

## Application Architecture

The application follows a client-server architecture.

1. **React Frontend:** Handles the user interface, navigation, blog display, and admin dashboard.
2. **Express Backend:** Provides REST API endpoints for blog management and authentication verification.
3. **Firebase Authentication:** Manages user authentication and provides identity tokens.
4. **Firebase Admin:** Verifies authentication tokens on the backend.
5. **MongoDB Atlas:** Stores blog content and related information.
6. **Cloudinary:** Handles image uploads and image hosting.

## Project Structure

```text
Blog_Portfolio/
│
├── Client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │
│   │   ├── pages/
│   │   │
│   │   ├── firebase.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── firebaseAdmin.js
│   │
│   ├── middleware/
│   │
│   ├── models/
│   │
│   ├── routes/
│   │
│   ├── .env
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

*Note: The structure above represents the main application organisation. Adjust individual filenames and folders to match your actual repository.*

## Environment Variables

The application uses environment variables to configure the frontend and backend services.

### Frontend — Client/.env

```env
VITE_API_URL=your_backend_api_url

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Backend — server/.env

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ADMIN_EMAIL=your_admin_email
```

**Important:** Replace the example values with your actual credentials. Never upload `.env` files, Firebase private keys, or Cloudinary API secrets to GitHub.

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sivaraj-bit/Blog_Portfolio.git
```

### 2. Navigate to the Project

```bash
cd Blog_Portfolio
```

### 3. Install Frontend Dependencies

```bash
cd Client
npm install
```

### 4. Configure Frontend Environment Variables

Create a `.env` file inside the `Client` folder and add your Firebase configuration and backend API URL.

### 5. Start the Frontend

```bash
npm run dev
```

### 6. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

### 7. Configure Backend Environment Variables

Create a `.env` file inside the `server` folder and configure MongoDB, Firebase Admin, Cloudinary, and admin credentials.

### 8. Start the Backend

```bash
npm run dev
```

The frontend and backend will run independently during local development.

## Deployment

The application is deployed using separate hosting services for the frontend and backend.

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Authentication | Firebase |
| Image Hosting | Cloudinary |
| Source Code | GitHub |

### Deployment Configuration

- Deploy the React frontend through Vercel.
- Deploy the Express backend through Render.
- Configure MongoDB Atlas connection settings.
- Add Firebase configuration and service account credentials.
- Add Cloudinary credentials to the backend environment.
- Configure the frontend API URL to point to the deployed backend.
- Set appropriate CORS permissions for the deployed frontend.

## Key Learning Outcomes

Developing this project provided practical experience in:

- Building a full-stack application using React and Node.js.
- Creating and integrating REST APIs.
- Implementing Firebase Authentication.
- Verifying authentication tokens with Firebase Admin.
- Connecting MongoDB Atlas using Mongoose.
- Uploading and managing images with Cloudinary.
- Managing frontend and backend environment variables.
- Implementing protected routes and API endpoints.
- Deploying full-stack applications using Vercel and Render.
- Organising a project using a maintainable client-server structure.

## Future Improvements

- Add advanced blog search and filtering.
- Introduce article tags and reading-time estimates.
- Add pagination for published articles.
- Implement a visitor engagement system.
- Add analytics for blog views.
- Improve content management with draft and publishing states.

## Author

**Sivaraj G**

B.Sc. Data Science Graduate | Front-End / Web Developer

**GitHub:** https://github.com/sivaraj-bit

**LinkedIn:** https://www.linkedin.com/in/sivaraj33

## License

This project is created for personal portfolio and learning purposes.

---

**Built with React.js, Node.js, MongoDB, Firebase, and Cloudinary.**
