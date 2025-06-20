const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const bcrypt = require("bcrypt");

const signUpBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string().min(1),
    lastName: zod.string().min(1),
    password: zod.string().min(1)
})


router.post("/signup", async (req, res) => {

   const { success } = signUpBody.safeParse(req.body);
   if(!success) {
    return res.status(411).json({
        message: "Email already taken/ Incorrect inputs"
    })
   }

   const existingUser = await User.findOne({username: req.body.username});
   if(existingUser) {
    return res.status(411).json({
        message: "Email already taken/ Incorrect inputs"
    })
   }

   const hashedPassword = await bcrypt.hash(req.body.password, 10);

   const user = await User.create({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashedPassword
   })

   const userId = user._id;

   const token = jwt.sign({userId}, JWT_SECRET);

   res.status(200).json({
    message: "User created successfully",
    token: token
   })
})

module.exports = router;
