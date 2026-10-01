import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ProjectModal from './ProjectModal';

const Layout = () => {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState('create'); // 'create' or 'edit'

  const handleOpenCreateModal = () => {
    setProjectModalMode('create');
    setIsProjectModalOpen(true);
  };

  const handleOpenEditModal = () => {
    setProjectModalMode('edit');
    setIsProjectModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar onCreateProjectClick={handleOpenCreateModal} />

      {/* Main App Work Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Global Action Header */}
        <Header onEditProjectClick={handleOpenEditModal} />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 p-6 custom-scrollbar">
          <div className="mx-auto max-w-7xl h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Modal overlays */}
      {isProjectModalOpen && (
        <ProjectModal
          mode={projectModalMode}
          onClose={() => setIsProjectModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
