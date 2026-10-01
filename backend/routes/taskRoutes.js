import express from 'express';
import {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Apply protect middleware to all task routes

router.route('/')
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.get('/project/:projectId', getProjectTasks);
router.put('/kanban/reorder', reorderTasks);

export default router;
