import { useEffect, useMemo, useState } from 'react'
import { Search, ShoppingBag, Menu, Heart, ArrowRight, Sparkles, Store, Plus, X, CheckCircle2 } from 'lucide-react'

const API = 'http://127.0.0.1:5000/api'
const demoProducts = [
  {id:'d1',name:'Festive Pearl Toran',category:'Torans',description:'A colourful handcrafted toran for your entrance.',price:799,image_url:'/products/toran.jpg',seller_name:"Sharam's Decor"},
  {id:'d2',name:'Traditional Wall Hanging',category:'Wall Hangings',description:'A bright traditional wall accent with decorative tassels.',price:649,image_url:'/products/wall-hanging.jpg',seller_name:"Sharam's Decor"},
  {id:'d3',name:'Pearl Flower Tea Light Set',category:'Diyas & Lights',description:'Decorative flower-shaped tea light holders for festive evenings.',price:999,image_url:'/products/tea-lights.jpg',seller_name:"Sharam's Decor"},
  {id:'d4',name:'Handmade Door Hanging Set',category:'Wall Hangings',description:'Colourful handcrafted hanging decorations for your home.',price:899,image_url:'/products/hanging-set.jpg',seller_name:"Sharam's Decor"},
  {id:'d5',name:'Decorative Mirror',category:'Wall Decor',description:'A statement mirror with a traditional geometric frame.',price:1199,image_url:'/products/mirror.jpg',seller_name:"Sharam's Decor"},
  {id:'d6',name:'Festive Rangoli Mat',category:'Rangoli',description:'Bright festive floor decoration for celebrations.',price:549,image_url:'/products/rangoli.jpg',seller_name:"Sharam's Decor"},
  {id:'d7',name:'Handmade Beaded Bandhanwar',category:'Torans',description:'A vibrant handmade decorative bandhanwar for special occasions.',price:749,image_url:'/products/bandhanwar.jpg',seller_name:"Sharam's Decor"}
]
const categories = ['All','Torans','Wall Hangings','Diyas & Lights','Wall Decor','Rangoli']

