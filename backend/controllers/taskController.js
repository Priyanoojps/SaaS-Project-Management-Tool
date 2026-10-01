import Task from '../models/Task.js';
import Project from '../models/Project.js';

// Helper to verify user is part of the project
const verifyProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isOwner = project.owner.toString() === userId.toString();
  const isMember = project.members.some((m) => m.toString() === userId.toString());
  return isOwner || isMember ? project : null;
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export const getProjectTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const isMember = await verifyProjectMember(projectId, req.user._id);

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  const { title, description, status, priority, project, assignee, dueDate } = req.body;

  if (!title || !project) {
    return res.status(400).json({ message: 'Please provide task title and project ID' });
  }

  try {
    const projectExists = await verifyProjectMember(project, req.user._id);
    if (!projectExists) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
    }

    // Get count of tasks in this status to append to end of order
    const taskCount = await Task.countDocuments({ project, status: status || 'todo' });

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      project,
      assignee: assignee || null,
      dueDate: dueDate || null,
      order: taskCount,
    });

    const populatedTask = await Task.findById(task._id).populate('assignee', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify project access
    const projectExists = await verifyProjectMember(task.project, req.user._id);
    if (!projectExists) {
      return res.status(403).json({ message: 'Not authorized to modify tasks in this project' });
    }

    // If status is changing, we can optionally recalculate orders.
    // For simplicity, we just save the task status and properties.
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignee', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify project access
    const projectExists = await verifyProjectMember(task.project, req.user._id);
    if (!projectExists) {
      return res.status(403).json({ message: 'Not authorized to delete tasks in this project' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tasks order/status (Kanban drag and drop updates)
// @route   PUT /api/tasks/kanban/reorder
// @access  Private
export const reorderTasks = async (req, res) => {
  const { taskIds, status, projectId } = req.body;

  if (!taskIds || !status || !projectId) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  try {
    const projectExists = await verifyProjectMember(projectId, req.user._id);
    if (!projectExists) {
      return res.status(403).json({ message: 'Not authorized to reorder tasks' });
    }

    // Update each task's status and order
    const bulkOps = taskIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { status, order: index },
      },
    }));

    await Task.bulkWrite(bulkOps);

    const updatedTasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.json(updatedTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
