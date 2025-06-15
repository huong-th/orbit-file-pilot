
import React from 'react';
import { useFileManager } from '../contexts/FileManagerContext';
import { ChevronRight, Home } from 'lucide-react';

const BreadcrumbNavigation: React.FC = () => {
  const { getBreadcrumbs, navigateToPath } = useFileManager();

  const breadcrumbs = getBreadcrumbs();

  const handleBreadcrumbClick = (targetPath: string[]) => {
    navigateToPath(targetPath);
  };

  return (
    <nav className="flex items-center space-x-1 text-sm">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.id}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          )}
          <button
            onClick={() => handleBreadcrumbClick(breadcrumb.path)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 font-medium ${
              index === breadcrumbs.length - 1
                ? 'text-primary bg-primary/10 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            {breadcrumb.id === 'root' && <Home className="w-4 h-4" />}
            <span>{breadcrumb.name}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNavigation;