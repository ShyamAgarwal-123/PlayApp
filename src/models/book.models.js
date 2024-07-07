import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const bookSchema = new mongoose.Schema({
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" 
    },
    bookImage:{
        type:String,
        required:true
    },
    bookImage_id:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    genre:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    price:{
        type: Number,
        required :true
    }
},{timestamps:true});

bookSchema.plugin(mongooseAggregatePaginate);

export const Book = mongoose.model("Book",bookSchema);