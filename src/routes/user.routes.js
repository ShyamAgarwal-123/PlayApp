import { Router } from "express";
import { registerUser,loginUser, logOutUser,refreshAccessToken } from "../controllers/user.controllers.js";
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





export default userRouter;