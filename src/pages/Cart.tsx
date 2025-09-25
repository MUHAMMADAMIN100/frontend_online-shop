
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type {AppDispatch } from "../app/store";
import type { RootState } from "../app/store";
import { fetchCart, removeItem, updateItem, clearCart } from "../features/cart/cartSlice";

export default function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.cart);

  
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      dispatch(fetchCart(Number(userId)));
    }
  }, [dispatch, userId]);

  const handleRemove = (id: number) => {
    dispatch(removeItem(id));
  };

  const handleUpdate = (id: number, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateItem({ cartItemId: id, quantity }));
    }
  };

  const handleClear = () => {
    if (userId) {
      dispatch(clearCart(Number(userId)));
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🛒 Ваша корзина</h2>
      {items.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <>
          <ul>
            {items.map((item: any) => (
              <li key={item.id} style={{ marginBottom: "10px" }}>
                <strong>{item.product.name}</strong> — {item.quantity} шт.
                <div>
                  <button onClick={() => handleUpdate(item.id, item.quantity - 1)}>-</button>
                  <button onClick={() => handleUpdate(item.id, item.quantity + 1)}>+</button>
                  <button onClick={() => handleRemove(item.id)}>Удалить</button>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={handleClear}>Очистить корзину</button>
        </>
      )}
    </div>
  );
}
