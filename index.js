// index.js

const express = require('express');
const cors = require('cors');
const projectRoutes = require('./routes/products_R'); 
const path = require('path'); 

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

app.use(express.static(__dirname)); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/api/projects', projectRoutes); 

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});