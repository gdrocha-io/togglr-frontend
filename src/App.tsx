import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { APP_CONFIG } from "@/lib/config";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import FeatureDetail from "./pages/FeatureDetail";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Environments from "./pages/Environments";
import EnvironmentDetail from "./pages/EnvironmentDetail";
import Namespaces from "./pages/Namespaces";
import NamespaceDetail from "./pages/NamespaceDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to={APP_CONFIG.defaultRoute} replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/features"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Features />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/features/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <FeatureDetail />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requireRoot>
                    <AppLayout>
                      <Users />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <ProtectedRoute requireRoot>
                    <AppLayout>
                      <UserDetail />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environments"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Environments />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environments/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <EnvironmentDetail />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/namespaces"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Namespaces />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/namespaces/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <NamespaceDetail />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
