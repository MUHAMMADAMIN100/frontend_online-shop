// Cart.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../features/cart/cartSlice";
import type { RootState } from "../app/store";

const Cart: React.FC = () => {
  const dispatch = useDispatch<any>();
  const { items, loading } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleAdd = (productId: number) => {
    dispatch(addToCart({ productId, quantity: 1 }));
  };

  const handleRemove = (productId: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    if (item.quantity > 1) {
      dispatch(addToCart({ productId, quantity: -1 }));
    } else {
      dispatch(removeFromCart(item.id));
    }
  };

  const handleDelete = (cartItemId: number) => {
    dispatch(removeFromCart(cartItemId));
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Корзина</h2>
      {items.length === 0 ? (
        <p>Корзина пуста</p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.id} style={{ marginBottom: "10px" }}>
                <div>
                  <strong>{item.product.name}</strong> — ${item.product.price} ×{" "}
                  {item.quantity}
                </div>
                <div>
                  <button onClick={() => handleAdd(item.productId)}>+</button>
                  <button onClick={() => handleRemove(item.productId)}>-</button>
                  <button onClick={() => handleDelete(item.id)}>Удалить</button>
                </div>
              </li>
            ))}
          </ul>
          <p>
            <strong>Итого: ${totalPrice.toFixed(2)}</strong>
          </p>
          <button onClick={handleClear}>Очистить корзину</button>
        </>
      )}
    </div>
  );
};

export default Cart;
