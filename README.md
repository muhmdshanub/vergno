# vergno

Vergno - Social Media Application

Technologies used: React, Node.js, Express, MongoDB, Firebase, Material-UI, Socket.io, Redis, Docker

"Vergno" is an academic social media platform designed for users to share doubts, ideas, and engage in discussions. This project includes both user and admin interfaces with various key features.

User Features:
  Authentication: Users can sign up and log in using email/password or Google account via Firebase integration.
  Post System: Users can post doubts or ideas, like, comment, report, and reply to posts. Posts can be saved for future reference.
  Comment Interaction: Comments can be liked, reported, and replied to, enhancing user engagement.
  Follow System: Users can follow/unfollow, block/unblock others, and view user profiles with the option to edit personal information.
  Topics & Feed: Users can follow topics (like hashtags) to get relevant posts in their feed.
  Messaging: Real-time messaging between users with unread message count tracking, implemented using Socket.io for real-time communication.
  Global Search: Users can search for posts (queries and perspectives), users, and topics.

Admin Features:
  Post Management: Admins can view all posts along with their metadata, including likes, comments, and reports. They have the ability to block or unblock posts based on content or user behavior.
  User Management: Admins can access detailed user data, block/unblock users, and delete user accounts if necessary to maintain community standards.
  Topic Management: Admins can add new topics to the application, allowing the platform to evolve and address new areas of discussion.
  Automated Moderation: The system automatically blocks posts and comments when the number of user reports reaches a certain threshold. Admins can then review these flagged items and make final decisions on           whether to keep them blocked or restore them.
  Decision Review: Admins have the authority to review user-reported content and decide whether to permanently block or unblock posts and comments based on the platform's guidelines.
  
Backend & Infrastructure:
  Redis was used for efficient session management and caching, improving performance and user experience. Additionally, Redis was employed to centralize Socket.io in the containerized environment, ensuring           seamless real-time communication across multiple containers.
  Docker was used to containerize the application, ensuring a consistent and isolated environment for deployment across different platforms.


Key Libraries:

Frontend:
  React: Core library for building user interfaces.
  Material-UI: Used for a modern, responsive UI design.
  React Router DOM: Enables routing and navigation within the application.
  Redux Toolkit: Efficient state management for handling global app state.
  Firebase: For user authentication via email/password or Google OAuth.
  Socket.io-client: Handles real-time communication in the frontend.
  React Infinite Scroll Component: Enhances the user experience by enabling infinite scrolling in feeds.

Backend:

  Express: Core framework for building APIs and handling HTTP requests.
  Mongoose: For database schema modeling and interaction with MongoDB.
  Socket.io: Provides real-time communication between users (e.g., messaging, notifications).
  Redis: Centralizes Socket.io connections in a multi-container setup, while also improving caching and session management.
  Cloudinary: Used for handling media uploads and storage in the cloud.
  Firebase-admin: Manages Firebase services like Google OAuth authentication on the backend.
  jsonwebtoken (JWT): For secure token-based authentication of users.
  Multer: Handles file uploads, especially for images.
  Nodemailer: For sending system emails, such as user notifications or verification links.

  
This project demonstrates proficiency in full-stack development, real-time communication, user authentication, efficient session management with Redis, caching, cloud-based media handling, and containerized deployment with Docker.
