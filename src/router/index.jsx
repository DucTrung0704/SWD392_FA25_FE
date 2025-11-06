import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleRoute from '../components/RoleRoute';
import GuestRoute from '../components/GuestRoute';
import ProtectedRoute from '../components/ProtectedRoute';

// Layouts
import TeacherLayout from '../components/layouts/TeacherLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import StudentLayout from '../components/layouts/StudentLayout';

// Views
import Home from '../views/Home';
import Profile from '../views/Profile';
import Exams from '../views/Exams/Exams';
import NotAuthorized from '../views/NotAuthorized';

// Auth Views
import Login from '../views/Auth/Login';
import RegisterStudent from '../views/Auth/RegisterStudent';
import RegisterTeacher from '../views/Auth/RegisterTeacher';
import ForgotPassword from '../views/Auth/ForgotPassword';

// Dashboard Views
import AdminDashboard from '../views/Dashboards/AdminDashboard';
import Users from '../views/Admin/Users';
import Roles from '../views/Admin/Roles';
import Content from '../views/Admin/Content';
import Analytics from '../views/Admin/Analytics';
import System from '../views/Admin/System';
import Reports from '../views/Admin/Reports';
import Settings from '../views/Admin/Settings';
import TeacherDashboard from '../views/Dashboards/TeacherDashboard';
import StudentDashboard from '../views/Dashboards/StudentDashboard';

// Student Views
import StudentStudy from '../views/Student/Study';
import StudentProgress from '../views/Student/Progress';
import StudentLibrary from '../views/Student/Library';
import StudentExams from '../views/Student/Exams';
import MySubmissions from '../views/Student/MySubmissions';
import SubmissionDetail from '../views/Student/SubmissionDetail';

// Teacher Views
import TeacherStudents from '../views/Teacher/Students';
import TeacherFlashcards from '../views/Teacher/Flashcards';
import TeacherDeckDetail from '../views/Teacher/DeckDetail';
import TeacherExams from '../views/Teacher/Exams';
import TeacherExamDetail from '../views/Teacher/ExamDetail';
import TeacherClasses from '../views/Teacher/Classes';
import TeacherAnalytics from '../views/Teacher/Analytics';
import TeacherSettings from '../views/Teacher/Settings';

// Flashcard Views
import Decks from '../views/Flashcards/Decks';
import CreateDeck from '../views/Flashcards/CreateDeck';
import Study from '../views/Flashcards/Study';
import StudySimple from '../views/Flashcards/StudySimple';
import DeckDetail from '../views/Flashcards/DeckDetail';

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes (guest-only) */}
      <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      
      {/* Auth Routes (guest-only) */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register/student" element={<GuestRoute><RegisterStudent /></GuestRoute>} />
      <Route path="/register/teacher" element={<GuestRoute><RegisterTeacher /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
      
      {/* Dashboard Routes */}
      <Route
        path="/dashboard/admin"
        element={
          <RoleRoute roles={["Admin"]}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="roles" element={<Roles />} />
        <Route path="content" element={<Content />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="system" element={<System />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route
        path="/dashboard/teacher"
        element={
          <RoleRoute roles={["Teacher"]}>
            <TeacherLayout />
          </RoleRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="flashcards" element={<TeacherFlashcards />} />
        <Route path="flashcards/:id" element={<TeacherDeckDetail />} />
        <Route path="exams" element={<TeacherExams />} />
        <Route path="exams/:id" element={<TeacherExamDetail />} />
        <Route path="classes" element={<TeacherClasses />} />
        <Route path="analytics" element={<TeacherAnalytics />} />
        <Route path="settings" element={<TeacherSettings />} />
      </Route>
      
      {/* Student Dashboard Routes - Using StudentLayout */}
      <Route
        path="/dashboard/student"
        element={
          <RoleRoute roles={["Student"]}>
            <StudentLayout />
          </RoleRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="library" element={<StudentLibrary />} />
        <Route path="study" element={<StudentStudy />} />
        <Route path="exams" element={<StudentExams />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="submissions" element={<MySubmissions />} />
        <Route path="exams/:submissionId" element={<SubmissionDetail />} />
      </Route>
      
      {/* Protected Profile Route for logged-in users */}
      <Route
        path="/profile"
        element={
          <RoleRoute roles={["Student", "Teacher", "Admin"]}>
            <Profile />
          </RoleRoute>
        }
      />
      
      {/* Flashcard Routes */}
      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <Decks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/decks/create"
        element={
          <RoleRoute roles={["Teacher", "Admin"]}>
            <CreateDeck />
          </RoleRoute>
        }
      />
      <Route
        path="/decks/:id/study"
        element={
          <ProtectedRoute>
            <Study />
          </ProtectedRoute>
        }
      />
      <Route
        path="/decks/:id"
        element={
          <ProtectedRoute>
            <DeckDetail />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
