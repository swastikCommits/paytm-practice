require("dotenv").config();
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
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

   const token = jwt.sign({userId}, process.env.JWT_SECRET);

   res.status(200).json({
    message: "User created successfully",
    token: token
   })
})




const signInBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async (req, res) => {

    const { success } = signInBody.safeParse(req.body);
    if(!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username, 
        password: req.body.password
    });
    if(!user) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    if(!isPasswordCorrect) {        
        return res.status(411).json({
            message: "Incorrect password"
        })
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET);

    res.status(200).json({
        message: "User signed in successfully",
        token: token
    })
    

})



const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/", authMiddleware, async (req, res) => {

    const { success } = updateBody.safeParse(req.body);
    if(!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    await User.updateOne(req.body, {
        _id: req.userId
    })

    res.status(200).json({
        message: "Updated successfully"
    })

})

module.exports = router;
