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
    adminId: { type: String, ref: "admin" }
})

const purchaseSchema = mongoose.Schema({
    courseId: { type: String, ref: "course" },
    userId: { type: String, ref: "user" },
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