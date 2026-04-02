// src/utils/formatProject.js 
function formatProject(project) {
  if (Array.isArray(project)) {
    return project.map(formatProject);
  }
    if (!project) return null;

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