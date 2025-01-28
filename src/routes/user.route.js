import { Router } from "express";
import { registerUser,loginUser,logoutUser, refreshAccesToken } from "../controllers/user.controller.js";
const router = Router();
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';
router.route("/register").post(
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
    registerUser)

router.route("/login").post(loginUser)


//secured Routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccesToken)
export default router