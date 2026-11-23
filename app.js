const KEY='dailynest_v1';
// EmailJS order-alert configuration. Replace these three values after creating
// a Gmail service and DailyNest order template in EmailJS.
const EMAILJS_CONFIG = {
  serviceId: 'YOUR_EMAILJS_SERVICE_ID',
  templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
  recipient: 'Sangramlapulga@gmail.com'
};
async function sendDailyNestOrderEmail(order) {
  const ready = Object.values(EMAILJS_CONFIG).slice(0,3).every(v => v && !v.startsWith('YOUR_'));
  if (!ready) return {sent:false, reason:'Email alerts need EmailJS Service ID, Template ID and Public Key.'};
  if (!window.emailjs) return {sent:false, reason:'Email service did not load. Please try again later.'};
  const templateParams = {
    to_email: EMAILJS_CONFIG.recipient,
    order_id: order.id,
    order_date: order.date,
    customer_name: order.customer,
    customer_phone: order.phone,
    order_items: order.items.map(x => x.name+' × '+x.qty+' — '+money(x.price*x.qty)).join('\n'),
    order_total: money(order.total),
    delivery_address: order.address,
    latitude: String(order.latitude),
    longitude: String(order.longitude),
    gps_accuracy: order.accuracy+' metres',
    google_maps_link: order.mapsUrl,
    location_message: 'This order was placed from this location.'
  };
  try {
    await window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams, {publicKey:EMAILJS_CONFIG.publicKey});
    return {sent:true};
  } catch (err) {
    console.error('DailyNest email alert failed', err);
    return {sent:false, reason:'Email could not be sent. Check EmailJS configuration and template.'};
  }
}

