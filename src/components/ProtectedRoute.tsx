import type React from "react"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import type { RootState } from "../app/store"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "ADMIN" | "USER"
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { token, role } = useSelector((state: RootState) => state.auth)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 px-6 py-4 border border-red-400 rounded-lg text-red-700">
          <h2 className="mb-2 font-bold text-xl">Доступ запрещен</h2>
          <p>У вас нет прав для доступа к этой странице.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
