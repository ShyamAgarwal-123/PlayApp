import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";


const app = express();


//configure 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true
}))
//configure 
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({limit: "16kb",extended: true}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from "./routes/user.routes.js";


//routes declaration
app.use("/api/v1/users",userRouter)
//http://localhost:8000/api/v1/users then calls the userRouter

export {app};