const seed=[
{id:1,name:'Kitchen Storage Organizer',category:'Home',price:249,stock:12,description:'Keep your kitchen organized',image:''},
{id:2,name:'Microfiber Cleaning Set',category:'Cleaning',price:149,stock:20,description:'Everyday cleaning essentials',image:''},
{id:3,name:'Bathroom Shelf',category:'Home',price:299,stock:8,description:'Smart space-saving storage',image:''},
{id:4,name:'Foldable Storage Bags',category:'Storage',price:199,stock:15,description:'Organize your belongings',image:''},
{id:5,name:'Multipurpose Cleaning Brush',category:'Cleaning',price:99,stock:30,description:'Simple everyday utility',image:''},
{id:6,name:'Drawer Organizer',category:'Storage',price:179,stock:10,description:'Keep small items in place',image:''}
];
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{products:seed,orders:[]},cart={},category='All';
const $=id=>document.getElementById(id),money=n=>'₹'+Number(n).toLocaleString('en-IN');
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2200)}
function switchView(v){['shopView','ordersView','adminView'].forEach(x=>$(x).hidden=x!==v+'View');['shopTab','ordersTab','adminTab'].forEach(x=>$(x).classList.toggle('active',x===v+'Tab'));if(v==='orders')renderOrders();if(v==='admin')renderAdmin()}
$('shopTab').onclick=()=>switchView('shop');$('ordersTab').onclick=()=>switchView('orders');$('adminTab').onclick=()=>switchView('admin');
$('cartButton').onclick=()=>{$('cartDrawer').hidden=false;renderCart()};$('closeCart').onclick=()=>$('cartDrawer').hidden=true;
function renderFilters(){let cats=['All',...new Set(db.products.map(p=>p.category))];$('filters').innerHTML=cats.map(c=>`<button class="${c===category?'selected':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');$('filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{category=b.dataset.cat;renderFilters();renderProducts()})}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderProducts(){let q=$('search').value.toLowerCase();let ps=db.products.filter(p=>(category==='All'||p.category===category)&&(p.name+' '+p.description).toLowerCase().includes(q));$('productCount').textContent=ps.length+' items';$('products').innerHTML=ps.map(p=>`<article class="product">${p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`:`<div class="placeholder">⌂</div>`}<div class="product-body"><h3>${esc(p.name)}</h3><p>${esc(p.description||p.category)}</p><div class="product-foot"><strong>${money(p.price)}</strong><button data-add="${p.id}" ${p.stock<1?'disabled':''}>${p.stock<1?'Sold out':'Add +'}</button></div><small style="color:#829087">${p.stock} in stock</small></div></article>`).join('')||'<div class="empty">No products found.</div>';$('products').querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{let id=+b.dataset.add;cart[id]=(cart[id]||0)+1;updateCount();toast('Added to your bag')})}
function updateCount(){$('cartCount').textContent=Object.values(cart).reduce((a,b)=>a+b,0)}
function renderCart(){let entries=Object.entries(cart).filter(([id,q])=>q>0).map(([id,q])=>({p:db.products.find(p=>p.id===+id),q})).filter(x=>x.p);$('cartItems').innerHTML=entries.length?entries.map(({p,q})=>`<div class="cart-row"><div><strong>${esc(p.name)}</strong><small>${money(p.price)} each</small></div><div class="qty"><button data-dec="${p.id}">−</button> ${q} <button data-inc="${p.id}">+</button></div></div>`).join(''):'<div class="empty">Your bag is empty.</div>';let total=entries.reduce((a,x)=>a+x.p.price*x.q,0);$('subtotal').textContent=money(total);$('cartItems').querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{let id=b.dataset.dec;cart[id]--;if(cart[id]<=0)delete cart[id];updateCount();renderCart()});$('cartItems').querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{let id=b.dataset.inc;cart[id]++;updateCount();renderCart()})}
$('checkoutForm').onsubmit=async e=>{
e.preventDefault();
const entries=Object.entries(cart).filter(([id,q])=>q>0);
if(!entries.length)return toast('Your bag is empty');
for(const [id,q] of entries){const p=db.products.find(x=>x.id===+id);if(!p||p.stock<q)return toast('Insufficient stock for '+(p?.name||'a product'))}
const f=new FormData(e.target);
if(!f.get('locationConsent'))return toast('Please consent to GPS sharing for delivery.');
if(!navigator.geolocation)return toast('GPS is unavailable in this browser.');
$('locationStatus').textContent='Requesting your GPS location…';
const getPosition=()=>new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:20000,maximumAge:0}));
let pos;try{pos=await getPosition()}catch(err){$('locationStatus').textContent='Location was not shared. Enable Location for Safari and try again.';return toast('GPS permission is required for delivery.')}
const c=pos.coords,mapsUrl='https://www.google.com/maps?q='+c.latitude+','+c.longitude;
const items=entries.map(([id,q])=>{const p=db.products.find(x=>x.id===+id);p.stock-=q;return{name:p.name,price:p.price,qty:q}});
const order={id:'DN'+Date.now().toString().slice(-8),customer:f.get('customer'),phone:f.get('phone'),address:f.get('address'),latitude:c.latitude,longitude:c.longitude,accuracy:Math.round(c.accuracy),mapsUrl,items,total:items.reduce((n,x)=>n+x.price*x.qty,0),status:'Received',date:new Date().toLocaleString()};
db.orders.unshift(order);save();const emailResult=await sendDailyNestOrderEmail(order);cart={};updateCount();renderCart();renderProducts();e.target.reset();$('cartDrawer').hidden=true;switchView('orders');
$('successDetails').textContent='Order '+order.id+' · '+money(order.total)+' · GPS captured (±'+order.accuracy+' m).';
$('orderEmailStatus').textContent=emailResult.sent?'An order alert was emailed to DailyNest.':emailResult.reason+' Your order is saved on this device.';
$('orderSuccess').hidden=false;
};
function renderOrders(){$('ordersList').innerHTML=db.orders.length?db.orders.map(o=>`<div class="panel"><div class="order-row"><strong>${esc(o.id)}</strong><span>${esc(o.date)}</span><b>${money(o.total)}</b></div><p>${o.items.map(i=>`${esc(i.name)} × ${i.qty}`).join('<br>')}</p><p>${esc(o.address)}</p>${o.mapsUrl?`<p><a href="${esc(o.mapsUrl)}" target="_blank" rel="noopener">View delivery GPS location</a></p>`:''}<span class="demo-tag">${esc(o.status)}</span></div>`).join(''):'<div class="empty">No orders yet. Your orders will appear here.</div>'}
$('productForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.products.unshift({id:Date.now(),name:f.get('name').trim(),category:f.get('category').trim(),price:+f.get('price'),stock:+f.get('stock'),image:f.get('image').trim(),description:f.get('description').trim()});save();e.target.reset();renderAdmin();renderFilters();renderProducts();toast('Product added')};
function renderAdmin(){$('statProducts').textContent=db.products.length;$('statOrders').textContent=db.orders.length;$('statSales').textContent=money(db.orders.reduce((a,o)=>a+o.total,0));$('inventory').innerHTML=db.products.map(p=>`<div class="inventory-row"><span><b>${esc(p.name)}</b><br><small>${money(p.price)}</small></span><label style="margin:0">Stock<input type="number" min="0" value="${p.stock}" data-stock="${p.id}"></label><button class="icon-btn" data-del="${p.id}" title="Delete">🗑</button></div>`).join('')||'<p>No products yet.</p>';$('inventory').querySelectorAll('[data-stock]').forEach(i=>i.onchange=()=>{let p=db.products.find(x=>x.id===+i.dataset.stock);p.stock=Math.max(0,+i.value);save();renderProducts();toast('Stock updated')});$('inventory').querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(confirm('Delete this product?')){db.products=db.products.filter(p=>p.id!==+b.dataset.del);save();renderAdmin();renderFilters();renderProducts()}});$('adminOrders').innerHTML=db.orders.length?db.orders.map(o=>`<div class="order-row"><span><b>${esc(o.id)}</b><br>${esc(o.customer)} · ${money(o.total)}</span><select data-status="${esc(o.id)}">${['Received','Confirmed','Packed','Out for delivery','Delivered','Cancelled'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select></div>`).join(''):'<p>No orders yet.</p>';$('adminOrders').querySelectorAll('[data-status]').forEach(s=>s.onchange=()=>{let o=db.orders.find(x=>x.id===s.dataset.status);o.status=s.value;save();toast('Order status updated')})}
$('search').addEventListener('input',renderProducts);renderFilters();renderProducts();updateCount();if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
$('closeSuccess').onclick=()=>$('orderSuccess').hidden=true;
