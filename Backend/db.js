const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
})

const adminSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
})

const courseSchema = mongoose.Schema({
    title: String,
    desc: String,
    price: Number,
    adminId: { type: mongoose.Types.ObjectId, ref: "admin" }
})

const purchaseSchema = mongoose.Schema({
    courseId: { type: mongoose.Types.ObjectId, ref: "course" },
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
})

const userModel = mongoose.model("user", userSchema)
const adminModel = mongoose.model("admin", adminSchema)
const courseModel = mongoose.model("course", courseSchema)
const purchaseModel = mongoose.model("purchase", purchaseSchema)

module.exports = {
    userModel,
    adminModel,
    courseModel,
    purchaseModel
}