
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTheme } from 'next-themes';

const DarkModeToggle: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentTheme = themeOptions.find(option => option.value === theme) || themeOptions[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 rounded-xl hover:bg-accent/50 transition-all duration-300 hover:scale-110 z-10"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`cursor-pointer ${theme === option.value ? 'bg-accent' : ''}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {option.label}
              {theme === option.value && resolvedTheme && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {option.value === 'system' ? `(${resolvedTheme})` : ''}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DarkModeToggle;
