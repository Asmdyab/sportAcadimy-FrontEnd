import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { Suspense } from "react";
import { useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ScrollToTop } from "./components/ScrollToTop";
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Trainees = React.lazy(() => import("./pages/Trainees"));
const Coaches = React.lazy(() => import("./pages/Coaches"));
const EmployeeProfile = React.lazy(() => import("./pages/EmployeeProfile"));
const CoachProfile = React.lazy(() => import("./pages/CoachProfile"));
const TraineeProfile = React.lazy(() => import("./pages/TraineeProfile"));
const BranchProfile = React.lazy(() => import("./pages/BranchProfile"));
const SportProfile = React.lazy(() => import("./pages/SportProfile"));
const TraineeGroupProfile = React.lazy(() => import("./pages/TraineeGroupProfile"));
const EnrollmentProfile = React.lazy(() => import("./pages/EnrollmentProfile"));
const MyProfile = React.lazy(() => import("./pages/MyProfile"));
const TraineeGroups = React.lazy(() => import("./pages/TraineeGroups"));

const Employees = React.lazy(() => import("./pages/Employees"));
const Branches = React.lazy(() => import("./pages/Branches"));
const Sports = React.lazy(() => import("./pages/Sports"));
const Enrollments = React.lazy(() => import("./pages/Enrollments"));
const Attendance = React.lazy(() => import("./pages/Attendance"));
const AttendanceReport = React.lazy(() => import("./pages/AttendanceReport"));
const Profiles = React.lazy(() => import("./pages/Profiles"));
const UsersRoles = React.lazy(() => import("./pages/UsersRoles"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Sessions = React.lazy(() => import("./pages/Sessions"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const VideoAnalysis = React.lazy(() => import("./pages/VideoAnalysis"));
const ChatPage = React.lazy(() => import("./pages/ChatPage"));
const Index = React.lazy(() => import("./pages/Index"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 60 s — prevents redundant refetches on tab focus
      staleTime: 60_000,
      // Keep unused cache for 5 minutes before garbage-collecting
      gcTime: 5 * 60_000,
      // Retry failed requests twice with exponential back-off
      retry: 2,
      retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 30_000),
      // Refetch on window focus so data stays fresh without manual refresh
      refetchOnWindowFocus: true,
    },
    mutations: {
      // No automatic retry for writes — side-effects must be idempotent to retry
      retry: 0,
    },
  },
});

function getUserIdFromToken(): string | null {
  try {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).sub ?? null;
  } catch {
    return null;
  }
}

function TraineeGuard({ children }: { children: React.ReactNode }) {
  const { hasRole, devUser } = useAuth();
  const isTrainee = hasRole("Trainee");
  if (isTrainee) {
    const traineeId = devUser?.id ?? getUserIdFromToken();
    if (traineeId) {
      return <Navigate to={`/trainees/${traineeId}`} replace />;
    }
  }
  return <>{children}</>;
}

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ErrorBoundary>
                          <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/my-profile" element={<MyProfile />} />
                            <Route path="/employees" element={
                              <ProtectedRoute requiredRole="Admin,Manager">
                                <Employees />
                              </ProtectedRoute>
                            } />
                            <Route
                              path="/employees/:id"
                              element={
                                <ProtectedRoute requiredRole="Admin,Manager">
                                  <EmployeeProfile />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/coaches" element={
                              <ProtectedRoute requiredRole="Admin,Coach,Manager">
                                <Coaches />
                              </ProtectedRoute>
                            } />
                            <Route
                              path="/coaches/:id"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager">
                                  <CoachProfile />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/trainees" element={
                              <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                <TraineeGuard>
                                  <Trainees />
                                </TraineeGuard>
                              </ProtectedRoute>
                            } />
                            <Route
                              path="/trainees/:id"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                  <TraineeProfile />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/branches/:id"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                  <BranchProfile />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/sports/:id"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                  <SportProfile />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/trainee-groups/:id"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager">
                                  <TraineeGroupProfile />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/enrollments/:id"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                  <EnrollmentProfile />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/trainee-groups"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager">
                                  <TraineeGroups />
                                </ProtectedRoute>
                              }
                            />

                            <Route path="/branches" element={
                              <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                <Branches />
                              </ProtectedRoute>
                            } />
                            <Route path="/sports" element={
                              <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                <Sports />
                              </ProtectedRoute>
                            } />
                            <Route path="/sessions" element={
                              <ProtectedRoute requiredRole="Admin,Coach,Manager">
                                <Sessions />
                              </ProtectedRoute>
                            } />
                            <Route
                              path="/enrollments"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                  <Enrollments />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/attendance" element={
                              <ProtectedRoute requiredRole="Admin,Coach,Manager">
                                <Attendance />
                              </ProtectedRoute>
                            } />
                            <Route path="/attendance/report" element={
                              <ProtectedRoute requiredRole="Admin,Coach,Manager">
                                <AttendanceReport />
                              </ProtectedRoute>
                            } />
                            <Route path="/profiles" element={
                              <ProtectedRoute requiredRole="Admin,Manager">
                                <Profiles />
                              </ProtectedRoute>
                            } />
                            <Route
                              path="/users-roles"
                              element={
                                <ProtectedRoute requiredRole="Admin,Manager">
                                  <UsersRoles />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/notifications"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                  <NotificationsPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/video-analysis"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager">
                                  <VideoAnalysis />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/chat"
                              element={
                                <ProtectedRoute requiredRole="Admin,Coach,Manager,Trainee">
                                  <ChatPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </ErrorBoundary>
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
