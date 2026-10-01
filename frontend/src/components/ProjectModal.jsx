import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { X, FolderPlus, Save, AlertCircle } from 'lucide-react';

const ProjectModal = ({ mode, onClose }) => {
  const { createProject, updateProject, currentProject } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && currentProject) {
      setName(currentProject.name);
      setDescription(currentProject.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [mode, currentProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    let res;

    if (mode === 'create') {
      res = await createProject(name, description);
    } else {
      res = await updateProject(currentProject._id, { name, description });
    }

    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-violet-500" />
            {mode === 'create' ? 'Create New Project' : 'Project Settings'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
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
            <label htmlFor="p-name" className="block text-sm font-medium text-slate-300">
              Project Name
            </label>
            <input
              id="p-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input mt-1 block w-full rounded-xl py-3 px-4 text-sm transition-all"
              placeholder="e.g. Acme Website Redesign"
            />
          </div>

          <div>
            <label htmlFor="p-desc" className="block text-sm font-medium text-slate-300">
              Description (Optional)
            </label>
            <textarea
              id="p-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input mt-1 block w-full rounded-xl py-3 px-4 text-sm transition-all resize-none"
              placeholder="Enter project goals, objectives, or instructions..."
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {mode === 'create' ? 'Create Project' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
