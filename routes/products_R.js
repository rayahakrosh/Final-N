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
        name: "Sushi Restaurant", 
        description: "מסעדת סושי מודרנית המציעה מנות טריות ואווירה יפנית ייחודית", 
        imageUrl: "images/soshi restaurant.jpg", 
        rating: 4 
    } ,
    {
         id: uuidv4(), 
        name: "Spontini Pizza", 
        description: "המסעדת פיצה המפורסמת ביותר באיטליה מגישה פיצה אותנטית בטעם נאפולי המסורתי", 
        imageUrl: "images/pizza2.jpg", 
        rating: 5
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
    if (!project) return res.status(404).json({ message: "לא קיים" });
    res.json(project);
});

router.post('/', (req, res) => {
    upload(req, res, (err) => { 
        if (err) return res.status(500).json({ message: " error " });

        const validationError = validateProject(req.body);
        
        if (validationError) {
           
            if (req.file && fs.existsSync(req.file.path)) {
                 fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ message: validationError });
        }
        
        const imageUrl = req.file ? 'images/' + req.file.filename : 'images/default-proj.jpg';

        const newProject = {
            id: uuidv4(), 
            name: req.body.name,
            description: req.body.description,
            imageUrl: imageUrl, 
            rating: 0 
        };

        projects.push(newProject);
        res.status(201).json(newProject);
    });
});

router.put('/:id', (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.status(500).json({ message: " error " });

        const { id } = req.params;
        const projectIndex = projects.findIndex(p => p.id === id);

        if (projectIndex === -1) return res.status(404).json({ message: "לא קיים" });

        const validationError = validateProject(req.body);
        if (validationError) return res.status(400).json({ message: validationError });
        
        let newImageUrl = projects[projectIndex].imageUrl;
        
        if (req.file) {
            newImageUrl = 'images/' + req.file.filename;
        } else if (req.body.existingImage) {
            newImageUrl = req.body.existingImage;
        }

        projects[projectIndex].name = req.body.name || projects[projectIndex].name;
        projects[projectIndex].description = req.body.description || projects[projectIndex].description;
        projects[projectIndex].imageUrl = newImageUrl;

        res.json(projects[projectIndex]);
    });
});

router.delete('/:id', (req, res) => {
    const projectToDelete = projects.find(p => p.id === req.params.id);
    if (!projectToDelete) return res.status(404).json({ message: "לא קיים" });


    projects = projects.filter(p => p.id !== req.params.id);
    
    res.sendStatus(204); 
});

router.post('/:id/rate', (req, res) => {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ message: "לא קיים" });

    project.rating += 1;
    
    res.json(project);
});

module.exports = router;