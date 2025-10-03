const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage }).single('projectImage'); 

let projects = [
    { 
        id: uuidv4(), 
        name: "FinalProject", 
        description: "World!", 
        imageUrl: "images/default-proj.jpg", 
        rating: 4 
    }
];

const validateProject = (data) => {
    if (!data.name || data.name.length < 3) return "Project Name must be at least 3 characters long.";
    if (!data.description || data.description.length < 10) return "Description must be at least 10 characters long.";
    return null; 
};
router.get('/', (req, res) => {
    res.json(projects);
});

router.get('/:id', (req, res) => {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    res.json(project);
});