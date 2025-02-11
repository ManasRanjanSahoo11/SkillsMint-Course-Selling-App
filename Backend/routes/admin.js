const { Router } = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { adminModel } = require('../db');
const { adminAuth } = require('../middleware/auth');
const adminRouter = Router() 

adminRouter.post('/signup', async (req, res) => {
    const { email, password, firstname, lastname } = req.body;

    const exitingUser = await adminModel.findOne({ email })
    if (exitingUser) {
        res.status(401).json({
            success: false,
            messsage: "Admin already exits"
        })
        return
    }

    const hash = await bcrypt.hash(password, 10)

    const admin = await adminModel.create({
        email,
        password: hash,
        firstname,
        lastname
    })

    res.status(200).json({
        success: true,
        messsage: "Admin created successfully",
        admin
    })
})

adminRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body

    const admin = await adminModel.findOne({ email })

    if (!admin) {
        return res.status(404).json({
            success: false,
            message: "Admin not found"
        })
    }

    const comparePassword = bcrypt.compare(password, admin.password)

    if (admin && comparePassword) {

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" })

        res.cookie("token", token)
            .status(200)
            .json({
                success: true,
                message: "Admin signin successfull"
            })
    }

})

adminRouter.post('/create-course', adminAuth, async (req, res) => {
    const { title, desc, price } = req.body

    const course = await courseModel.create({
        title,
        desc,
        price,
        adminId: admin._id
    })

    if (course) {
        res.status(200).json({
            success: true,
            message: "course created successful",
            course
        })
    }
})

adminRouter.put('/update-courses', adminAuth, async (req, res) => {

})

adminRouter.post('/delete-course', adminAuth, async (req, res) => {
    const { courseId } = req.body;
    const deleteCourse = await courseModel.findOneAndDelete({ courseId })
    if (!deleteCourse) {
        res.status(401).json({
            success: false,
            message: "Something went wrong"
        })
        return
    }

    res.status(200).json({
        success: true,
        message: "Course deleted successful"
    })
})

module.exports = {
    adminRouter
}