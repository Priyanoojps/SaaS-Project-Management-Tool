import React, { createContext, useState, useContext } from 'react';
import api from '../utils/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProjectById = async (id) => {
    try {
      const res = await api.get(`/projects/${id}`);
      setCurrentProject(res.data);
      return res.data;
    } catch (err) {
      console.error('Error fetching project detail:', err);
      return null;
    }
  };

  const createProject = async (name, description) => {
    try {
      const res = await api.post('/projects', { name, description });
      setProjects((prev) => [res.data, ...prev]);
      return { success: true, project: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create project',
      };
    }
  };

  const updateProject = async (id, data) => {
    try {
      const res = await api.put(`/projects/${id}`, data);
      setProjects((prev) => prev.map((p) => (p._id === id ? res.data : p)));
      if (currentProject && currentProject._id === id) {
        setCurrentProject(res.data);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update project',
      };
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      if (currentProject && currentProject._id === id) {
        setCurrentProject(null);
        setTasks([]);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to delete project',
      };
    }
  };

  const addMember = async (projectId, email) => {
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email });
      setProjects((prev) => prev.map((p) => (p._id === projectId ? res.data : p)));
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(res.data);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to add member',
      };
    }
  };

  const removeMember = async (projectId, userId) => {
    try {
      const res = await api.delete(`/projects/${projectId}/members/${userId}`);
      setProjects((prev) => prev.map((p) => (p._id === projectId ? res.data : p)));
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(res.data);
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to remove member',
      };
    }
  };

  const fetchTasks = async (projectId) => {
    setLoadingTasks(true);
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      setTasks((prev) => [...prev, res.data]);
      return { success: true, task: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create task',
      };
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, taskData);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
      return { success: true, task: res.data };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update task',
      };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to delete task',
      };
    }
  };

  // Reorder tasks status and order both locally (optimistic UI) and sync to server
  const moveTask = async (projectId, taskId, newStatus, newOrderList) => {
    // 1. Optimistically update local tasks list state
    const originalTasks = [...tasks];
    
    const updatedTasks = tasks.map((t) => {
      if (t._id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    });

    // Sort the tasks within status based on newOrderList ids
    const statusTasks = updatedTasks.filter((t) => t.status === newStatus);
    const otherTasks = updatedTasks.filter((t) => t.status !== newStatus);

    const reorderedStatusTasks = newOrderList
      .map((id, index) => {
        const found = statusTasks.find((t) => t._id === id);
        if (found) {
          return { ...found, order: index };
        }
        return null;
      })
      .filter(Boolean);

    setTasks([...otherTasks, ...reorderedStatusTasks]);

    // 2. Sync to Server
    try {
      const res = await api.put('/tasks/kanban/reorder', {
        projectId,
        taskIds: newOrderList,
        status: newStatus,
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Error saving reorder on server, reverting state:', err);
      setTasks(originalTasks);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        tasks,
        loadingProjects,
        loadingTasks,
        fetchProjects,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject,
        addMember,
        removeMember,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
        setCurrentProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
