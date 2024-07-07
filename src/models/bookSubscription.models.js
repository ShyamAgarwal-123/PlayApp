import mongoose from "mongoose";

const bookSubscriptionSchema = new mongoose.Schema({
    book:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
    },
    buyer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps : true})

export const BookSubscription = mongoose.model("BookSubscription",bookSubscriptionSchema)