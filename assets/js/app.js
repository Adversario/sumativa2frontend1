// ==============================
// Estado global
// ==============================
let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Helpers DOM y formato CLP
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const CLP = (n) => n.toLocaleString('es-CL');

// ==============================
// Cargar productos con Fetch API
// ==============================
async function cargarProductos() {
  try {
    const r = await fetch('assets/data/products.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    productos = await r.json();
    renderProductos(productos);
  } catch (e) {
    mostrarError("Nuestro camellos descansan, no lograron traer la carga. Refresca el bazar");
  }
}

// ==============================
// Render de productos + contador + sin resultados
// ==============================
function renderProductos(lista) {
  const cont = $('#contenedor-productos');
  const contador = $('#contador-resultados');
  const sinRes = $('#mensaje-sin-resultados');

  cont.innerHTML = '';

  if (lista.length === 0) {
    sinRes.textContent = 'No encontramos maravillas para tu búsqueda. Prueba con otras palabras o categoría.';
    sinRes.classList.remove('d-none');
  } else {
    sinRes.classList.add('d-none');

    lista.forEach(prod => {
      const col = document.createElement('div');
      col.className = 'col-sm-6 col-md-4 col-lg-3';
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${prod.nombre}</h5>
            <p class="card-text">${prod.descripcion}</p>
            <p class="fw-bold">$${CLP(prod.precio)}</p>
            <button class="btn btn-custom mt-auto" onclick="agregarAlCarrito('${prod.id}')" aria-label="Agregar ${prod.nombre} al carrito">
              Agregar al carrito
            </button>
          </div>
        </div>
      `;
      cont.appendChild(col);
    });
  }

  contador.textContent = `${lista.length} maravillas halladas en este rincón del bazar`;
}

// ==============================
// Carrito
// ==============================
function agregarAlCarrito(id) {
  const item = productos.find(p => p.id === id);
  if (!item) return;
  carrito.push(item); // Permitimos repetidos; la pauta solo exige que actualice cantidades totales/ítems
  guardarCarrito();
  renderCarrito();
}

function renderCarrito() {
  const lista = $('#lista-carrito');
  const resumen = $('#resumen-carrito');
  const btnVaciar = $('#btn-vaciar');
  lista.innerHTML = '';

  let total = 0;

  if (carrito.length === 0) {
    resumen.textContent = 'Tu carrito está vacío.';
    btnVaciar.classList.add('d-none');
  } else {
    carrito.forEach((item, i) => {
      total += item.precio;
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.textContent = `${item.nombre} – $${CLP(item.precio)}`;

      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-danger';
      btn.textContent = 'X';
      btn.setAttribute('aria-label', `Quitar ${item.nombre} del carrito`);
      btn.onclick = () => {
        carrito.splice(i, 1);
        guardarCarrito();
        renderCarrito();
      };

      li.appendChild(btn);
      lista.appendChild(li);
    });

    resumen.textContent = `Total: $${CLP(total)}`;
    btnVaciar.classList.remove('d-none');
  }

  $('#contador-carrito').textContent = carrito.length;
}

// Vaciar carrito
$('#btn-vaciar').addEventListener('click', () => {
  carrito = [];
  guardarCarrito();
  renderCarrito();
});

// ==============================
// Buscar/filtrar productos (submit)
// ==============================
$('#form-busqueda').addEventListener('submit', e => {
  e.preventDefault();
  const t = $('#input-busqueda').value.toLowerCase().trim();
  const f = productos.filter(p =>
    p.nombre.toLowerCase().includes(t) || p.categoria.toLowerCase().includes(t)
  );
  renderProductos(f);
  // limpiar selección activa del navbar al buscar
  $$('.nav-cat').forEach(n => n.classList.remove('active'));
});

// ==============================
// Filtro por categorías del navbar (click)
// ==============================
function activarFiltroNavbar() {
  $$('.nav-cat').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault(); // evita solo cambiar el hash
      const cat = a.dataset.cat?.toLowerCase() || '';
      const filtrados = productos.filter(p => p.categoria.toLowerCase() === cat);
      renderProductos(filtrados);
      // marcar activo visualmente
      $$('.nav-cat').forEach(n => n.classList.remove('active'));
      a.classList.add('active');
      // limpiar texto de búsqueda para evitar confusión
      $('#input-busqueda').value = '';
    });
  });
}

// ==============================
// Persistencia
// ==============================
function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// ==============================
// Errores
// ==============================
function mostrarError(m) {
  const d = $('#mensaje-error');
  d.textContent = m;
  d.classList.remove('d-none');
}

// ==============================
// Init
// ==============================
cargarProductos().then(activarFiltroNavbar);
renderCarrito();