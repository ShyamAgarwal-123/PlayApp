import dotenv from 'dotenv';
dotenv.config({
    path : './env'
})
import connetDB from "./db/index.js";

connetDB();

/*
;(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

    } catch (error) {
        console.log("ERROR: ",error);
        throw error
    }
})()
*/