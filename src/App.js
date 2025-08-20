import React, { useMemo, useState, useEffect, useRef } from "react";

/**
 * VietKy Storefront – single-file React app
 * ---------------------------------------------------------
 * What you get:
 * - Clean, mobile-first Tailwind UI
 * - Navbar with logo, search, filters, sort
 * - Product grid + quick view modal
 * - Cart drawer (persisted via localStorage)
 * - Checkout flow (shipping + payment mock, order summary)
 * - Discount code, shipping methods, tax est.
 * - Minimal "Admin" panel to add/edit products (local only)
 * - i18n-ready text (Vietnamese default)
 * - Image uploader for your logo (stores in localStorage)
 *
 * How to use your real product photos:
 * - Click Admin ▶ Thêm sản phẩm to add your items (áo, cốc, móc khoá, sổ, bình, bút…).
 * - Or edit the DEFAULT_PRODUCTS list below with your filenames/URLs.
 */

// ----------------------- Utils -----------------------
const currency = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n || 0);
const uid = () => Math.random().toString(36).slice(2, 9);
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

// ----------------------- Data -----------------------
const DEFAULT_PRODUCTS = [
  {
    id: uid(),
    name: "Áo thun Việt Ký (Trắng)",
    price: 169000,
    category: "Áo thun",
    stock: 120,
    rating: 4.8,
    images: ["/img-1.jpg"],
    description: "Cotton 100%, in logo Việt Ký mặt trước.",
  },
  {
    id: uid(),
    name: "Cốc sứ Việt Ký",
    price: 99000,
    category: "Phụ kiện",
    stock: 80,
    rating: 4.7,
    images: ["/img-3.jpg"],
    description: "Cốc sứ trắng in đồ họa Việt Ký.",
  },
  {
    id: uid(),
    name: "Móc khóa Việt Ký",
    price: 49000,
    category: "Phụ kiện",
    stock: 200,
    rating: 4.6,
    images: ["/img-2.jpg"],
    description: "Móc khóa mica in chữ 'Tôi Yêu Việt Nam'.",
  },
  {
    id: uid(),
    name: "Sổ tay da Việt Ký",
    price: 110000,
    category: "Phụ kiện",
    stock: 60,
    rating: 4.9,
    images: ["/img-5.jpg"],
    description: "Sổ tay bìa da dập logo.",
  },
  {
    id: uid(),
    name: "Bình giữ nhiệt Việt Ký",
    price: 130000,
    category: "Phụ kiện",
    stock: 70,
    rating: 4.8,
    images: ["/img-6.jpg"],
    description: "Bình 500ml in logo Việt Ký.",
  },
  {
    id: uid(),
    name: "Bút ký Việt Ký",
    price: 99000,
    category: "Phụ kiện",
    stock: 150,
    rating: 4.5,
    images: ["/img-4.jpg"],
    description: "Bút kim loại khắc lazer.",
  },
];

// ----------------------- Components -----------------------
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium text-gray-700 border-gray-200">
    {children}
  </span>
);

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`rounded-2xl px-4 py-2 font-medium shadow-sm hover:shadow transition active:translate-y-[1px] ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${
      props.className || ""
    }`}
  />
);

