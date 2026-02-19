import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ========== RUTAS PÚBLICAS (con MainLayout) ==========
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./features/home/home').then(m => m.Home)
      },
      {
        path: 'catalogo',
        loadComponent: () => import('./features/catalog/catalog').then(m => m.Catalog)
      },
      {
        path: 'producto/:id',
        loadComponent: () => import('./features/product-detail/product-detail').then(m => m.ProductDetail)
      },
      {
        path: 'carrito',
        loadComponent: () => import('./features/cart/cart').then(m => m.Cart)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout)
      },
      {
        path: 'nosotros',
        loadComponent: () => import('./features/about/about').then(m => m.About)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./features/contact/contact').then(m => m.Contact)
      }
    ]
  },

  // ========== RUTAS DE AUTENTICACIÓN (sin layout) ==========
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },

  // ========== RUTAS PROTEGIDAS (requieren login) ==========
  {
    path: 'usuario',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'perfil',
        loadComponent: () => import('./features/user/profile/profile').then(m => m.Profile)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/user/orders/order-list/order-list').then(m => m.OrderList)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/user/orders/order-detail/order-detail').then(m => m.OrderDetail)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/user/settings/settings').then(m => m.Settings)
      }
    ]
  },

  // ========== PANEL ADMIN (requiere rol ADMIN) ==========
  {
    path: 'admin',
    loadComponent: () => import('./layout/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/admin/products/product-list/product-list').then(m => m.ProductList)
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./features/admin/products/product-form/product-form').then(m => m.ProductForm)
      },
      {
        path: 'productos/editar/:id',
        loadComponent: () => import('./features/admin/products/product-form/product-form').then(m => m.ProductForm)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/admin/orders/order-list/order-list').then(m => m.AdminOrderList)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/admin/orders/order-detail/order-detail').then(m => m.AdminOrderDetail)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/users/user-list/user-list').then(m => m.UserList)
      },
      {
        path: 'usuarios/:id',
        loadComponent: () => import('./features/admin/users/user-detail/user-detail').then(m => m.UserDetail)
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/admin/categories/category-list/category-list').then(m => m.CategoryList)
      }
    ]
  },

  // ========== RUTA 404 ==========
  {
    path: '**',
    redirectTo: 'home'
  }
];