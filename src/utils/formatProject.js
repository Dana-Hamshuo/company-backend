// src/utils/formatProject.js 
function formatProject(project) {
    return {
      id: project._id,
      clientId: project.clientId ? {
        id: project.clientId._id,
        name: project.clientId.name
      } : null,
      title: project.title,
      description: project.description,
      status: project.status
    };
  }
  
  module.exports = formatProject;