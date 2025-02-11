const { Router } = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { adminModel, courseModel } = require('../db');
const { adminAuth } = require('../middleware/auth');
const { z } = require('zod')
const adminRouter = Router()

adminRouter.post('/signup', async (req, res) => {

    const adminSignupRequireBody = z.object({
        email: z.string().min(6).max(100).email(),
        password: z.string().min(6),
        firstname: z.string(),
        lastname: z.string()
    })

    const parsedBody = adminSignupRequireBody.safeParse(req.body)

    if (!parsedBody.success) {
        res.status(400).json({
            success: false,
            message: "Validation failed"
        })
        return
    }

    const { email, password, firstname, lastname } = parsedBody.data;

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

    const adminSignInRequiredBody = z.object({
        email: z.string().min(6).max(100).email(),
        password: z.string().min(6),
    })

    const parsedBody = adminSignInRequiredBody.safeParse(req.body)

    if (!parsedBody.success) {
        res.status(400).json({
            success: false,
            message: "Validation failed"
        })
        return
    }

    const { email, password } = parsedBody.data

    const admin = await adminModel.findOne({ email })

    if (!admin) {
        return res.status(404).json({
            success: false,
            message: "Admin not found"
        })
    }

    const comparePassword = bcrypt.compare(password, admin.password)

    if (admin && comparePassword) {

        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        res.cookie("token", token)
            .status(200)
            .json({
                success: true,
                message: "Admin signin successfull"
            })
    }

})

adminRouter.post('/create-course', adminAuth, async (req, res) => {

    const createCourseRequiredBody = z.object({
        title: z.string(),
        desc: z.string(),
        price: z.number(),
    })

    const parsedBody = createCourseRequiredBody.safeParse(req.body)

    if (!parsedBody.success) {
        res.status(400).json({
            success: false,
            message: "Validation failed"
        })
        return
    }

    const { title, desc, price } = parsedBody.data;

    const course = await courseModel.create({
        title,
        desc,
        price,
        adminId: req.adminId
    })

    if (course) {
        res.status(200).json({
            success: true,
            message: "course created successful",
            course
        })
    }
})

adminRouter.put('/update-course:courseId', adminAuth, async (req, res) => {

    const updateCourseRequiredBody = z.object({
        title: z.string(),
        desc: z.string(),
        price: z.string()
    })

    const parsedBody = updateCourseRequiredBody.safeParse(req.body)

    if (!parsedBody.success) {
        res.status(400).json({
            success: false,
            message: "Validation failed"
        })
        return
    }

    const { courseId } = req.params;
    const { title, desc, price } = parsedBody.data;

    const updateCourse = await courseModel.findOneAndUpdate({
        courseId
    }, {
        title,
        desc,
        price
    },
        { new: true })

    await courseModel.save()

    if (!updateCourse) {
        res.status(401).json({
            success: false,
            message: "Course not found"
        })
        return
    }

    res.status(200).json({
        success: true,
        message: "Course update successfull",
        updateCourse
    })
})

adminRouter.post('/delete-course:courseId', adminAuth, async (req, res) => {
    const { courseId } = req.params;
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