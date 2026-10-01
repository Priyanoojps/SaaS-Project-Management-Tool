import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Trash2, Mail, AlertCircle, ShieldCheck } from 'lucide-react';

const Team = () => {
  const { id: projectId } = useParams();
  const { currentProject, fetchProjectById, addMember, removeMember, setCurrentProject } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjectById(projectId);
    return () => {
      setCurrentProject(null);
    };
  }, [projectId]);

  if (!currentProject) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  const isOwner = currentProject.owner?._id === user?._id;

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please provide a valid email');
      return;
    }

    setLoading(true);
    const res = await addMember(projectId, email);
    setLoading(false);

    if (res.success) {
      setSuccess(`Successfully added user to project!`);
      setEmail('');
    } else {
      setError(res.error);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) {
      setLoading(true);
      const res = await removeMember(projectId, memberId);
      setLoading(false);

      if (res.success) {
        setSuccess(`Removed ${memberName} from team.`);
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl flex items-center gap-3">
          <Users className="h-7 w-7 text-violet-500" />
          Project Team Members
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Manage team workspaces access for: <span className="font-semibold text-slate-300">{currentProject.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Form to Invite Member (Only shown or actionable if authorized) */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <h3 className="font-display text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <UserPlus className="h-4.5 w-4.5 text-violet-500" />
              Add Member
            </h3>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label htmlFor="invite-email" className="block text-xs font-semibold text-slate-400">
                  User Email Address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input block w-full rounded-xl py-2.5 pl-10 pr-3 text-xs transition-all placeholder:text-slate-500"
                    placeholder="teammate@company.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-violet-600 py-2.5 px-4 text-xs font-bold text-white hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Add Member'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Member Directory List */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <h3 className="font-display text-sm font-bold text-slate-200 mb-4">
              Team Directory ({currentProject.members?.length || 0})
            </h3>

            <div className="divide-y divide-slate-800/80">
              {/* Owner Item */}
              <div className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 font-display text-sm font-bold text-white uppercase shadow-md shadow-violet-500/5">
                    {currentProject.owner?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{currentProject.owner?.name}</h4>
                    <p className="text-xs text-slate-500">{currentProject.owner?.email}</p>
                  </div>
                </div>
                <span className="rounded bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-400 border border-violet-500/15">
                  Owner
                </span>
              </div>

              {/* Members List */}
              {currentProject.members
                ?.filter((m) => m._id !== currentProject.owner?._id)
                .map((member) => (
                  <div key={member._id} className="flex items-center justify-between py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 font-display text-sm font-semibold text-slate-300 uppercase">
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{member.name}</h4>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-800">
                        Member
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleRemoveMember(member._id, member.name)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
                          title="Remove Member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

              {currentProject.members?.filter((m) => m._id !== currentProject.owner?._id).length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-500 italic">No other team members added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
