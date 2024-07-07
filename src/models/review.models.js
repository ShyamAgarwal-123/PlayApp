import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
    content:{
        type: String,
        required : true,
    },
    book:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    rating:{
        type:Number,
        required:true
    }
},{timestamps:true})



export const Review = mongoose.model("Review",reviewSchema)