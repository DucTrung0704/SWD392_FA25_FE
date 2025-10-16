import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleRoute from '../components/RoleRoute';

// Layouts
import TeacherLayout from '../components/layouts/TeacherLayout';
import AdminLayout from '../components/layouts/AdminLayout';

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

// Flashcard Views
import Decks from '../views/Flashcards/Decks';
import CreateDeck from '../views/Flashcards/CreateDeck';
import Study from '../views/Flashcards/Study';
import StudySimple from '../views/Flashcards/StudySimple';
import DeckDetail from '../views/Flashcards/DeckDetail';

export function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/not-authorized" element={<NotAuthorized />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register/student" element={<RegisterStudent />} />
      <Route path="/register/teacher" element={<RegisterTeacher />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
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
        <Route path="students" element={<div className="p-6">Student Management Page</div>} />
        <Route path="flashcards" element={<div className="p-6">Flashcard Management Page</div>} />
        <Route path="exams" element={<div className="p-6">Exam Management Page</div>} />
        <Route path="classes" element={<div className="p-6">Class Management Page</div>} />
        <Route path="analytics" element={<div className="p-6">Teacher Analytics Page</div>} />
        <Route path="settings" element={<div className="p-6">Teacher Settings Page</div>} />
      </Route>
      
      <Route
        path="/dashboard/student"
        element={
          <RoleRoute roles={["Student"]}>
            <StudentDashboard />
          </RoleRoute>
        }
      />
      
      {/* Flashcard Routes */}
      <Route path="/flashcards" element={<Decks />} />
      <Route path="/decks/create" element={<CreateDeck />} />
      <Route path="/decks/:id/study" element={<Study />} />
      <Route path="/decks/:id" element={<DeckDetail />} />
    </Routes>
  );
}