const Select = ({ options, ...props }) => (
  <select
    {...props}
    className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

const Drawer = ({ open, onClose, title, children, footer }) => (
  <div
    className={`fixed inset-0 z-50 ${
      open ? "pointer-events-auto" : "pointer-events-none"
    }`}
  >
    <div
      className={`absolute inset-0 bg-black/30 transition ${
        open ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    />
    <div
      className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition transform ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button className="text-2xl leading-none" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="h-[calc(100%-8rem)] overflow-y-auto px-5 py-4">
        {children}
      </div>
      <div className="border-t px-5 py-4 bg-gray-50">{footer}</div>
    </div>
  </div>
);

const Modal = ({ open, onClose, children }) => (
  <div className={`fixed inset-0 z-50 ${open ? "" : "hidden"}`}>
    <div className="absolute inset-0 bg-black/30" onClick={onClose} />
    <div className="absolute left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
      {children}
    </div>
  </div>
);

const PlaceholderImage = ({ seed }) => (
  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 grid place-items-center">
    <div className="text-center">
      <div className="text-5xl">🛍️</div>
      <div className="text-xs text-gray-500">Thêm ảnh sản phẩm</div>
    </div>
  </div>
);

// ----------------------- Main App -----------------------
export default function App() {
  const [logoUrl, setLogoUrl] = useState("/img-7.jpg");
  const [tab, setTab] = useState("shop");
  const [products, setProducts] = useState(
    load("vk_products", DEFAULT_PRODUCTS)
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState(load("vk_cart", []));
  const [quickView, setQuickView] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => save("vk_cart", cart), [cart]);
  useEffect(() => save("vk_products", products), [products]);

  const total = useMemo(
    () => cart.reduce((s, i) => s + i.price * i.qty, 0),
    [cart]
  );

  const filtered = useMemo(() => {
    let list = [...products];
    if (query)
      list = list.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);
    if (sort === "popular") list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, query, category, sort]);

  const addToCart = (p, qty = 1) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === p.id);
      if (exists)
        return prev.map((i) =>
          i.id === p.id ? { ...i, qty: i.qty + qty } : i
        );
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          price: p.price,
          qty,
          image: p.images?.[0] || null,
        },
      ];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id, qty) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
    );

  // Checkout calculation
  const shippingFee = total > 500000 ? 0 : 30000;
  const discount = 0; // set via coupon input in drawer footer

  // Admin helpers
  const handleLogoUpload = (e) => {
    alert(
      "Logo mặc định đã được cố định là img-7.jpg. Để thay đổi, vui lòng chỉnh sửa mã nguồn."
    );
  };

  const upsertProduct = (p) => {
    setProducts((list) => {
      const idx = list.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = p;
        return copy;
      }
      return [{ ...p, id: uid() }, ...list];
    });
  };

  const deleteProduct = (id) =>
    setProducts((list) => list.filter((p) => p.id !== id));

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Việt Ký"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-red-800 text-white grid place-items-center font-bold">
                VK
              </div>
            )}
            <div className="font-serif text-xl tracking-wide">VIỆT KÝ</div>
            <Badge>Thời trang & Phụ kiện</Badge>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2 w-1/2">
            <Input
              placeholder="Tìm kiếm sản phẩm…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { label: "Tất cả", value: "all" },
                { label: "Áo thun", value: "Áo thun" },
                { label: "Phụ kiện", value: "Phụ kiện" },
              ]}
            />
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={[
                { label: "Phổ biến", value: "popular" },
                { label: "Giá tăng dần", value: "priceAsc" },
                { label: "Giá giảm dần", value: "priceDesc" },
              ]}
            />
          </div>
          <div className="ml-2 flex items-center gap-2">
            <Button
              className="bg-black text-white flex items-center gap-2"
              onClick={() => setCartOpen(true)}
            >
              Giỏ hàng ({cart.reduce((s, i) => s + i.qty, 0)})
            </Button>
            <Button
              className="hidden md:inline-flex"
              onClick={() => setAdminOpen(true)}
            >
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-10 grid gap-6 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Bộ sưu tập Việt Ký – Tinh thần Việt trong từng chi tiết
          </h1>
          <p className="mt-3 text-neutral-600">
            Ghi dấu bản sắc - Kết nối thế hệ
          </p>
          <div className="mt-5 flex gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <span className="rounded-2xl px-4 py-2 border">
                Tải logo của bạn
              </span>
            </label>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm border">
          <div className="grid grid-cols-3 gap-3">
            {products.slice(0, 3).map((p) => (
              <div key={p.id} className="rounded-2xl border overflow-hidden">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <PlaceholderImage />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-neutral-500">
            *Thêm ảnh thật sản phẩm để tăng tỷ lệ chuyển đổi.
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="mx-auto max-w-7xl px-4">
        <div className="inline-flex rounded-2xl border bg-white p-1 shadow-sm">
          {["shop", "about", "contact"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl ${
                tab === t ? "bg-black text-white" : ""
              }`}
            >
              {t === "shop"
                ? "Cửa hàng"
                : t === "about"
                ? "Giới thiệu"
                : "Liên hệ"}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {tab === "shop" && (
          <div>
            {/* mobile filters */}
            <div className="mb-4 flex gap-2 md:hidden">
              <Input
                placeholder="Tìm kiếm…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { label: "Tất cả", value: "all" },
                  { label: "Áo thun", value: "Áo thun" },
                  { label: "Phụ kiện", value: "Phụ kiện" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className="rounded-3xl bg-white border hover:shadow-md transition overflow-hidden"
                >
                  <button
                    onClick={() => setQuickView(p)}
                    className="block w-full"
                  >
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <PlaceholderImage />
                    )}
                  </button>
                  <div className="p-4">
                    <div className="text-sm text-neutral-500">{p.category}</div>
                    <h3 className="mt-1 font-semibold leading-tight line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-lg font-bold">
                        {currency(p.price)}
                      </div>
                      <Badge>★ {p.rating}</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        className="bg-black text-white flex-1"
                        onClick={() => addToCart(p)}
                      >
                        Thêm vào giỏ
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => setQuickView(p)}
                      >
                        Xem nhanh
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "about" && (
          <section className="prose max-w-none">
            <h2>Về Việt Ký</h2>
            <p>
              Việt Ký tôn vinh bản sắc Việt qua thiết kế tinh giản. Toàn bộ quy
              trình sản xuất hướng tới bền vững, thân thiện môi trường.
            </p>
            <ul>
              <li>Chất liệu: Cotton 100%, giấy tái chế, kim loại bền.</li>
              <li>Thiết kế: Lấy cảm hứng Rồng Việt, bản đồ Việt Nam.</li>
              <li>Bảo hành 1 đổi 1 trong 7 ngày cho lỗi SX.</li>
            </ul>
          </section>
        )}

        {tab === "contact" && (
          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border bg-white p-6">
              <h3 className="text-xl font-semibold">Liên hệ</h3>
              <p className="text-neutral-600">
                Gửi tin nhắn, chúng tôi sẽ phản hồi trong 24h.
              </p>
              <form
                className="mt-4 grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Đã gửi! Cảm ơn bạn.");
                }}
              >
                <Input placeholder="Họ và tên" required />
                <Input placeholder="Email" type="email" required />
                <textarea
                  className="min-h-[120px] rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Nội dung"
                  required
                />
                <Button className="bg-black text-white">Gửi</Button>
              </form>
            </div>
            <div className="rounded-3xl border bg-white p-6">
              <h3 className="text-xl font-semibold">Đăng ký nhận tin</h3>
              <p className="text-neutral-600">
                Nhận ưu đãi sớm và câu chuyện hậu trường.
              </p>
              <div className="mt-4 flex gap-2">
                <Input placeholder="Email của bạn" />
                <Button className="bg-black text-white">Đăng ký</Button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-6 md:grid-cols-4 text-sm">
          <div>
            <div className="font-serif text-lg">VIỆT KÝ</div>
            <p className="mt-2 text-neutral-600">
              © {new Date().getFullYear()} Viet Ky. All rights reserved.
            </p>
          </div>
          <div>
            <div className="font-semibold">Hỗ trợ</div>
            <ul className="mt-2 space-y-1 text-neutral-600">
              <li>Chính sách vận chuyển</li>
              <li>Đổi/Trả & Bảo hành</li>
              <li>Điều khoản & Bảo mật</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Theo dõi</div>
            <ul className="mt-2 space-y-1 text-neutral-600">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>TikTok</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Thanh toán</div>
            <div className="mt-2 flex gap-2 text-xs text-neutral-600">
              VNPAY · Momo · COD
            </div>
          </div>
        </div>
      </footer>

      {/* Quick View Modal */}
      <Modal open={!!quickView} onClose={() => setQuickView(null)}>
        {quickView && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              {quickView.images?.[0] ? (
                <img
                  src={quickView.images[0]}
                  alt={quickView.name}
                  className="aspect-square w-full rounded-2xl object-cover border"
                />
              ) : (
                <PlaceholderImage />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-semibold">{quickView.name}</h3>
              <div className="mt-1 text-neutral-500">
                {quickView.category} • ★ {quickView.rating}
              </div>
              <div className="mt-3 text-3xl font-bold">
                {currency(quickView.price)}
              </div>
              <p className="mt-3 text-neutral-700">{quickView.description}</p>
              <div className="mt-5 flex gap-3">
                <Button
                  className="bg-black text-white"
                  onClick={() => addToCart(quickView)}
                >
                  Thêm vào giỏ
                </Button>
                <Button
                  onClick={() => {
                    addToCart(quickView);
                    setCheckoutOpen(true);
                  }}
                >
                  Mua ngay
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Cart Drawer */}
      <Drawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Giỏ hàng"
      >
        {cart.length === 0 ? (
          <div className="text-center text-neutral-600">Chưa có sản phẩm.</div>
        ) : (
          <div className="space-y-4">
            {cart.map((i) => (
              <div key={i.id} className="flex gap-3 rounded-2xl border p-3">
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                  {i.image ? (
                    <img
                      src={i.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      🛍️
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{i.name}</div>
                  <div className="text-sm text-neutral-500">
                    {currency(i.price)}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="rounded-full border px-2"
                      onClick={() => updateQty(i.id, i.qty - 1)}
                    >
                      -
                    </button>
                    <Input
                      type="number"
                      value={i.qty}
                      onChange={(e) => updateQty(i.id, Number(e.target.value))}
                      className="w-16 text-center"
                    />
                    <button
                      className="rounded-full border px-2"
                      onClick={() => updateQty(i.id, i.qty + 1)}
                    >
                      +
                    </button>
                    <div className="ml-auto">
                      <Button
                        className="text-red-600"
                        onClick={() => removeFromCart(i.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>

      {/* Cart Footer */}
      <div
        className={`fixed bottom-4 left-1/2 z-40 w-[calc(100%-1rem)] max-w-3xl -translate-x-1/2 rounded-2xl border bg-white p-4 shadow-xl ${
          cart.length ? "" : "hidden"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="font-semibold">Tổng tạm tính: {currency(total)}</div>
          <div className="text-sm text-neutral-500">
            Vận chuyển: {shippingFee === 0 ? "Miễn phí" : currency(shippingFee)}
          </div>
          <div className="ml-auto flex gap-2">
            <Button onClick={() => setCartOpen(true)}>Xem giỏ</Button>
            <Button
              className="bg-black text-white"
              onClick={() => setCheckoutOpen(true)}
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Drawer */}
      <Drawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Thanh toán"
        footer={
          <CheckoutFooter
            total={total}
            shippingFee={shippingFee}
            onOrderPlaced={() => {
              setCart([]);
              setCheckoutOpen(false);
              alert("Đặt hàng thành công! Cảm ơn bạn.");
            }}
          />
        }
      >
        <CheckoutForm />
      </Drawer>

      {/* Admin Drawer */}
      <Drawer
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        title="Quản trị (Local)"
      >
        <AdminPanel
          products={products}
          onSave={upsertProduct}
          onDelete={deleteProduct}
          onLogo={() =>
            alert(
              "Logo mặc định đã được cố định là img-7.jpg. Để thay đổi, vui lòng chỉnh sửa mã nguồn."
            )
          }
        />
      </Drawer>
    </div>
  );
}

// ----------------------- Checkout -----------------------
function CheckoutForm() {
  return (
    <form className="grid gap-4">
      <div className="grid gap-2">
        <div className="font-semibold">Thông tin giao hàng</div>
        <Input placeholder="Họ và tên" required />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Input placeholder="Số điện thoại" required />
          <Input placeholder="Email (nhận hoá đơn)" type="email" />
        </div>
        <Input placeholder="Địa chỉ" required />
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Input placeholder="Tỉnh/Thành" required />
          <Input placeholder="Quận/Huyện" required />
          <Input placeholder="Phường/Xã" required />
        </div>
      </div>
      <div className="grid gap-2">
        <div className="font-semibold">Phương thức giao hàng</div>
        <label className="flex items-center gap-3 rounded-xl border p-3">
          <input type="radio" name="ship" defaultChecked /> Giao tiêu chuẩn (2–4
          ngày) – 30.000đ
        </label>
        <label className="flex items-center gap-3 rounded-xl border p-3">
          <input type="radio" name="ship" /> Hoả tốc (24h) – 60.000đ
        </label>
      </div>
      <div className="grid gap-2">
        <div className="font-semibold">Thanh toán</div>
        <label className="flex items-center gap-3 rounded-xl border p-3">
          <input type="radio" name="pay" defaultChecked /> COD (thanh toán khi
          nhận)
        </label>
        <label className="flex items-center gap-3 rounded-xl border p-3">
          <input type="radio" name="pay" /> Chuyển khoản/Ví điện tử
        </label>
      </div>
    </form>
  );
}

function CheckoutFooter({ total, shippingFee, onOrderPlaced }) {
  const [coupon, setCoupon] = useState("");
  const discount =
    coupon.trim().toUpperCase() === "VIETKY10" ? Math.round(total * 0.1) : 0;
  const grand = Math.max(0, total + shippingFee - discount);
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Mã giảm giá"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
        />
        <Badge>DEMO: VIETKY10</Badge>
      </div>
      <div className="grid gap-1 text-sm">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{currency(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Vận chuyển</span>
          <span>{shippingFee === 0 ? "Miễn phí" : currency(shippingFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Giảm giá</span>
          <span>-{currency(discount)}</span>
        </div>
        <div className="mt-1 flex justify-between text-base font-semibold">
          <span>Tổng thanh toán</span>
          <span>{currency(grand)}</span>
        </div>
      </div>
      <Button className="bg-black text-white w-full" onClick={onOrderPlaced}>
        Đặt hàng
      </Button>
    </div>
  );
}

// ----------------------- Admin -----------------------
function AdminPanel({ products, onSave, onDelete, onLogo }) {
  const empty = {
    id: uid(),
    name: "",
    price: 0,
    category: "Áo thun",
    stock: 0,
    rating: 4.8,
    description: "",
    images: [null],
  };
  const [draft, setDraft] = useState(empty);
  const fileRef = useRef(null);

  const pickImage = () => fileRef.current?.click();
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, images: [reader.result] }));
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border p-4 bg-white">
        <div className="mb-2 font-semibold">Logo</div>
        <div className="flex items-center gap-3">
          {onLogo && (
            <>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() =>
                    alert(
                      "Logo mặc định đã được cố định là img-7.jpg. Để thay đổi, vui lòng chỉnh sửa mã nguồn."
                    )
                  }
                />
                <span className="rounded-xl border px-3 py-2">Tải logo</span>
              </label>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="mb-2 font-semibold">Thêm / sửa sản phẩm</div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Tên sản phẩm"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <Input
            placeholder="Giá (VND)"
            type="number"
            value={draft.price}
            onChange={(e) =>
              setDraft({ ...draft, price: Number(e.target.value) })
            }
          />
          <Select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            options={[
              { label: "Áo thun", value: "Áo thun" },
              { label: "Phụ kiện", value: "Phụ kiện" },
            ]}
          />
          <Input
            placeholder="Tồn kho"
            type="number"
            value={draft.stock}
            onChange={(e) =>
              setDraft({ ...draft, stock: Number(e.target.value) })
            }
          />
          <textarea
            className="md:col-span-2 min-h-[90px] rounded-xl border p-3"
            placeholder="Mô tả"
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
          />
          <div className="md:col-span-2 flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
            <Button onClick={pickImage}>Tải ảnh</Button>
            {draft.images?.[0] ? (
              <img
                src={draft.images[0]}
                alt="prev"
                className="h-14 w-14 rounded-lg object-cover border"
              />
            ) : (
              <Badge>Chưa có ảnh</Badge>
            )}
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            className="bg-black text-white"
            onClick={() => {
              onSave(draft);
              setDraft({ ...empty, id: uid() });
            }}
          >
            Lưu sản phẩm
          </Button>
          <Button onClick={() => setDraft({ ...empty, id: uid() })}>
            Làm mới
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border p-4 bg-white">
        <div className="mb-2 font-semibold">
          Danh sách sản phẩm ({products.length})
        </div>
        <div className="grid gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              <div className="h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    🛍️
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-neutral-500">
                  {p.category} • {currency(p.price)}
                </div>
              </div>
              <Button onClick={() => setDraft(p)}>Sửa</Button>
              <Button className="text-red-600" onClick={() => onDelete(p.id)}>
                Xoá
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
