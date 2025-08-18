import express from 'express'
import {getMyProjects, createProject} from '../controllers/projectControllers.js'

const router = express.Router()

router.get("/projects", getMyProjects)

router.post("/projects", createProject)


export default router