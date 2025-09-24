import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`http://localhost:3001/products/${id}`);
      const data = await res.json();
      setProduct(data);
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <p>Загрузка...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{product.name}</h1>
      <img src={product.image} alt={product.name} style={{ width: "300px" }} />
      <p>Цена: {product.price} $</p>
      <p>Категория: {product.category}</p>
      <p>{product.description}</p>

      <button onClick={() => dispatch(addToCart(product))}>
        Добавить в корзину
      </button>
    </div>
  );
}
