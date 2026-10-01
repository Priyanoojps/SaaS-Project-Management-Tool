import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { ChevronRight, Settings, Users, Trash2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ onEditProjectClick }) => {
  const { user } = useAuth();
  const { currentProject, deleteProject } = useProjects();
  const location = useLocation();
  const navigate = useNavigate();

  const isProjectBoard = location.pathname.startsWith('/project/') && !location.pathname.endsWith('/team');
  const isTeamPage = location.pathname.endsWith('/team');

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete "${currentProject?.name}"? All associated tasks will be lost forever.`)) {
      const res = await deleteProject(currentProject._id);
      if (res.success) {
        navigate('/');
      } else {
        alert(res.error);
      }
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/20 px-6 backdrop-blur-md">
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="font-medium text-slate-400 hover:text-slate-200 transition-colors">
          Console
        </Link>
        {currentProject && (location.pathname.startsWith('/project/')) && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <Link to={`/project/${currentProject._id}`} className="font-medium text-slate-200 hover:text-violet-400 transition-colors">
              {currentProject.name}
            </Link>
          </>
        )}
        {isTeamPage && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="font-medium text-slate-400">Members</span>
          </>
        )}
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-3">
        {isProjectBoard && currentProject && (
          <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3.5 mr-1.5">
            {/* View Team */}
            <Link
              to={`/project/${currentProject._id}/team`}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
            >
              <Users className="h-3.5 w-3.5" />
              Members
            </Link>

            {/* If logged in user is owner, show edit/delete */}
            {currentProject.owner?._id === user?._id && (
              <>
                <button
                  onClick={onEditProjectClick}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        )}

        {/* User Info */}
        <span className="text-xs font-medium text-slate-400">
          Welcome, <span className="font-semibold text-slate-200">{user?.name}</span>
        </span>
      </div>
    </header>
  );
};

export default Header;
