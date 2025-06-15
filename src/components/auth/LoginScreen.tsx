import React from 'react';
import LoginForm from './LoginForm';
import DarkModeToggle from './DarkModeToggle';
import LanguageSwitcher from '../LanguageSwitcher';

const LoginScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Dark Mode Toggle */}
      <DarkModeToggle />
      
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/15 via-primary/20 to-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Login Form */}
      <LoginForm />
    </div>
  );
};

export default LoginScreen;