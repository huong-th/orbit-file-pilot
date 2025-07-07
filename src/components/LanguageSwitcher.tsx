import { clsx } from 'clsx';
import { Globe } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Tiếng Việt' },
];

interface LanguageSwitcherProps {
  showText?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ showText = false }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const getCurrentLanguageName = () => {
    const currentLang = languages.find((lang) => lang.code === i18n.language);
    return currentLang?.name || 'English';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={clsx({
            'cursor-pointer rounded-lg hover:bg-accent/60 transition-colors duration-200 font-medium !h-auto':
              showText,
            'h-10 w-10 p-0 rounded-xl hover:bg-accent/50 transition-all duration-300 hover:scale-110 z-10':
              !showText,
          })}
        >
          <Globe className="h-4 w-4" />
          <span className={clsx({ 'sr-only': !showText })}>Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              i18n.language === language.code ? 'bg-muted font-medium' : 'hover:bg-muted/50'
            }`}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
