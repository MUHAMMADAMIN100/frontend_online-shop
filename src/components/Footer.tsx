import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: "#1A1A1A", color: "#D9CFC0", fontFamily: "Montserrat" }}>
      {/* Итальянская полоска */}
      <div style={{ height: 4, background: "linear-gradient(to right, #008000 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #FF0000 66.66%)" }} />

      <div className="footer-grid">

        {/* Логотип и описание */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, border: "1.5px solid #8B0000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 600, color: "#FFFFFF", letterSpacing: 1 }}>DR</span>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#FFFFFF", letterSpacing: 4, fontWeight: 500 }}>DORRO</span>
          </div>
          <p style={{ fontSize: 11, lineHeight: 1.8, color: "#9A9A9A", maxWidth: 220 }}>
            Итальянский стиль. Спортивное качество. Каждый товар — воплощение страсти к движению.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {/* Instagram */}
            <a href="#" style={{ width: 34, height: 34, border: "1px solid #444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A9A9A", textDecoration: "none", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#FF0000"; (e.currentTarget as HTMLElement).style.color = "#FF0000"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#444"; (e.currentTarget as HTMLElement).style.color = "#9A9A9A"; }}
              title="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
            </a>
            {/* Telegram */}
            <a href="#" style={{ width: 34, height: 34, border: "1px solid #444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A9A9A", textDecoration: "none", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#008000"; (e.currentTarget as HTMLElement).style.color = "#008000"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#444"; (e.currentTarget as HTMLElement).style.color = "#9A9A9A"; }}
              title="Telegram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
            </a>
            {/* VK */}
            <a href="#" style={{ width: 34, height: 34, border: "1px solid #444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A9A9A", textDecoration: "none", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#FF0000"; (e.currentTarget as HTMLElement).style.color = "#FF0000"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#444"; (e.currentTarget as HTMLElement).style.color = "#9A9A9A"; }}
              title="ВКонтакте">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.785 16.241s.288-.032.436-.19c.136-.145.132-.418.132-.418s-.02-1.279.576-1.467c.588-.185 1.341 1.236 2.14 1.783.605.414 1.065.323 1.065.323l2.142-.03s1.12-.068.589-1.047c-.044-.073-.311-.648-1.597-1.834-1.346-1.24-1.165-1.04.455-3.188.988-1.313 1.383-2.115 1.26-2.457-.118-.327-.84-.241-.84-.241l-2.411.015s-.179-.024-.311.055c-.13.077-.212.258-.212.258s-.382 1.015-.891 1.879c-1.074 1.819-1.503 1.915-1.678 1.803-.408-.262-.306-1.059-.306-1.624 0-1.764.268-2.5-.521-2.692-.262-.063-.454-.104-1.123-.11-.859-.009-1.585.002-1.996.204-.274.133-.485.43-.356.447.159.021.519.097.71.357.246.335.237 1.086.237 1.086s.141 2.074-.33 2.332c-.323.177-.767-.184-1.718-1.83-.489-.847-.858-1.785-.858-1.785s-.07-.174-.198-.268c-.154-.114-.37-.149-.37-.149l-2.289.015s-.344.01-.47.159c-.113.133-.009.41-.009.41s1.793 4.195 3.821 6.311c1.861 1.946 3.976 1.817 3.976 1.817h.957z"/></svg>
            </a>
          </div>
        </div>

        {/* Навигация */}
        <div>
          <h4 style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#FFFFFF", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 20 }}>
            Навигация
          </h4>
          {[
            { label: "Каталог", to: "/" },
            { label: "Корзина", to: "/cart" },
            { label: "Мои заказы", to: "/orderHistory" },
            { label: "Войти", to: "/login" },
            { label: "Регистрация", to: "/register" },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{ display: "block", fontSize: 12, color: "#9A9A9A", textDecoration: "none", marginBottom: 10, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#FFFFFF"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#9A9A9A"}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Контакты */}
        <div>
          <h4 style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#FFFFFF", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 20 }}>
            Контакты
          </h4>
          {[
            { icon: "📍", label: "Адрес", value: "Москва, ул. Спортивная, 12" },
            { icon: "📞", label: "Телефон", value: "+7 (999) 123-45-67" },
            { icon: "✉️", label: "Email", value: "info@dorro.ru" },
            { icon: "🕐", label: "Режим работы", value: "Пн–Вс: 9:00 – 21:00" },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#555", margin: 0, marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontSize: 12, color: "#9A9A9A", margin: 0 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* О магазине */}
        <div>
          <h4 style={{ fontSize: 10, letterSpacing: 4, textTransform: "uppercase", color: "#FFFFFF", fontFamily: "Montserrat", fontWeight: 600, marginBottom: 20 }}>
            О магазине
          </h4>
          <p style={{ fontSize: 12, color: "#9A9A9A", lineHeight: 1.8, marginBottom: 16 }}>
            DORRO — ваш надёжный партнёр в мире спортивной моды. Мы предлагаем широкий ассортимент одежды и обуви ведущих брендов.
          </p>
          <div style={{ borderLeft: "3px solid #8B0000", paddingLeft: 14 }}>
            <p style={{ fontSize: 11, color: "#9A9A9A", margin: 0, lineHeight: 1.7 }}>
              Официальный партнёр Nike, Adidas, Under Armour, Puma
            </p>
          </div>
        </div>
      </div>

      {/* Нижняя полоса */}
      <div className="footer-bottom">
        <p style={{ fontSize: 10, color: "#555", margin: 0, letterSpacing: 1 }}>
          © {year} DORRO. Все права защищены.
        </p>
        <p style={{ fontSize: 10, color: "#444", margin: 0, letterSpacing: 1 }}>
          Итальянский стиль · Спортивное качество
        </p>
      </div>
    </footer>
  );
}
