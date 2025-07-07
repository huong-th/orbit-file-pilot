import React from 'react';

import MainContent from '@/components/MainContent';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';

const Index = () => {
  return (
    <AudioPlayerProvider>
      <div className="flex-1 flex flex-col overflow-hidden">
        <MainContent sidebarOpen={true} />
      </div>
    </AudioPlayerProvider>
  );
};

export default Index;
