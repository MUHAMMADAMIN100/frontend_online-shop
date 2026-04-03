import type React from "react"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../app/store"

interface User { id: number; email: string; role: string; createdAt: string; }

const UsersManagement: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setUsers(await r.json())
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const promoteToAdmin = async (userId: number) => {
    if (!confirm("Передать права администратора? Вы потеряете свои права.")) return
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/auth/promote-to-admin/${userId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) { alert("Права переданы."); window.location.href = "/login"; }
      else { const d = await r.json(); alert(d.message || "Ошибка"); }
    } catch { alert("Ошибка") }
  }

  const deleteUser = async (userId: number) => {
    if (!confirm("Удалить пользователя?")) return
    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setUsers(users.filter(u => u.id !== userId))
      else alert("Ошибка при удалении")
    } catch { alert("Ошибка") }
  }

  if (loading) return <p className="serif" style={{ color: '#8B0000', textAlign: 'center', padding: 40, letterSpacing: 2 }}>Caricamento...</p>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: '#008000', fontFamily: 'Montserrat', fontWeight: 600, marginBottom: 4 }}>Gestione Utenti</p>
        <h2 className="serif" style={{ fontSize: 24, color: '#8B0000', fontWeight: 500 }}>Пользователи</h2>
        <div style={{ width: 40, height: 2, backgroundColor: '#FF0000', marginTop: 8 }} />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Montserrat' }}>
          <thead>
            <tr style={{ backgroundColor: '#F7F4EF', borderBottom: '2px solid #D9CFC0' }}>
              {['ID', 'Email', 'Роль', 'Дата регистрации', 'Действия'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#888', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #D9CFC0' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#F7F4EF'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#888' }}>{user.id}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#1A1A1A', fontWeight: 500 }}>{user.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 12px', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600,
                    backgroundColor: user.role === 'ADMIN' ? '#8B0000' : '#008000',
                    color: '#FFFFFF'
                  }}>{user.role}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#888' }}>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                <td style={{ padding: '14px 16px', display: 'flex', gap: 12 }}>
                  {user.role !== 'ADMIN' && (
                    <>
                      <button onClick={() => promoteToAdmin(user.id)} style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#008000', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600 }}>
                        Сделать админом
                      </button>
                      <button onClick={() => deleteUser(user.id)} style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#FF0000', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600 }}>
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsersManagement
