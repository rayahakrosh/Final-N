const API_BASE_URL = 'http://localhost:3000/api/projects'; 

window.app = {
    showView: (viewId) => {
        document.querySelectorAll('.view').forEach(view => view.style.display = 'none');
        if(viewId === 'crud-form-view') {
             document.getElementById(viewId).style.display = 'flex';
        } else {
             document.getElementById(viewId).style.display = 'block';
        }
    },
    fetchProjects: async () => {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Failed to fetch projects.');
            const projects = await response.json();
            window.app.renderProjects(projects);
        } catch (error) {
            console.error("Error fetching projects:", error);
            alert(`Failed to connect to server. Ensure Node.js is running on port 3000.`);
        }
    },

    renderProjects: (projects) => {
        const grid = document.getElementById('projects-grid');
        grid.innerHTML = ''; 

        if (projects.length === 0) {
            grid.innerHTML = '<p style="text-align: center;">No projects found. Click "+ Add New Project" to start.</p>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.onclick = () => window.app.showProjectDetails(project.id); 
            
            const stars = '★'.repeat(Math.min(5, project.rating)) + '☆'.repeat(Math.max(0, 5 - Math.min(5, project.rating)));

            card.innerHTML = `
                <img src="${project.imageUrl}" alt="${project.name}" onerror="this.src='images/default-proj.jpg';">
                <div class="card-content">
                    <h3>${project.name}</h3>
                    <p class="card-description">${project.description}</p>
                    <p class="card-date">Due: 22/02/2024/p> <div class="card-footer">
                        <span class="rating-stars">${stars}</span>
                        <div class="action-buttons">
                            <button class="edit-btn" onclick="event.stopPropagation(); window.app.editProject('${project.id}')">Edit</button>
                            <button class="rate-btn" onclick="event.stopPropagation(); window.app.rateProject('${project.id}', '${project.name}')">+1 Rating</button>
                            <button class="delete-btn" onclick="event.stopPropagation(); window.app.deleteProject('${project.id}', '${project.name}')">Delete</button>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    },
    
    showAllProjects: () => {
        window.app.showView('all-projects-view');
        window.app.fetchProjects(); 
    },
    
    previewImage: (event) => {
        const reader = new FileReader();
        reader.onload = function() {
            const output = document.getElementById('image-preview');
            output.src = reader.result;
        };
        if (event.target.files[0]) {
            reader.readAsDataURL(event.target.files[0]);
        }
    },

    showForm: (project = null) => {
        document.getElementById('form-title').textContent = project ? 'Edit' : 'Add New';
        document.getElementById('crud-form').reset();
        document.getElementById('image-preview').src = 'images/default-proj.jpg';
        if (project) {
            document.getElementById('project-id').value = project.id;
            document.getElementById('name').value = project.name;
            document.getElementById('description').value = project.description;
            document.getElementById('project-current-image-url').value = project.imageUrl; 
            document.getElementById('image-preview').src = project.imageUrl;
            document.getElementById('rating-display').value = Math.min(5, project.rating); 
        } else {
            document.getElementById('project-id').value = '';
            document.getElementById('project-current-image-url').value = '';
            document.getElementById('rating-display').value = 3; 
        }

        window.app.showView('crud-form-view');
    },

    editProject: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Failed to fetch project for edit');
            const project = await response.json();
            window.app.showForm(project); 
        } catch (error) {
            alert('An error occurred while fetching project data for editing.');
        }
    },

    handleFormSubmission: async function(e) {
        e.preventDefault();

        const id = document.getElementById('project-id').value;
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const imageFile = document.getElementById('project-image-upload').files[0];
        const currentImageUrl = document.getElementById('project-current-image-url').value;
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);

        if (imageFile) {
            formData.append('projectImage', imageFile); 
        } else if (id && currentImageUrl) {
            formData.append('existingImage', currentImageUrl);
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/${id}` : API_BASE_URL;

        try {
            const response = await fetch(url, {
                method: method,
                body: formData 
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error saving project'); 
            }

            alert(`Project saved successfully!`);
            window.app.showAllProjects();
        } catch (error) {
            console.error("Error saving project:", error.message);
            alert(`Error: ${error.message}`);
        }
    },
    showProjectDetails: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Failed to fetch project details');
            const project = await response.json();

            document.getElementById('detail-name').textContent = project.name;
            document.getElementById('detail-image').src = project.imageUrl;
            document.getElementById('detail-image').onerror = function() { this.src='images/default-proj.jpg'; };
            document.getElementById('detail-description').textContent = project.description;
            document.getElementById('detail-rating').textContent = project.rating;
            
            const rateButton = document.getElementById('rate-button');
            rateButton.onclick = () => window.app.rateProject(project.id, project.name);

            window.app.showView('project-details-view');
        } catch (error) {
            alert('An error occurred while fetching project details.');
            window.app.showAllProjects();
        }
    },
    
    deleteProject: async (id, name) => {
        if (!confirm(`Are you sure you want to delete the project "${name}" permanently?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });

            if (!response.ok) throw new Error('Failed to delete project');
            
            alert(`Project "${name}" deleted successfully.`);
            window.app.fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
            alert(`Error deleting project.`);
        }
    },
    
    rateProject: async (id, name) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}/rate`, { method: 'POST' });

            const updatedProject = await response.json();

            if (!response.ok) throw new Error('Rating failed');
            
            document.getElementById('detail-rating').textContent = updatedProject.rating;
            alert(`Thank you! Project "${name}" rated. New rating: ${updatedProject.rating}`);
            
            window.app.fetchProjects(); 
        } catch (error) {
            alert(`Error rating project.`);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.app.showAllProjects();
    document.getElementById('crud-form').onsubmit = window.app.handleFormSubmission;
});