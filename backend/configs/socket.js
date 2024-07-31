

// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const User = require('../models/user'); // Adjust the path as necessary

// function initializeSocket(httpServer) {
//     const io = new Server(httpServer, {
//         cors: {
//             origin: process.env.FRONT_END_URL,
//             methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//             credentials: true,
//         }
//     });

//     io.on('connection', (socket) => {
//         //console.log('New client connected');

//         // Listen for the joinRoom event
//         socket.on('joinRoom', async (userId) => {
//             socket.join(userId);
//             //console.log(`User with ID ${userId} joined room ${userId}`);

//             // Update the user status to online
//             try {
//                 await User.findByIdAndUpdate(userId, { isOnline: true });
//             } catch (error) {
//                 console.error(`Error updating user status: ${error.message}`);
//             }
//         });

//         socket.on('disconnect', async () => {
//             //console.log('Client disconnected');

//             // Update the user status to offline
//             // This is a simplified example. In a real-world scenario, you might want to ensure that the user is not connected with another socket before marking them offline.
//             const rooms = Array.from(socket.rooms);
//             for (const room of rooms) {
//                 if (room !== socket.id) {
//                     try {
//                         await User.findByIdAndUpdate(room, { isOnline: false });
//                     } catch (error) {
//                         console.error(`Error updating user status: ${error.message}`);
//                     }
//                 }
//             }
//         });
//     });

//     return io;
// }

// module.exports = initializeSocket;


const { Server } = require('socket.io');
const mongoose = require('mongoose');
const User = require('../models/user'); // Adjust the path as necessary
const redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

function initializeSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONT_END_URL,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            credentials: true,
        }
    });

    const pubClient = redis.createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });

    const subClient = pubClient.duplicate();

    pubClient.connect().catch(console.error);
    subClient.connect().catch(console.error);

    io.adapter(createAdapter(pubClient, subClient));

    io.on('connection', (socket) => {
        socket.on('joinRoom', async (userId) => {
            socket.join(userId);
            try {
                await User.findByIdAndUpdate(userId, { isOnline: true });
            } catch (error) {
                console.error(`Error updating user status: ${error.message}`);
            }
        });

        socket.on('disconnect', async () => {
            const rooms = Array.from(socket.rooms);
            for (const room of rooms) {
                if (room !== socket.id) {
                    try {
                        await User.findByIdAndUpdate(room, { isOnline: false });
                    } catch (error) {
                        console.error(`Error updating user status: ${error.message}`);
                    }
                }
            }
        });
    });

    return io;
}

module.exports = initializeSocket;

