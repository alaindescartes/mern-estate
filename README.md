🏠 MERN Estate

A full-stack real estate web application built with the MERN stack (MongoDB, Express, React, Node.js). This application allows users to browse properties, manage listings, and perform secure user authentication.

🛠 Features

User Authentication: Secure login and registration using jsonwebtoken and password hashing with bcryptjs.
Property Listings: Add, update, and delete real estate listings.
Responsive Design: Built with a mobile-first approach and optimized for all devices.
Swiper Integration: Carousel for property images using swiper.
Environment Configuration: Manage secrets and configurations using dotenv.
📂 Project Structure

api/: Backend server powered by Express and connected to MongoDB.
client/: Frontend React application with responsive UI and modern design.
🚀 How to Run

Prerequisites
Node.js installed on your machine
MongoDB (local or cloud instance)
Steps
Clone the repository:
git clone https://github.com/alaindescartes/mern-estate.git
cd mern-estate
Install dependencies:
npm install
Set up your environment variables in a .env file:
MONGO_URI=your_mongo_database_url
JWT_SECRET=your_jwt_secret
PORT=5000
Start the backend server:
npm run dev
The backend will run at http://localhost:5000.
📦 Dependencies

express: Fast and minimalist web framework for Node.js
mongoose: Elegant MongoDB object modeling for Node.js
bcryptjs: Password hashing
jsonwebtoken: Secure token-based authentication
cookie-parser: Parse cookies for secure sessions
cors: Enable Cross-Origin Resource Sharing
nodemon: Automatically restart the server on file changes
swiper: Beautiful carousels for image display
