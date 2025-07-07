import { Menu, Search, Grid, List, User, Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import LogoutButton from '@/components/auth/LogoutButton';
import DarkModeToggle from '@/components/DarkModeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.ts';
import { setViewMode } from '@/store/slices/navigationSlice.ts';
import { setSearchQuery } from '@/store/slices/viewSlice';

import type { RootState } from '@/store/store.ts';

interface TopNavigationProps {
  onSidebarToggle: () => void;
  onSidebarCollapse: () => void;
  sidebarCollapsed: boolean;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onSidebarToggle, onSidebarCollapse }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const searchQuery = useAppSelector((s: RootState) => s.view.searchQuery);
  const viewMode = useAppSelector((s: RootState) => s.navigation.viewMode);

  return (
    <header className="sticky top-0 h-16 glass-subtle border-b border-border/30 flex justify-between items-center gap-4 px-6 backdrop-blur-xl z-30 flex-shrink-0 shadow-md">
      {/* Left section */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Mobile sidebar toggle */}
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder={t('navigation.search')}
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="pl-12 glass-subtle border border-border/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/30 rounded-xl h-10 transition-all duration-300 shadow-sm hover:shadow-md hover-glow font-medium placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* View toggle (desktop) */}
        <div className="hidden md:flex glass-subtle rounded-xl p-1 border border-border/30 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(setViewMode('grid'))}
            className={`p-2.5 rounded-lg ${
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
            onClick={() => dispatch(setViewMode('list'))}
            className={`p-2.5 rounded-lg ${
              viewMode === 'list'
                ? 'gradient-primary text-white shadow-md scale-105'
                : 'hover:bg-background/60 text-muted-foreground hover:text-foreground hover:scale-105'
            }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Desktop-only controls */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-border/60 to-transparent mx-2" />
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full p-0 ml-1 hover:bg-accent/50 transition-all duration-300 hover:scale-110 hover-glow"
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="gradient-primary text-white text-xs font-semibold">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 glass-card border border-border/40 shadow-xl rounded-2xl p-2"
            align="end"
          >
            <div className="px-3 py-3">
              <p className="text-sm font-semibold text-foreground">
                {t('navigation.user.profile')}
              </p>
              <p className="text-xs text-muted-foreground">{t('navigation.user.email')}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/settings')}
              className="cursor-pointer rounded-lg hover:bg-accent/60 font-medium"
            >
              <Settings className="w-4 h-4 mr-2" /> {t('navigation.user.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-accent/60 font-medium">
              <LogoutButton variant="ghost" size="sm" showIcon showText />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNavigation;
