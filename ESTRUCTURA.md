# 📁 ESTRUCTURA DEL PROYECTO JCH LLANTAS

## 📂 Organización de carpetas

### src/app/
├── core/ # Funcionalidades centrales
│ ├── guards/ # Protección de rutas
│ ├── interceptors/ # HTTP interceptors
│ ├── models/ # Interfaces TypeScript
│ └── services/ # Servicios (HTTP, lógica)
│
├── shared/ # Componentes reutilizables
│ ├── components/ # Navbar, Footer, Cards, etc.
│ ├── pipes/ # Transformadores de datos
│ └── directives/ # Directivas personalizadas
│
├── features/ # Páginas y funcionalidades
│ ├── auth/ # Login, Register
│ ├── home/ # Página principal
│ ├── catalog/ # Catálogo de productos
│ ├── product-detail/ # Detalle de producto
│ ├── cart/ # Carrito de compras
│ ├── checkout/ # Proceso de compra
│ ├── user/ # Perfil, pedidos del usuario
│ ├── admin/ # Panel administrativo
│ │ ├── dashboard/
│ │ ├── products/
│ │ ├── orders/
│ │ ├── users/
│ │ └── categories/
│ ├── about/ # Nosotros
│ └── contact/ # Contacto
│
└── layout/ # Plantillas de página
├── main-layout/ # Layout público
└── admin-layout/ # Layout admin

text

## 🎯 Convenciones

- **core/**: Singleton services, guards, interceptors
- **shared/**: Componentes usados en múltiples features
- **features/**: Módulos lazy-loaded por funcionalidad
- **layout/**: Wrappers con header/footer/sidebar

