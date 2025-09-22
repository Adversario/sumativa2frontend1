let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
async function cargarProductos(){
  try{
    const r = await fetch('assets/data/products.json');
    if(!r.ok) throw new Error('Error');
    productos = await r.json();
    renderProductos(productos);
  }catch(e){mostrarError("Nuestro camellos descansan, no lograron traer la carga. Refresca el bazar");}
}
function renderProductos(lista){
  const cont = document.getElementById('contenedor-productos'); cont.innerHTML='';
  lista.forEach(prod=>{
    const card=document.createElement('div'); card.className='col-sm-6 col-md-4 col-lg-3';
    card.innerHTML=`<div class="card h-100 shadow-sm">
      <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${prod.nombre}</h5>
        <p class="card-text">${prod.descripcion}</p>
        <p class="fw-bold">$${prod.precio.toLocaleString('es-CL')}</p>
        <button class="btn btn-custom mt-auto" onclick="agregarAlCarrito('${prod.id}')">Agregar al carrito</button>
      </div></div>`;
    cont.appendChild(card);
  });
}
function agregarAlCarrito(id){
  const item = productos.find(p=>p.id===id);
  carrito.push(item); guardarCarrito(); renderCarrito();
}
function renderCarrito(){
  const lista=document.getElementById('lista-carrito'); const resumen=document.getElementById('resumen-carrito'); lista.innerHTML='';
  let total=0;
  carrito.forEach((item,i)=>{
    total+=item.precio; const li=document.createElement('li');
    li.className='list-group-item d-flex justify-content-between align-items-center';
    li.textContent=item.nombre+" – $"+item.precio.toLocaleString('es-CL');
    const btn=document.createElement('button'); btn.className='btn btn-sm btn-danger'; btn.textContent='X';
    btn.onclick=()=>{carrito.splice(i,1);guardarCarrito();renderCarrito();};
    li.appendChild(btn); lista.appendChild(li);
  });
  resumen.textContent=`Total: $${total.toLocaleString('es-CL')}`;
  document.getElementById('contador-carrito').textContent=carrito.length;
}
document.getElementById('form-busqueda').addEventListener('submit',e=>{
  e.preventDefault(); const t=document.getElementById('input-busqueda').value.toLowerCase();
  const f=productos.filter(p=>p.nombre.toLowerCase().includes(t)||p.categoria.toLowerCase().includes(t));
  renderProductos(f);
});
function guardarCarrito(){localStorage.setItem('carrito',JSON.stringify(carrito));}
function mostrarError(m){const d=document.getElementById('mensaje-error');d.textContent=m;d.classList.remove('d-none');}
cargarProductos(); renderCarrito();
