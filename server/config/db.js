import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();

const DBlink = process.env.DBlink

const connectDB = async () => {
    try {
        await mongoose.connect(DBlink)
        console.log("mongoose connected")
    } catch (error) {
        console.error("error connecting to mongodb", error)
        process.exit(1)
    }
} 

export default connectDB; 