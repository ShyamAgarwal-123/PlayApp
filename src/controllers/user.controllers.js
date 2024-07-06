import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req,res)=>{
    //get details of user from the frontend
    const {fullname, username, email, password} = req.body
    //validation ki empty to nahi
    if (
        [fullname,username,email,password].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400,"All Field is Required")
    }   
    //check if user is unique:email,username
    const existingUser = await User.findOne({
        $or : [{ username },{ email }]
    })
    if (existingUser) {
        throw new ApiError(409,"Username or Email already exists")
    }

    //check for images,check for avatar
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path
    }
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is Required")
    }
    //upload on cloudinary images and avatar,check if avatar is uploaded
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400,"Avatar file is Required")
    }
    //user object creation-create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase(),
    })
    //remove the password and respone token field from the db response
    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //check if user is created
    if (!userCreated) {
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    //return response
    return res.status(201).json(
        new ApiResponse(200,userCreated,"User is Successfully Registerd")
    )

})

export {registerUser} 