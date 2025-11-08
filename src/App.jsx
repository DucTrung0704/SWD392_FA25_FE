import './App.css'
import React, { useEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AppRouter } from './router'
import { ThemeProvider } from './components/ThemeProvider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Layout({ children }) {
  const location = useLocation();
  const [authKey, setAuthKey] = useState(0);
  
  // Listen for auth state changes to force re-render
  useEffect(() => {
    const handleAuthChange = () => {
      setAuthKey(prev => prev + 1);
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);
  
  // Check if current route uses a dedicated layout (dashboard/study pages)
  const isTeacherDashboard = location.pathname.startsWith('/dashboard/teacher');
  const isAdminDashboard = location.pathname.startsWith('/dashboard/admin');
  const isStudentDashboard = location.pathname.startsWith('/dashboard/student');
  const isDeckStudyPage = /^\/decks\/[^/]+\/study/.test(location.pathname);

  const usesOwnLayout = isTeacherDashboard || isAdminDashboard || isStudentDashboard || isDeckStudyPage;
  
  // If it uses own layout, don't wrap with navbar and footer
  if (usesOwnLayout) {
    return (
      <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
        {children}
        <ToastContainer 
          position="top-right" 
          autoClose={2500} 
          hideProgressBar 
          theme="colored"
          className="dark:bg-gray-800"
        />
      </div>
    );
  }
  
  // For all other routes, show navbar and footer
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      <Navbar key={authKey} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ToastContainer 
        position="top-right" 
        autoClose={2500} 
        hideProgressBar 
        theme="colored"
        className="dark:bg-gray-800"
      />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <AppRouter />
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
