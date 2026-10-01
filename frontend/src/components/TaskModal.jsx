import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { X, Calendar, AlertCircle, Trash2, CheckCircle2, User } from 'lucide-react';

const TaskModal = ({ task, initialStatus, onClose }) => {
  const { createTask, updateTask, deleteTask, currentProject } = useProjects();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = !!task;

  useEffect(() => {
    if (isEdit) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssignee(task.assignee?._id || task.assignee || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus || 'todo');
      setPriority('medium');
      setAssignee('');
      setDueDate('');
    }
  }, [task, initialStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    const taskData = {
      title,
      description,
      status,
      priority,
      project: currentProject._id,
      assignee: assignee || null,
      dueDate: dueDate || null,
    };

    let res;
    if (isEdit) {
      res = await updateTask(task._id, taskData);
    } else {
      res = await createTask(taskData);
    }
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      const res = await deleteTask(task._id);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/20">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-violet-500" />
            {isEdit ? 'Task Details' : 'Add New Task'}
          </h3>
          <div className="flex items-center gap-2">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="t-title" className="block text-sm font-medium text-slate-300">
              Task Title
            </label>
            <input
              id="t-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input mt-1 block w-full rounded-xl py-2.5 px-4 text-sm transition-all"
              placeholder="e.g. Design Landing Page"
            />
          </div>

          <div>
            <label htmlFor="t-desc" className="block text-sm font-medium text-slate-300">
              Description (Optional)
            </label>
            <textarea
              id="t-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input mt-1 block w-full rounded-xl py-2.5 px-4 text-sm transition-all resize-none"
              placeholder="Provide a detailed description of the task..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="t-status" className="block text-sm font-medium text-slate-300">
                Status
              </label>
              <select
                id="t-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="glass-input mt-1 block w-full rounded-xl py-2.5 px-3 text-sm transition-all bg-slate-900"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="t-priority" className="block text-sm font-medium text-slate-300">
                Priority
              </label>
              <select
                id="t-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="glass-input mt-1 block w-full rounded-xl py-2.5 px-3 text-sm transition-all bg-slate-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="t-assign" className="block text-sm font-medium text-slate-300">
                Assignee
              </label>
              <select
                id="t-assign"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="glass-input mt-1 block w-full rounded-xl py-2.5 px-3 text-sm transition-all bg-slate-900"
              >
                <option value="">Unassigned</option>
                {currentProject?.members?.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="t-date" className="block text-sm font-medium text-slate-300">
                Due Date
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Calendar className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="t-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="glass-input block w-full rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
