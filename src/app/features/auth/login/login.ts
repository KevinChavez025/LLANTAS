import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthService);
  private router  = inject(Router);
  private toastr  = inject(ToastrService);

  // El HTML usa [formGroup]="loginForm"
  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading    = false;
  showPassword = false;

  // Getters que usa el HTML para validaciones
  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.isLoading = true;
    // El backend acepta email en el campo email — el username del form es el email del usuario
    const email    = this.loginForm.value.username!;
    const password = this.loginForm.value.password!;

    this.auth.login(email, password).subscribe({
      next: res => {
        this.isLoading = false;
        this.toastr.success('¡Bienvenido!', 'Inicio de sesión exitoso');
        this.router.navigate(res.rol === 'ADMIN' ? ['/admin/dashboard'] : ['/home']);
      },
      error: () => { this.isLoading = false; }
    });
  }
}
