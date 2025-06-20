const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/paytm-practice");

const UserSchema = new mongooose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    password: String
})

const User = mongoose.model("User", UserSchema);

module.exports = {User};
