const bcrypt = require('bcrypt')
const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { z } = require('zod')
const userRouter = Router()

const { userAuth } = require('../middleware/auth')

userRouter.post('/signup', async (req, res) => {
    const signupRequiredBody = z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().min(6).max(100).email(),
        password: z.string().min(6)
    })

    const parsedBody = signupRequiredBody.safeParse(req.body)

    if (!parsedBody.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
        })
    }

    const { firstName, lastName, email, password } = parsedBody.data;

    try {
        const exitingUser = await userModel.findOne({ email })

        if (exitingUser) {
            res.json({
                success: false,
                message: "User already exits."
            })
            return
        }

        const hash = await bcrypt.hash(password, 10)

        await userModel.create({
            firstName,
            lastName,
            email,
            password: hash
        })

        res.json({
            success: true,
            message: "User created seccessfully."
        })
    } catch (err) {
        console.log("Signup error", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

})

userRouter.post('/signin', async (req, res) => {
    const signInRequiredBody = z.object({
        email: z.string.min(6).max(100).email(),
        password: z.string.min(6)
    })

    const parsedBody = signInRequiredBody.safeParse(req.body)

    const { email, password } = parsedBody.data

    try {
        const user = await userModel.findOne({ email })

        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        const comparePassword = await bcrypt.compare(password, user.password)

        if (comparePassword) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })

            res.cookie("token", token).status(200).json({
                success: true,
                message: "Signin successful"
            })
        }
    } catch (err) {
        console.log("Signin failed", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

userRouter.get('/all-courses', async (req, res) => {
    try {
        const allCourses = await courseModel.find({})

        res.status(200).json({
            success: true,
            courses: allCourses
        })
    } catch (err) {
        console.log("Error", err);
        res.status(500).json({
            success: false,
            message: "Internal sever error"
        })
    }

})

userRouter.post('/purchase', userAuth, async (req, res) => {
    try {

        const userId = req.userId;

        const { courseId } = req.body

        const purchasedCourse = await purchaseModel.findOne({ courseId })

        if (purchasedCourse) {
            res.json({
                success: false,
                message: "Course already exits"
            })
            return
        }

        const purchaseCourse = await purchaseModel.create({
            courseId,
            userId
        })

        if (purchaseCourse) {
            return res.status(200).json({
                success: true,
                message: "Course purchased Successsfully",
                purchaseCourse
            })
        }

    } catch (err) {
        console.log("Course purchased failed");
        return res.status(500).json({
            success: false,
            message: "Internal server err"
        })
    }
})

userRouter.post('/purchased-course', userAuth, async (req, res) => {
    try {
        const { userId } = req.userId;

        const purchasedCourses = await purchaseModel.find({ userId })

        const purchasedCourseIds = []

        for (let i = 0; i < purchasedCourses.length; i++) {
            purchasedCourseIds.push(purchasedCourses[i].courseId)
        }

        const coursesData = await courseModel.find({
            //The $in operator searches for documents where _id exists in the provided array
            _id: { $in: purchasedCourseIds }
        })

        res.status(200).json({
            success: true,
            purchasedCourses,
            coursesData
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Interval server error"
        })
    }
})

module.exports = {
    userRouter
}