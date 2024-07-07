import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErrors.js";
import {User} from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// functions for Access and Refresh Token generator
const generateAccessToken = async (userid) =>{
    try {
        const user = await User.findById(userid);
        const accessToken = user.generateAccessToken();
        return { accessToken }
    } catch (error) {
        throw new ApiError(500,"Something went Wrong while creating Access Token")
    }
}

const generateRefreshToken = async (userid) =>{
    try {
        const user = await User.findById(userid);
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        return { refreshToken }
    } catch (error) {
        throw new ApiError(500,"Something went Wrong while creating Refresh Token")
    }
}



// controller for register
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
    return res.status(200).json(
        new ApiResponse(200,userCreated,"User is Successfully Registerd")
    )

})

// controller for login
const loginUser = asyncHandler( async (req,res)=>{ 
    //take login credentials from the user(password & (email,username))
    const {email,password} = req.body
    //check all fileds are their 
    if(password ==="" || email===""){
        throw new ApiError(400,"All Fields are Required")
    }
    //validate the user from data base
    const foundedUser = await User.findOne({email : email})
    if(!foundedUser){
        throw new ApiError(404,"User not found")
    }
    const isPasswordValid = await foundedUser.isPasswordCorrect(password)
    // const isPasswordCorrect = await bcrypt.compare(password,foundedUser.password)
    if (!isPasswordValid) {
        throw new ApiError(401,"Password is incorrect")
    }
    //acceskey and refresh key 
    const {accessToken} = await generateAccessToken(foundedUser._id)
    const {refreshToken} = await generateRefreshToken(foundedUser._id)
    // login user
    const loginUser = await User.findById(foundedUser._id).select(
        "-password -refreshToken"
    )
    //create cookie option
    const option = {
        httpOnly: true,
        secure: true
    }
    //return response
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse(
            200,
            {
                user: loginUser,accessToken,refreshToken

            },
            "User has Successfully Logged In"
        )
    )
    
})

//controller for logout
const logOutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set : {refreshToken : ""}// check in future
    })
    const option = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
        new ApiResponse(200,{},"user logged out Successfully")
    )

})

//controller for refresh AccessToken
const refreshAccessToken= asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(400,"Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const foundedUser = await User.findById(decodedToken?._id)
        if (!foundedUser) {
            throw new ApiError(400,"Invalid Refresh Token")
        }
        if (incomingRefreshToken !== foundedUser?.refreshToken) {
            throw new ApiError(400,"Reresh Token is Expired")
        }
        const {accessToken} = await generateAccessToken(foundedUser._id)
        const option = {
            httpOnly: true,
            secure: true
        }
        return res
        .status(200)
        .cookie("accessToken",accessToken,option)
        .json(
            new ApiResponse(
                200,
            {accessToken},
            "Access Token is Successfully Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }

})


//controller for password update

const userPasswordUpdate =asyncHandler( async(req,res)=>{
    const {oldPassword,newPassword} = req.body;
    if (newPassword === "" || oldPassword ==="") {
        throw new ApiError(401,"Password is Required")
    }
    if (oldPassword === newPassword) {
        throw new ApiError(401,"New Password is Required") 
    }
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404,"User not found")
    }
    const isPassword = await user.isPasswordCorrect(oldPassword);

    if (!isPassword) {
        throw new ApiError(400,"Password is Incorrect")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user.select(
            "-password -refreshToken"),
            "Password is Successfully Changed"
        )
    )



})
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    userPasswordUpdate
} 