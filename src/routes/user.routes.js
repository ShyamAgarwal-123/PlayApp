import { Router } from "express";
import { registerUser,loginUser, logOutUser,refreshAccessToken,userPasswordUpdate,getCurrentUser,userAvatarUpdate} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const userRouter = Router();
// api end point for register 
userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1

        }
    ]),
    registerUser
);
// route for login
userRouter.route("/login").post(loginUser)


//secured Routes

// route for logout
userRouter.route("/logout").post(verifyJWT,logOutUser)

// route for refreshAccessTohen
userRouter.route("/refresh-token").post(refreshAccessToken)

// route for password update
userRouter.route("/update-password").post(verifyJWT,userPasswordUpdate)

// route to get current user
userRouter.route("/get-crt-user").post(verifyJWT,getCurrentUser)

// route to update
userRouter.route("/update-avatar").post(verifyJWT,
    upload.single("avatar"),
    userAvatarUpdate
) 


export default userRouter;