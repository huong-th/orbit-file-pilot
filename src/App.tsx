import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SessionManager from '@/components/auth/SessionManager';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import UploadProgressPopup from '@/components/UploadProgressPopup.tsx';
import AccountSettings from '@/pages/AccountSettings.tsx';
import Dashboard from '@/pages/Dashboard';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Register from '@/pages/Register.tsx';
import ReportScreen from '@/pages/ReportScreen';
import SearchScreen from '@/pages/SearchScreen';
import { setReduxDispatch } from '@/services/api';
import { store } from '@/store/store';

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
                            <Route path="/reports" element={<ReportScreen />} />
                            <Route path="/search" element={<SearchScreen />} />
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

    <UploadProgressPopup />
  </Provider>
);

export default App;
