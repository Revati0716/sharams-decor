
import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  ShoppingBag,
  Menu,
  Heart,
  ArrowRight,
  Sparkles,
  Plus,
  X,
  CheckCircle2
} from 'lucide-react'

// Local API for development, Render API for live website
const API = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}/api`

// Your existing 7 products
const demoProducts = [
  {
    id: 1,
    name: 'Royal Jhumka Door Toran',
    category: 'Torans',
    description: 'A traditional decorative toran for your entrance.',
    price: 300,
    image_url: '/products/toran.jpg',
    seller_name: 'Sharma Decor',
    stock: 12
  },
  {
    id: 2,
    name: 'Royal Red and Yellow Floral Rangoli Set with Diya Holder',
    category: 'Rangoli',
    description: 'A colourful traditional rangoli decoration.',
    price: 220,
    image_url: '/products/wall-hanging.jpg',
    seller_name: 'Sharma Decor',
    stock: 8
  },
  {
    id: 3,
    name: 'Rajasthani Mirror Diya Holder',
    category: 'Diyas & Lights',
    description: 'A decorative diya holder for festive occasions.',
    price: 100,
    image_url: '/products/tea-lights.jpg',
    seller_name: 'Sharma Decor',
    stock: 10
  },
  {
    id: 4,
    name: 'Traditional Cow and Lotus Wall Decor',
    category: 'Wall Decor',
    description: 'Traditional decorative wall art for your home.',
    price: 180,
    image_url: '/products/hanging-set.jpg',
    seller_name: 'Sharma Decor',
    stock: 6
  },
  {
    id: 5,
    name: 'Multicolour Decorative Diya',
    category: 'Diyas & Lights',
    description: 'Colourful decorative diyas for festive celebrations.',
    price: 220,
    image_url: '/products/mirror.jpg',
    seller_name: 'Sharma Decor',
    stock: 5
  },
  {
    id: 6,
    name: 'Shubh Labh Beaded Door Hanging',
    category: 'Door Hangings',
    description: 'A traditional beaded hanging for your doorway.',
    price: 600,
    image_url: '/products/rangoli.jpg',
    seller_name: 'Sharma Decor',
    stock: 14
  },
  {
    id: 7,
    name: 'Royal Shrinathji Wall Hanging',
    category: 'Wall Hangings',
    description: 'A decorative Shrinathji wall hanging.',
    price: 100,
    image_url: '/products/bandhanwar.jpg',
    seller_name: 'Sharma Decor',
    stock: 9
  }
]

const categories = [
  'All',
  'Torans',
  'Rangoli',
  'Diyas & Lights',
  'Wall Decor',
  'Door Hangings',
  'Wall Hangings'
]

function App() {
  const [products, setProducts] = useState(demoProducts)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showSeller, setShowSeller] = useState(false)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    category: 'Torans',
    description: '',
    price: '',
    image_url: '',
    seller_name: '',
    stock: '1'
  })

  // Load products from Flask and Neon database
  useEffect(() => {
    fetch(`${API}/products`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Could not load products')
        }
        return response.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data)
        }
      })
      .catch(error => {
        console.error('Product loading error:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return products.filter(product =>
      (category === 'All' || product.category === category) &&
      `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [products, category, search])

  const cartCount = cart.reduce((total, item) => total + item.qty, 0)

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  )

  const showMessage = message => {
    setNotice(message)
    setTimeout(() => setNotice(''), 2500)
  }

  // Add product to cart
  const addToCart = product => {
    setCart(oldCart => {
      const existing = oldCart.find(item => item.id === product.id)

      if (existing) {
        return oldCart.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }

      return [...oldCart, { ...product, qty: 1 }]
    })

    showMessage('Added to your bag')
  }

  // Submit a new product
  const submitProduct = async event => {
    event.preventDefault()

    try {
      const response = await fetch(`${API}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          seller_name: form.seller_name.trim() || 'Sharma Decor'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not list product')
      }

      setProducts(oldProducts => [data, ...oldProducts])
      setShowSeller(false)

      setForm({
        name: '',
        category: 'Torans',
        description: '',
        price: '',
        image_url: '',
        seller_name: '',
        stock: '1'
      })

      showMessage('Your product is now listed!')
    } catch (error) {
      showMessage(error.message + '. Please check the backend connection.')
    }
  }

  return (
    <div>
      <div className="announcement">
        A little tradition, a lot of love <span>✦</span>
        Handmade décor for beautiful homes
      </div>

      <header className="header">
        <a className="brand" href="#home">
          <span className="brand-mark">S</span>
          <span>
            SHARMA <em>DECOR</em>
            <small>HANDMADE • HEARTMADE</small>
          </span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#story">Our Story</a>
          <button
            className="nav-sell"
            onClick={() => setShowSeller(true)}
          >
            Sell with us <ArrowRight size={15} />
          </button>
        </nav>

        <div className="header-actions">
          <button
            aria-label="Open cart"
            className="icon-btn"
            onClick={() => setShowCart(true)}
          >
            <ShoppingBag />
            <b>{cartCount}</b>
          </button>

          <button className="mobile-menu" aria-label="Menu">
            <Menu />
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} /> THE ART OF INDIAN HOMES
            </div>

            <h1>
              Make every corner
              <br />
              feel <i>celebrated.</i>
            </h1>

            <p>
              Thoughtfully handcrafted torans, festive accents and
              little details that turn a house into your happy place.
            </p>

            <div className="hero-actions">
              <a className="primary-btn" href="#shop">
                Explore the collection <ArrowRight size={17} />
              </a>

              <button
                className="text-btn"
                onClick={() => setShowSeller(true)}
              >
                I'm a creator <span>↗</span>
              </button>
            </div>

            <div className="hero-note">
              <span>✦</span> Made by hand, cherished at home
            </div>
          </div>

          <div className="hero-image">
            <img
              src="/products/hero.jpg"
              alt="Handcrafted Indian festive decoration"
            />

            <div className="hero-stamp">
              MADE WITH
              <br />
              <strong>LOVE</strong>
              <br />
              IN INDIA
            </div>
          </div>
        </section>

        <section className="trust-row">
          <div>
            <span>✧</span>
            <b>Handcrafted finds</b>
            <small>Made with care</small>
          </div>

          <div>
            <span>❀</span>
            <b>Made by creators</b>
            <small>Celebrate local talent</small>
          </div>

          <div>
            <span>♡</span>
            <b>Festive feels</b>
            <small>For every special day</small>
          </div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <div className="eyebrow">A COLLECTION TO LOVE</div>
              <h2>
                Find your little <i>something.</i>
              </h2>
              <p>
                Pieces that bring warmth, colour and character to your home.
              </p>
            </div>

            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search décor..."
              />
            </div>
          </div>

          <div className="filters">
            {categories.map(item => (
              <button
                key={item}
                className={category === item ? 'active' : ''}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading && <p>Loading products...</p>}

          <div className="product-grid">
            {filtered.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img
                    src={product.image_url || '/products/hero.jpg'}
                    onError={event => {
                      event.currentTarget.src = '/products/hero.jpg'
                    }}
                    alt={product.name}
                  />

                  <button className="heart" aria-label="Save product">
                    <Heart size={17} />
                  </button>

                  <span className="product-tag">
                    {index % 2 === 0 ? 'HANDMADE' : 'ARTISAN PICK'}
                  </span>
                </div>

                <div className="product-info">
                  <div className="product-category">
                    {product.category}
                  </div>

                  <h3>{product.name}</h3>

                  <div className="product-bottom">
                    <strong>
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </strong>

                    <button onClick={() => addToCart(product)}>
                      Add to bag <Plus size={14} />
                    </button>
                  </div>

                  <small>
                    By {product.seller_name || 'Sharma Decor'}
                  </small>
                </div>
              </article>
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="empty">
              No pieces found. Try another search or category.
            </div>
          )}
        </section>

        <section className="creator-banner" id="story">
          <div className="creator-art">
            <img
              src="/products/bandhanwar.jpg"
              alt="Handmade decor detail"
            />
          </div>

          <div>
            <div className="eyebrow">A MARKETPLACE WITH MEANING</div>

            <h2>
              Your hands make it.
              <br />
              <i>Our community</i> celebrates it.
            </h2>

            <p>
              Are you a maker, crafter or small business? Bring your
              creations to a community that loves handmade décor.
              List your products and let more homes discover your work.
            </p>

            <button
              className="primary-btn"
              onClick={() => setShowSeller(true)}
            >
              Become a seller <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          SHARMA <em>DECOR</em>
        </div>

        <p>Little details. Beautiful traditions. Homes full of heart.</p>

        <div className="footer-bottom">
          © 2026 Sharma Decor · Made with love in India
        </div>
      </footer>

      {notice && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}

      {/* Shopping cart */}
      {showCart && (
        <div className="overlay" onClick={() => setShowCart(false)}>
          <aside
            className="drawer"
            onClick={event => event.stopPropagation()}
          >
            <div className="drawer-head">
              <h2>Your bag ({cartCount})</h2>
              <button onClick={() => setShowCart(false)}>
                <X />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty">
                Your bag is waiting for something lovely.
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div className="cart-item" key={item.id}>
                    <img
                      src={item.image_url || '/products/hero.jpg'}
                      alt={item.name}
                    />

                    <div>
                      <b>{item.name}</b>
                      <small>
                        ₹{Number(item.price).toLocaleString('en-IN')} × {item.qty}
                      </small>
                    </div>

                    <button
                      onClick={() =>
                        setCart(oldCart =>
                          oldCart.filter(product => product.id !== item.id)
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="cart-total">
                  <span>Subtotal</span>
                  <b>₹{total.toLocaleString('en-IN')}</b>
                </div>

                <p className="cart-note">
                  Checkout and payment will be enabled after payment gateway setup.
                </p>
              </>
            )}
          </aside>
        </div>
      )}

      {/* Seller form */}
      {showSeller && (
        <div className="overlay" onClick={() => setShowSeller(false)}>
          <section
            className="seller-modal"
            onClick={event => event.stopPropagation()}
          >
            <div className="drawer-head">
              <div>
                <div className="eyebrow">JOIN OUR CREATOR COMMUNITY</div>
                <h2>List your creation</h2>
              </div>

              <button onClick={() => setShowSeller(false)}>
                <X />
              </button>
            </div>

            <p className="modal-intro">
              Have something handmade and lovely? Add it to the
              Sharma Decor collection.
            </p>

            <form onSubmit={submitProduct}>
              <label>
                Product name
                <input
                  required
                  value={form.name}
                  onChange={event =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Pearl toran"
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={event =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    {categories.slice(1).map(item => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Price (₹)
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={event =>
                      setForm({ ...form, price: event.target.value })
                    }
                  />
                </label>
              </div>

              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={event =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Tell customers what makes it special"
                />
              </label>

              <label>
                Product image URL
                <input
                  value={form.image_url}
                  onChange={event =>
                    setForm({ ...form, image_url: event.target.value })
                  }
                  placeholder="https://..."
                />
              </label>

              <div className="form-row">
                <label>
                  Your shop / name
                  <input
                    value={form.seller_name}
                    onChange={event =>
                      setForm({ ...form, seller_name: event.target.value })
                    }
                    placeholder="Your name"
                  />
                </label>

                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={event =>
                      setForm({ ...form, stock: event.target.value })
                    }
                  />
                </label>
              </div>

              <button className="primary-btn full" type="submit">
                Submit product for listing <ArrowRight size={16} />
              </button>

              <small className="form-help">
                Demo note: seller verification and admin approval
                should be added before public launch.
              </small>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
