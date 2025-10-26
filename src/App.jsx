import './App.css'
import React from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { AppRouter } from './router'
import { ThemeProvider } from './components/ThemeProvider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Layout({ children }) {
  const location = useLocation();
  
  // Check if current route is a dashboard route that should use sidebar layout
  const isDashboardRoute = location.pathname.startsWith('/dashboard/teacher') || 
                          location.pathname.startsWith('/dashboard/admin') ||
                          location.pathname.startsWith('/dashboard/student');
  
  // If it's a dashboard route, don't show navbar and footer (they're handled by the layout components)
  if (isDashboardRoute) {
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
      <Navbar />
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
