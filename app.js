import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectRoutes from './routes/projectRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { connectDB } from './init/db.js';
import ExpressError from './middleware/ExpressError.js';

dotenv.config();
connectDB();

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
// const FRONT_URL = process.env.FRONT_URL || 'http://localhost:5173';
// app.use(cors({ origin: FRONT_URL, credentials: true }));
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS: " + origin));
            }
        },
        credentials: true,
    })
);
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: "true" }))
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/blogs', blogRoutes);
app.use('/contacts', contactRoutes);
app.use((error, req, res, next) => {
    next(new ExpressError(404, "Page not found"))
})
app.use((error, req, res, next) => {
    const { status, message } = error;
    res.status(status).json({ message });
})
export default app;
