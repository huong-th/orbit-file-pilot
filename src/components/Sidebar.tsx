import {
  Files,
  Image,
  FileText,
  Video,
  Music,
  MoreHorizontal,
  Share,
  Star,
  Trash2,
  BarChart,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import FolderTreeSidebar from '@/components/FolderTreeSidebar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.ts';
import { changeFolder } from '@/store/slices/fileSystemThunks.ts';
import { setCurrentFilter } from '@/store/slices/viewSlice';
import { RootState } from '@/store/store.ts';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, collapsed, onCollapsedChange }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentFolder = useAppSelector((state: RootState) => state.navigation.currentFolderId);
  const currentFilter = useAppSelector((state: RootState) => state.view.currentFilter);

  const mainCategories = [
    {
      id: 'all',
      name: t('sidebar.allFiles'),
      icon: Files,
      isDefault: true,
      path: '/',
      filter: 'all',
    },
    { id: 'pictures', name: t('sidebar.pictures'), icon: Image, path: '/', filter: 'picture' },
    {
      id: 'documents',
      name: t('sidebar.documents'),
      icon: FileText,
      path: '/',
      filter: 'document',
    },
    { id: 'videos', name: t('sidebar.videos'), icon: Video, path: '/', filter: 'video' },
    { id: 'music', name: t('sidebar.music'), icon: Music, path: '/', filter: 'music' },
    { id: 'other', name: t('sidebar.other'), icon: MoreHorizontal, path: '/', filter: 'other' },
  ];

  const actionItems = [
    { id: 'dashboard', name: t('sidebar.dashboard'), icon: BarChart, path: '/dashboard' },
    { id: 'reports', name: t('sidebar.reports', 'Reports'), icon: FileBarChart, path: '/reports' },
    { id: 'share', name: t('sidebar.share'), icon: Share, path: '/', filter: 'share' },
    { id: 'starred', name: t('sidebar.starred'), icon: Star, path: '/', filter: 'starred' },
    { id: 'recycle', name: t('sidebar.recycleBin'), icon: Trash2, path: '/', filter: 'recycle' },
  ];

  const handleCategoryClick = (categoryId: string, filter?: string, path?: string) => {
    if (categoryId === 'dashboard' || categoryId === 'reports') return;

    if (filter) dispatch(setCurrentFilter(filter));
    if (currentFolder !== 'root') {
      dispatch(changeFolder('root'));
      navigate('/');
    }
  };

  const CategoryItem = ({ item, isActive }: { item: any; isActive: boolean }) => {
    const content = (
      <div
        className={`flex items-center transition-all duration-200 group relative ${
          collapsed
            ? 'justify-center p-2.5 mx-1 my-1 rounded-lg'
            : 'gap-3 px-3 py-2.5 mx-2 rounded-xl hover:scale-[1.01]'
        } ${
          isActive
            ? 'bg-accent/30 text-foreground shadow-sm'
            : 'hover:bg-accent/50 text-sidebar-foreground'
        } cursor-pointer`}
      >
        {isActive && !collapsed && (
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
        )}
        {isActive && collapsed && <div className="absolute inset-0 bg-primary/20 rounded-lg" />}
        <item.icon
          className={`transition-transform duration-200 w-5 h-5 ${
            isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          }`}
        />
        {!collapsed && (
          <span
            className={`text-sm font-medium transition-all duration-200 ${
              isActive ? 'font-semibold' : ''
            }`}
          >
            {item.name}
          </span>
        )}
      </div>
    );

    const linkPath =
      item.path + (item.filter && item.filter !== 'all' ? `?type=${item.filter}` : '');

    return collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={linkPath} onClick={() => handleCategoryClick(item.id, item.filter, item.path)}>
            {content}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{item.name}</p>
        </TooltipContent>
      </Tooltip>
    ) : (
      <Link to={linkPath} onClick={() => handleCategoryClick(item.id, item.filter, item.path)}>
        {content}
      </Link>
    );
  };

  let lastActiveMainCategoryId: string | null = null;
  for (let i = mainCategories.length - 1; i >= 0; i--) {
    const category = mainCategories[i];
    const isInFolder = location.pathname.startsWith('/folder');
    const hasTypeParam = location.search.includes(`type=${category.filter}`);
    const isRootWithCorrectFilter = location.pathname === '/' && currentFilter === category.filter;
    if (!isInFolder && (isRootWithCorrectFilter || hasTypeParam)) {
      lastActiveMainCategoryId = category.id;
      break;
    }
  }

  return (
    <TooltipProvider>
      <div
        className={`fixed inset-y-0 left-0 z-50 glass border-r border-sidebar-border transform transition-all duration-300 ease-out ${
          collapsed ? 'w-16' : 'w-60'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0`}
      >
        <div className="flex flex-col h-full">
          <div className={`border-b border-sidebar-border/50 ${collapsed ? 'p-3' : 'p-4'}`}>
            {!collapsed ? (
              <>
                <h2 className="text-lg font-bold text-sidebar-foreground tracking-tight">
                  {t('sidebar.title')}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{t('sidebar.subtitle')}</p>
              </>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Files className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}
            <div className="hidden lg:block mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCollapsedChange(!collapsed)}
                className={`h-8 p-0 hover:bg-accent/50 transition-all duration-200 ${
                  collapsed ? 'w-8 mx-auto' : 'w-full'
                }`}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto sidebar-scrollbar lg:sidebar-no-scroll">
            <div className={`${collapsed ? 'py-4 px-1 space-y-4' : 'p-4 space-y-6'}`}>
              <div className={collapsed ? 'space-y-1' : ''}>
                {!collapsed && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                    {t('sidebar.categories')}
                  </h3>
                )}
                <div className={collapsed ? 'space-y-1' : 'space-y-1'}>
                  {mainCategories.map((category) => {
                    const isActive = category.id === lastActiveMainCategoryId;
                    return <CategoryItem key={category.id} item={category} isActive={isActive} />;
                  })}
                </div>
              </div>
              <div className={collapsed ? 'space-y-1' : ''}>
                {!collapsed && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                    {t('sidebar.actions')}
                  </h3>
                )}
                <div className={collapsed ? 'space-y-1' : 'space-y-1'}>
                  {actionItems.map((item) => {
                    const isActive =
                      item.id === 'dashboard'
                        ? location.pathname === '/dashboard'
                        : item.id === 'reports'
                        ? location.pathname === '/reports'
                        : !location.pathname.startsWith('/folder') &&
                          location.pathname === '/' &&
                          currentFilter === item.filter;
                    return <CategoryItem key={item.id} item={item} isActive={isActive} />;
                  })}
                </div>
              </div>
              {!collapsed && (
                <div>
                  <FolderTreeSidebar />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
    </TooltipProvider>
  );
};

export default Sidebar;
