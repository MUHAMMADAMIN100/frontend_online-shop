import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCart, removeCartItem, updateCartItem } from '../features/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../features/orders/ordersSlice';

export default function Cart() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);
  const items = useAppSelector(s => s.cart.items);
  const nav = useNavigate();

  useEffect(() => {
    if (auth.userId) dispatch(fetchCart(auth.userId));
  }, [dispatch, auth.userId]);

  const handleCheckout = async () => {
    if (!auth.token) return nav('/login');
    await dispatch(createOrder());
    nav('/orders'); // you may create /orders page later
  };

  return (
    <div>
      <h1 className="mb-4 font-bold text-2xl">Cart</h1>
      {items.length === 0 ? <div>Your cart is empty</div> : (
        <div className="space-y-3">
          {items.map(it => (
            <div key={it.id} className="flex justify-between items-center bg-white p-3 border rounded">
              <div>
                <div className="font-medium">{it.product?.name}</div>
                <div className="text-gray-600 text-sm">{it.quantity} × {it.product?.price}$</div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => dispatch(updateCartItem({ cartItemId: it.id, quantity: Math.max(1, it.quantity - 1) }))}>-</button>
                <div>{it.quantity}</div>
                <button onClick={() => dispatch(updateCartItem({ cartItemId: it.id, quantity: it.quantity + 1 }))}>+</button>
                <button onClick={() => dispatch(removeCartItem(it.id))} className="text-red-600">Remove</button>
              </div>
            </div>
          ))}
          <div>
            <button onClick={handleCheckout} className="bg-green-600 px-4 py-2 rounded text-white">Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}
