import Project from "../models/Project.js"

export async function getMyProjects (req, res) {
    try {
        const projects = await Project.find().sort({createdAt: 1});
        res.status(200).json(projects)
    } catch (error) {
        console.log("error in getMyProjects", error)
        res.status(500).json({error: "internal server error"})
    }
}

export async function createProject (req, res) {
    try {
        const newProject = new Project(req.body);
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.log("error in CreateProject", error)
        res.status(500).json({error: "internal server error"})
    }
}
