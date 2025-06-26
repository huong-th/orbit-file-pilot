
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFileManager } from '../contexts/FileManagerContext';
import { Menu, Search, Upload, Grid, List, User, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useTheme } from 'next-themes';
import LanguageSwitcher from './LanguageSwitcher';
import LogoutButton from './auth/LogoutButton';
import DarkModeToggle from './auth/DarkModeToggle';

interface TopNavigationProps {
  onSidebarToggle: () => void;
  onSidebarCollapse: () => void;
  sidebarCollapsed: boolean;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onSidebarToggle, onSidebarCollapse, sidebarCollapsed }) => {
  const { searchQuery, setSearchQuery, viewMode, setViewMode, openModal } = useFileManager();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 h-16 glass-subtle border-b border-border/30 flex items-center gap-4 px-6 backdrop-blur-xl z-30 flex-shrink-0 shadow-md">
      {/* Left section - Sidebar toggle and Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSidebarToggle}
          className="lg:hidden h-9 w-9 p-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Desktop sidebar collapse toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSidebarCollapse}
          className="hidden lg:flex h-9 w-9 p-0"
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder={t('navigation.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 glass-subtle border border-border/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/30 rounded-xl h-10 transition-all duration-300 shadow-sm hover:shadow-md hover-glow font-medium placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
      </div>

      {/* Right section - Desktop controls */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* View toggle - desktop only */}
        <div className="hidden md:flex glass-subtle rounded-xl p-1 border border-border/30 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-lg transition-all duration-300 ${
              viewMode === 'grid'
                ? 'gradient-primary text-white shadow-md scale-105'
                : 'hover:bg-background/60 text-muted-foreground hover:text-foreground hover:scale-105'
            }`}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-lg transition-all duration-300 ${
              viewMode === 'list'
                ? 'gradient-primary text-white shadow-md scale-105'
                : 'hover:bg-background/60 text-muted-foreground hover:text-foreground hover:scale-105'
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Desktop-only elements */}
        <div className="hidden md:flex items-center gap-1 md:gap-2">
          {/* Separator */}
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-border/60 to-transparent mx-2"></div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme toggle */}
          <DarkModeToggle />
        </div>

        {/* User menu - always visible */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ml-1 hover:bg-accent/50 transition-all duration-300 hover:scale-110 hover-glow">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass-card border border-border/40 shadow-xl rounded-2xl p-2" align="end">
            <div className="px-3 py-3 border-b border-border/30">
              <p className="text-sm font-semibold text-foreground">{t('navigation.user.profile')}</p>
              <p className="text-xs text-muted-foreground">{t('navigation.user.email')}</p>
            </div>
            <DropdownMenuSeparator />
            
            {/* Mobile-only controls */}
            <div className="md:hidden">
              {/* View Mode Toggle */}
              <DropdownMenuItem 
                className="cursor-pointer rounded-lg hover:bg-accent/60 transition-colors duration-200 font-medium" 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid className="w-4 h-4 mr-2" />}
                {viewMode === 'grid' ? t('navigation.user.listView') : t('navigation.user.gridView')}
              </DropdownMenuItem>
              
              {/* Theme Toggle - Mobile only */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{t('navigation.user.theme')}</p>
                <DarkModeToggle />
              </div>
              
              {/* Language Switcher */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{t('navigation.user.language')}</p>
                <LanguageSwitcher />
              </div>
              <DropdownMenuSeparator />
            </div>
            
            <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-accent/60 transition-colors duration-200 font-medium">
              <Settings className="w-4 h-4 mr-2" />
              {t('navigation.user.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <div className="px-2">
              <LogoutButton variant="ghost" size="sm" showIcon={true} showText={true} />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNavigation;