function App() {
  const [products,setProducts] = useState(demoProducts)
  const [category,setCategory] = useState('All')
  const [search,setSearch] = useState('')
  const [cart,setCart] = useState([])
  const [showCart,setShowCart] = useState(false)
  const [showSeller,setShowSeller] = useState(false)
  const [notice,setNotice] = useState('')
  const [form,setForm] = useState({name:'',category:'Torans',description:'',price:'',image_url:'',seller_name:'',stock:'1'})

  useEffect(() => {
    fetch(`${API}/products`).then(r => {if(!r.ok) throw new Error(); return r.json()})
      .then(data => { if(Array.isArray(data) && data.length) setProducts(data) })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => products.filter(p =>
    (category === 'All' || p.category === category) &&
    `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(search.toLowerCase())
  ),[products,category,search])
  const cartCount = cart.reduce((n,item)=>n+item.qty,0)
  const total = cart.reduce((n,item)=>n+Number(item.price)*item.qty,0)
  const addToCart = p => { setCart(old => {const found=old.find(x=>x.id===p.id); return found ? old.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x) : [...old,{...p,qty:1}]}); setNotice('Added to your bag'); setTimeout(()=>setNotice(''),2200) }
  const submitProduct = async e => {
    e.preventDefault()
    try {
      const response = await fetch(`${API}/products`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,price:Number(form.price),stock:Number(form.stock)})})
      const data = await response.json()
      if(!response.ok) throw new Error(data.error || 'Could not list product')
      setProducts(old=>[data,...old]); setShowSeller(false); setForm({name:'',category:'Torans',description:'',price:'',image_url:'',seller_name:'',stock:'1'})
      setNotice('Your product is now listed!'); setTimeout(()=>setNotice(''),2500)
    } catch(err) { setNotice(err.message + ' — check that Flask and Neon are running.'); setTimeout(()=>setNotice(''),4000) }
  }

  return <div>
    <div className="announcement">A little tradition, a lot of love <span>✦</span> Handmade décor for beautiful homes</div>
    <header className="header">
      <a className="brand" href="#"><span className="brand-mark">S</span><span>SHARAM'S <em>DECOR</em><small>HANDMADE • HEARTMADE</small></span></a>
      <nav><a href="#home">Home</a><a href="#shop">Shop</a><a href="#story">Our Story</a><button className="nav-sell" onClick={()=>setShowSeller(true)}>Sell with us <ArrowRight size={15}/></button></nav>
      <div className="header-actions"><button aria-label="Open cart" className="icon-btn" onClick={()=>setShowCart(true)}><ShoppingBag/><b>{cartCount}</b></button><button className="mobile-menu"><Menu/></button></div>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={15}/> THE ART OF INDIAN HOMES</div><h1>Make every corner<br/>feel <i>celebrated.</i></h1><p>Thoughtfully handcrafted torans, festive accents and little details that turn a house into your happy place.</p><div className="hero-actions"><a className="primary-btn" href="#shop">Explore the collection <ArrowRight size={17}/></a><button className="text-btn" onClick={()=>setShowSeller(true)}>I'm a creator <span>↗</span></button></div><div className="hero-note"><span>✦</span> Made by hand, cherished at home</div></div>
        <div className="hero-image"><img src="/products/hero.jpg" alt="Handcrafted Indian festive decoration"/><div className="hero-stamp">MADE WITH<br/><strong>LOVE</strong><br/>IN INDIA</div></div>
      </section>

      <section className="trust-row"><div><span>✧</span><b>Handcrafted finds</b><small>Made with care</small></div><div><span>❀</span><b>Made by creators</b><small>Celebrate local talent</small></div><div><span>♡</span><b>Festive feels</b><small>For every special day</small></div></section>

      <section className="shop-section" id="shop">
        <div className="section-heading"><div><div className="eyebrow">A COLLECTION TO LOVE</div><h2>Find your little <i>something.</i></h2><p>Pieces that bring warmth, colour and character to your home.</p></div><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search décor..."/></div></div>
        <div className="filters">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="product-grid">{filtered.map((p,i)=><article className="product-card" key={p.id}><div className="product-image"><img src={p.image_url?.startsWith('http')?p.image_url:p.image_url||'/products/hero.jpg'} onError={e=>{e.currentTarget.src='/products/hero.jpg'}} alt={p.name}/><button className="heart" aria-label="Save product"><Heart size={17}/></button><span className="product-tag">{i%2===0?'HANDMADE':'ARTISAN PICK'}</span></div><div className="product-info"><div className="product-category">{p.category}</div><h3>{p.name}</h3><div className="product-bottom"><strong>₹{Number(p.price).toLocaleString('en-IN')}</strong><button onClick={()=>addToCart(p)}>Add to bag <Plus size={14}/></button></div><small>By {p.seller_name || "Sharam's Decor"}</small></div></article>)}</div>
        {filtered.length===0&&<div className="empty">No pieces found. Try another search or category.</div>}
      </section>

      <section className="creator-banner" id="story"><div className="creator-art"><img src="/products/bandhanwar.jpg" alt="Handmade decor detail"/></div><div><div className="eyebrow">A MARKETPLACE WITH MEANING</div><h2>Your hands make it.<br/><i>Our community</i> celebrates it.</h2><p>Are you a maker, crafter or small business? Bring your creations to a community that loves handmade décor. List your products and let more homes discover your work.</p><button className="primary-btn" onClick={()=>setShowSeller(true)}>Become a seller <ArrowRight size={17}/></button></div></section>
    </main>

    <footer><div className="footer-brand">SHARAM'S <em>DECOR</em></div><p>Little details. Beautiful traditions. Homes full of heart.</p><div className="footer-bottom">© 2026 Sharam's Decor · Made with love in India</div></footer>

    {notice&&<div className="toast"><CheckCircle2 size={17}/>{notice}</div>}
    {showCart&&<div className="overlay" onClick={()=>setShowCart(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><h2>Your bag ({cartCount})</h2><button onClick={()=>setShowCart(false)}><X/></button></div>{cart.length===0?<div className="empty">Your bag is waiting for something lovely.</div>:<>{cart.map(item=><div className="cart-item" key={item.id}><img src={item.image_url||'/products/hero.jpg'}/><div><b>{item.name}</b><small>₹{Number(item.price).toLocaleString('en-IN')} × {item.qty}</small></div><button onClick={()=>setCart(old=>old.filter(x=>x.id!==item.id))}>Remove</button></div>)}<div className="cart-total"><span>Subtotal</span><b>₹{total.toLocaleString('en-IN')}</b></div><p className="cart-note">Checkout and payment will be enabled after payment gateway setup.</p></>}</aside></div>}
    {showSeller&&<div className="overlay" onClick={()=>setShowSeller(false)}><section className="seller-modal" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><div className="eyebrow">JOIN OUR CREATOR COMMUNITY</div><h2>List your creation</h2></div><button onClick={()=>setShowSeller(false)}><X/></button></div><p className="modal-intro">Have something handmade and lovely? Add it to the Sharam's Decor collection.</p><form onSubmit={submitProduct}><label>Product name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Pearl toran"/></label><div className="form-row"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</select></label><label>Price (₹)<input required type="number" min="1" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label></div><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Tell customers what makes it special"/></label><label>Product image URL<input value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="https://..."/></label><div className="form-row"><label>Your shop / name<input value={form.seller_name} onChange={e=>setForm({...form,seller_name:e.target.value})} placeholder="Your name"/></label><label>Stock<input type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label></div><button className="primary-btn full" type="submit">Submit product for listing <ArrowRight size={16}/></button><small className="form-help">Demo note: this starter currently lists products directly. Add seller verification and admin approval before public launch.</small></form></section></div>}
  </div>
}
export default App
