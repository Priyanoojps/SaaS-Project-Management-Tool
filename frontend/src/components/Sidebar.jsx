import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { LayoutDashboard, Users, FolderPlus, Folder, LogOut, ChevronRight } from 'lucide-react';

const Sidebar = ({ onCreateProjectClick }) => {
  const { logout, user } = useAuth();
  const { projects, fetchProjects } = useProjects();
  const { id: activeProjectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-md shadow-violet-500/10">
            <span className="font-display text-lg font-black text-white">A</span>
          </div>
          <span className="font-display text-xl font-bold tracking-wide text-white">Aura</span>
          <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">X</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
        {/* Main Routes */}
        <div className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600/15 text-violet-300 border-l-2 border-violet-500'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>

          {activeProjectId && (
            <NavLink
              to={`/project/${activeProjectId}/team`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-300 border-l-2 border-violet-500'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                }`
              }
            >
              <Users className="h-4 w-4" />
              Project Members
            </NavLink>
          )}
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              My Projects
            </span>
            <button
              onClick={onCreateProjectClick}
              className="rounded p-1 text-slate-500 hover:bg-slate-900 hover:text-slate-200 transition-colors"
              title="Create New Project"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {projects.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-600 italic">No projects yet</p>
            ) : (
              projects.map((project) => {
                const isActive = activeProjectId === project._id;
                return (
                  <Link
                    key={project._id}
                    to={`/project/${project._id}`}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-900/90 text-violet-400'
                        : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Folder className={`h-4 w-4 shrink-0 ${isActive ? 'text-violet-500' : 'text-slate-600 group-hover:text-slate-400'}`} />
                      <span className="truncate">{project.name}</span>
                    </span>
                    <ChevronRight className={`h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-all ${isActive ? 'opacity-100 text-violet-400' : 'text-slate-500'}`} />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* User Footer info */}
      <div className="border-t border-slate-800/80 p-4 bg-slate-950/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 font-display text-sm font-bold text-white uppercase shadow-md shadow-violet-500/5">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {/* Details */}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-200">{user?.name}</p>
              <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
            </div>
          </div>
          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
