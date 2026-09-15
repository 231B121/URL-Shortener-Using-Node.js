URL Shortener

A full-stack URL Shortener web application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).

The application allows users to convert long URLs into short, easy-to-share links and redirect users to the original URL.
========================================
Features



Create short URLs from long URLs
Fast URL redirection
Copy shortened URLs
Track URL click counts
Store URLs in MongoDB
Responsive user interface
REST API architecture
Handle invalid URLs
Mobile-friendly design

=========================================
Tech Stack

Frontend

React.js
React Router
Axios
HTML5
CSS3 / Tailwind CSS
=========================================
Backend

Node.js
Express.js
REST API
=========================================
Database

MongoDB
Mongoose
=========================================
Tools

Git
GitHub
npm
Postman
VS Code


===========================================
How It Works
User
 enters a long URL
        |
        v
React Frontend
        |
        v
Express REST API
        |
        v
Generate unique short code
        |
        v
Save URL in MongoDB
        |
        v
Return shortened URL
        |
        v
User opens shortened URL
        |
        v
Backend finds original URL
        |
        v
Redirect to original URL