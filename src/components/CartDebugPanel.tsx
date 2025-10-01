import { useSelector } from "react-redux"
import type { RootState } from "../app/store"

export default function CartDebugPanel() {
  const token = useSelector((state: RootState) => state.auth.token)
  const cartState = useSelector((state: RootState) => state.cart)

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="right-4 bottom-4 fixed bg-black p-4 rounded-lg max-w-sm text-white text-xs">
      <h3 className="mb-2 font-bold">Debug Info</h3>
      <div>Token: {token ? "✅ Present" : "❌ Missing"}</div>
      <div>Cart Items: {cartState.items.length}</div>
      <div>Loading: {cartState.loading ? "⏳" : "✅"}</div>
      <div>Error: {cartState.error || "None"}</div>
      <div className="mt-2 text-gray-300">Check console for detailed logs</div>
    </div>
  )
}
