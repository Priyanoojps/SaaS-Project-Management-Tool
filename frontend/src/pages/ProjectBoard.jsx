import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { Plus, Clock, User, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'border-t-blue-500/80 bg-blue-500/5 text-blue-300' },
  { id: 'in_progress', title: 'In Progress', color: 'border-t-amber-500/80 bg-amber-500/5 text-amber-300' },
  { id: 'in_review', title: 'In Review', color: 'border-t-violet-500/80 bg-violet-500/5 text-violet-300' },
  { id: 'done', title: 'Done', color: 'border-t-emerald-500/80 bg-emerald-500/5 text-emerald-300' },
];

const PRIORITY_BADGES = {
  high: 'bg-red-500/10 text-red-400 border-red-500/10',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/10',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
};

const ProjectBoard = () => {
  const { id: projectId } = useParams();
  const {
    currentProject,
    tasks,
    loadingTasks,
    fetchProjectById,
    fetchTasks,
    moveTask,
    setCurrentProject,
  } = useProjects();

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [initialStatusForModal, setInitialStatusForModal] = useState('todo');

  useEffect(() => {
    fetchProjectById(projectId);
    fetchTasks(projectId);

    return () => {
      setCurrentProject(null);
    };
  }, [projectId]);

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId, status) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceStatus', status);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, destStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceStatus = e.dataTransfer.getData('sourceStatus');

    if (!taskId) return;

    // Get current tasks in destination status
    const destColumnTasks = tasks.filter((t) => t.status === destStatus && t._id !== taskId);
    const destTaskIds = destColumnTasks.map((t) => t._id);
    
    // Add the dragged task at the end of the destination order list
    destTaskIds.push(taskId);

    moveTask(projectId, taskId, destStatus, destTaskIds);
  };

  const handleOpenCreateModal = (status) => {
    setSelectedTask(null);
    setInitialStatusForModal(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  if (loadingTasks || !currentProject) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      {/* Board Header Details */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            {currentProject.name}
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl">
            {currentProject.description || 'Manage tasks, assign owners, track due dates, and update statuses.'}
          </p>
        </div>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 gap-5 overflow-x-auto pb-4 md:grid-cols-4 custom-scrollbar h-[calc(100vh-14rem)] items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col max-h-full rounded-2xl border border-slate-800/80 bg-slate-950/20 p-4 shrink-0 shadow-lg"
            >
              {/* Column Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-850 mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-slate-200">{col.title}</span>
                  <span className="rounded-full bg-slate-900 border border-slate-800/60 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenCreateModal(col.id)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-900 hover:text-slate-200 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-0.5 min-h-[150px]">
                {colTasks.length === 0 ? (
                  <div className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/60 text-center p-4">
                    <span className="text-[10px] text-slate-600 italic">No tasks here</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id, col.id)}
                      onClick={() => handleOpenEditModal(task)}
                      className="group cursor-grab active:cursor-grabbing rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all duration-300 hover:border-violet-500/30 hover:bg-slate-900 shadow-md relative overflow-hidden"
                    >
                      {/* Priority Tag */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${PRIORITY_BADGES[task.priority]}`}>
                          {task.priority}
                        </span>
                        
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-display text-sm font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">
                        {task.title}
                      </h4>

                      {/* Description snippet */}
                      {task.description && (
                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Footer: Assignee & due date */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-850 pt-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          {task.assignee ? (
                            <>
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 font-display text-[9px] font-bold text-white uppercase shadow-sm">
                                {task.assignee.name.charAt(0)}
                              </div>
                              <span className="truncate max-w-[80px] font-medium text-slate-300">
                                {task.assignee.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <User className="h-3.5 w-3.5 text-slate-600" />
                              <span className="italic text-slate-600">Unassigned</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation & details Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={selectedTask}
          initialStatus={initialStatusForModal}
          onClose={() => setIsTaskModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProjectBoard;
