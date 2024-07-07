import mongoose from "mongoose";

const dislikeSchema = new mongoose.Schema({
    review:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Review"
    },
    dislikedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

export const Dislike = mongoose.model("Dislike",dislikeSchema)