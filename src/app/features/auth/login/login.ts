import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private fb          = inject(FormBuilder);
  private auth        = inject(AuthService);
  private favoritos   = inject(FavoritosService);
  private router      = inject(Router);
  private toastr      = inject(ToastrService);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading    = false;
  showPassword = false;

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.isLoading = true;
    const email    = this.loginForm.value.username!;
    const password = this.loginForm.value.password!;

    this.auth.login(email, password).subscribe({
      next: res => {
        this.isLoading = false;
        // Sincronizar favoritos locales con el backend al iniciar sesión
        this.favoritos.sincronizarAlLogin();
        this.toastr.success('¡Bienvenido!', 'Inicio de sesión exitoso');
        this.router.navigate(res.rol === 'ADMIN' ? ['/admin/dashboard'] : ['/home']);
      },
      error: () => { this.isLoading = false; }
    });
  }
}