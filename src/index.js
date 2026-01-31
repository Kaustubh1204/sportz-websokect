import express from 'express';
import { matchRoutes } from './routes/match.js';
import http from 'http';
import { attachWebSocketServer } from './ws/server.js';
import { securityMiddleware } from './arcjet.js';

const app = express();
const PORT = process.env.PORT || 8003;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Express!' });
});

app.use("/matches", securityMiddleware(), matchRoutes);

const server = app.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
    console.log(`Server running at ${baseUrl}`);
    console.log(`WebSocket server running on ${baseUrl.replace('http', 'ws')}/ws`);
});

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
