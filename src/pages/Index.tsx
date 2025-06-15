
import React from 'react';
import MainContent from '../components/MainContent';

const Index = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <MainContent sidebarOpen={true} />
    </div>
  );
};

export default Index;
