const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { Account } = require("../db");
const mongoose = require("mongoose");

router.get("/balance", authMiddleware, async (req, res) => {

    const account = await Account.findOne({
        userId: req.userId
    })
    res.json({
        balance: account.balance
    })
    
})

router.post("/transfer", authMiddleware, async (req, res) => {
    // Start a MongoDB transaction session to ensure atomicity
    const session = await mongoose.startSession();

    // Begin the transaction
    session.startTransaction();
    
    // Extract amount to transfer and recipient user ID from request body
    const { amount, to } = req.body;

    // Find the sender's account within the transaction session
    const account = await Account.findOne({ userId: req.userId }).session(session);

    // Check if sender's account exists and has sufficient balance
    if (!account || account.balance < amount) {
        // If not, abort transaction and return error
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    // Find recipient's account within the transaction session
    const toAccount = await Account.findOne({ userId: to }).session(session);

    // Check if recipient's account exists
    if (!toAccount) {
        // If not, abort transaction and return error
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }

    // Deduct amount from sender's account using $inc operator
    await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
    
    // Add amount to recipient's account using $inc operator
    await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

    // Commit the transaction if all operations succeeded
    await session.commitTransaction();
    
    // Return success message
    res.json({
        message: "Transfer successful"
    });
})

module.exports = router;
