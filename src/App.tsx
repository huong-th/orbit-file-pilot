import { Provider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register.tsx';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import { store } from '@/store/store';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster as Sonner } from '@/components/ui/sonner';
import SessionManager from '@/components/auth/SessionManager';
import { setReduxDispatch } from '@/services/api';
import AccountSettings from '@/pages/AccountSettings.tsx';

const queryClient = new QueryClient();

// Tiêm hàm dispatch của store vào module api sau khi store đã được tạo
setReduxDispatch(store.dispatch);

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <SessionManager>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/folder/*" element={<Index />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/settings" element={<AccountSettings />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </SessionManager>
          </TooltipProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
