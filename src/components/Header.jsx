import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Search, Menu } from 'lucide-react'

const Header = ({ onMenuClick }) => {
  const { user } = useAuth()

  return (
    <header className="bg-dark-100 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Botón hamburguesa para móvil */}
          <button
            onClick={onMenuClick}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            Bienvenido, {user?.nombre}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Barra de búsqueda */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-dark-200 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
            />
          </div>
          
          {/* Botón de búsqueda para móvil */}
          <button className="sm:hidden text-gray-400 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
