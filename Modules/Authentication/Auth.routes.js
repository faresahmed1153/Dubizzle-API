// // import {auth} from "../../Middelwares/auth";
import { auth } from "../../Middelwares/auth.js";
import { validation } from "../../Middelwares/validation.js";
import { endPoint } from "./Auth.endpoints.js";
import { SignUpValidator, SignInValidator } from "./Auth.validation.js";
import { SignUp, confirm, Sign_In, Sign_Out } from "./controller/AUthController.js";

import { Router } from "express";
const router = Router();

router.post("/auth/signup", validation(SignUpValidator), SignUp);
router.get("/confirmemail/:token", confirm);
router.post("/auth/signin", validation(SignInValidator), Sign_In);
router.patch("/auth/signout", auth(endPoint.Sign_Out), Sign_Out);

export default router;
