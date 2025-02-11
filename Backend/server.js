const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const { userRouter } = require('./routes/user')
const { adminRouter } = require('./routes/admin')

app.use('/api/v1/user', userRouter)
app.use('/api/v1/admin', adminRouter)

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URL_CONN)
    } catch (err) {
        console.log(err);
        console.log("mongoDB connetion failed");
    }

    app.listen(3001, () => 'Server Started...')
}
main()