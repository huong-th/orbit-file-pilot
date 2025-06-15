import React, { useState } from 'react';
import { FileManagerProvider } from '../contexts/FileManagerContext';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import FloatingActionButton from './FloatingActionButton';
import CreateFolderModal from './modals/CreateFolderModal';
import UploadModal from './modals/UploadModal';
import FilePreviewModal from './modals/FilePreviewModal';
import RenameModal from './modals/RenameModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <FileManagerProvider>
      <div className="h-screen bg-background flex w-full overflow-hidden relative">
        {/* Enhanced Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-pink-500/15 to-orange-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-500/15 via-blue-500/20 to-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-500/10 via-teal-500/15 to-cyan-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          
          {/* Mesh gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background opacity-80"></div>
        </div>

        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
        
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopNavigation 
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            onSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className="flex-1 overflow-auto custom-scrollbar">
            {children}
          </main>
        </div>

        <FloatingActionButton />
        
        {/* Modals */}
        <CreateFolderModal />
        <UploadModal />
        <FilePreviewModal />
        <RenameModal />
        <DeleteConfirmModal />
      </div>
    </FileManagerProvider>
  );
};

export default Layout;