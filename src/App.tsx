import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
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
                            <Route path="/employees" element={<Employees />} />
                            <Route
                              path="/employees/:id"
                              element={<EmployeeProfile />}
                            />
                            <Route path="/coaches" element={<Coaches />} />
                            <Route
                              path="/coaches/:id"
                              element={<CoachProfile />}
                            />
                            <Route path="/trainees" element={<Trainees />} />
                            <Route
                              path="/trainees/:id"
                              element={<TraineeProfile />}
                            />
                            <Route
                              path="/branches/:id"
                              element={<BranchProfile />}
                            />
                            <Route
                              path="/sports/:id"
                              element={<SportProfile />}
                            />
                            <Route
                              path="/trainee-groups/:id"
                              element={<TraineeGroupProfile />}
                            />
                            <Route
                              path="/enrollments/:id"
                              element={<EnrollmentProfile />}
                            />
                            <Route
                              path="/trainee-groups"
                              element={<TraineeGroups />}
                            />

                            <Route path="/branches" element={<Branches />} />
                            <Route path="/sports" element={<Sports />} />
                            <Route path="/sessions" element={<Sessions />} />
                            <Route
                              path="/enrollments"
                              element={<Enrollments />}
                            />
                            <Route path="/attendance" element={<Attendance />} />
                            <Route path="/attendance/report" element={<AttendanceReport />} />
                            <Route path="/profiles" element={<Profiles />} />
                            <Route
                              path="/users-roles"
                              element={
                                <ProtectedRoute>
                                  <UsersRoles />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/notifications"
                              element={<NotificationsPage />}
                            />
                            <Route
                              path="/video-analysis"
                              element={<VideoAnalysis />}
                            />
                            <Route
                              path="/chat"
                              element={<ChatPage />}
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
