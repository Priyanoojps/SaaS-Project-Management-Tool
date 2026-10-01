import React, { useEffect, useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Folder, Users, ClipboardList, CheckCircle2, TrendingUp, ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const { projects, fetchProjects, loadingProjects } = useProjects();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchProjects();
  }, []);

  if (loadingProjects) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  // Calculate Mock Stats
  const projectCount = projects.length;
  // Let's assume some mockup counts for tasks per project just for dash styling
  const totalMembers = projects.reduce((acc, p) => acc + (p.members?.length || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Console Workspace
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor project statuses, team capacity, and task progress metrics.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1 */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-violet-600/5 blur-2xl group-hover:bg-violet-600/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Projects</span>
            <div className="rounded-xl bg-violet-500/10 p-2 text-violet-400">
              <Folder className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-3xl font-bold text-white">{projectCount}</h3>
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>Created across your org</span>
            </p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-fuchsia-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-fuchsia-600/5 blur-2xl group-hover:bg-fuchsia-600/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Collaborators</span>
            <div className="rounded-xl bg-fuchsia-500/10 p-2 text-fuchsia-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-3xl font-bold text-white">{totalMembers}</h3>
            <p className="mt-1 text-xs text-slate-400">Total memberships combined</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-600/5 blur-2xl group-hover:bg-indigo-600/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Task Velocity</span>
            <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-400">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-3xl font-bold text-white">88%</h3>
            <p className="mt-1 text-xs text-slate-400">Task cycle efficiency rate</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-emerald-600/5 blur-2xl group-hover:bg-emerald-600/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">SLA Met</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-3xl font-bold text-white">96.4%</h3>
            <p className="mt-1 text-xs text-slate-400">Tasks closed before deadline</p>
          </div>
        </div>
      </div>

      {/* Projects List Grid */}
      <div>
        <h2 className="font-display text-xl font-bold text-white mb-5 flex items-center gap-2">
          <span>Active Workspaces</span>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-slate-400">
            {projects.length}
          </span>
        </h2>

        {projects.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center rounded-3xl p-12 text-center border border-dashed border-slate-800">
            <Folder className="h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No project workspaces</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              Get started by creating your first project from the sidebar folder icon to configure boards and tasks.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const isOwner = project.owner?._id === user?._id;
              return (
                <Link
                  key={project._id}
                  to={`/project/${project._id}`}
                  className="group glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-slate-900/60 flex flex-col justify-between h-56"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="rounded-xl bg-violet-600/15 p-2.5 text-violet-400 group-hover:bg-violet-600/25 transition-all">
                        <Folder className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>

                    {/* Content */}
                    <h3 className="mt-4 font-display text-lg font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Footer / Members info */}
                  <div className="mt-6 flex items-center justify-between border-t border-slate-800/60 pt-4 text-xs">
                    <span className="text-slate-500 truncate">
                      Owner: <span className="font-semibold text-slate-300">{isOwner ? 'Me' : project.owner?.name}</span>
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      <span className="font-semibold text-slate-300">{project.members?.length || 0}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
