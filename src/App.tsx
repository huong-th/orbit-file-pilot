import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import { store } from "@/store/store";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "@/components/ProtectedRoute";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import SessionManager from "@/components/auth/SessionManager";
import { setReduxDispatch } from '@/services/api';
import AccountSettings from "@/pages/AccountSettings.tsx"; // Import setReduxDispatch

const queryClient = new QueryClient();

// Tiêm hàm dispatch của store vào module api sau khi store đã được tạo
setReduxDispatch(store.dispatch);

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <SessionManager>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={
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
                } />
              </Routes>
            </BrowserRouter>
          </SessionManager>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
