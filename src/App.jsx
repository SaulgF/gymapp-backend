import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Rutinas from './pages/Rutinas'
import RutinaDetalle from './pages/RutinaDetalle'
import EditarRutina from './pages/EditarRutina'
import AgregarEjercicio from './pages/AgregarEjercicio'
import EditarEjercicio from './pages/EditarEjercicio'
import IniciarEntrenamiento from './pages/IniciarEntrenamiento'
import Ejercicios from './pages/Ejercicios'
import Entrenamientos from './pages/Entrenamientos'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router basename="/gym">
        <div className="min-h-screen bg-dark-300">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/rutinas" element={
              <ProtectedRoute>
                <Layout>
                  <Rutinas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/rutinas/:id" element={
              <ProtectedRoute>
                <Layout>
                  <RutinaDetalle />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/rutinas/:id/editar" element={
              <ProtectedRoute>
                <Layout>
                  <EditarRutina />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/rutinas/:id/agregar-ejercicio" element={
              <ProtectedRoute>
                <Layout>
                  <AgregarEjercicio />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/rutinas/:rutinaId/ejercicios/:ejercicioId/editar" element={
              <ProtectedRoute>
                <Layout>
                  <EditarEjercicio />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/rutinas/:id/entrenar" element={
              <ProtectedRoute>
                <Layout>
                  <IniciarEntrenamiento />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/ejercicios" element={
              <ProtectedRoute>
                <Layout>
                  <Ejercicios />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/entrenamientos" element={
              <ProtectedRoute>
                <Layout>
                  <Entrenamientos />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
