import express from 'express';
import { matchRoutes } from '../routes/match.js';

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Hello from Express!' });
});

app.use("/matches", matchRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
