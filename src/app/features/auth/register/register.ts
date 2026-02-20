import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // El HTML usa [formGroup]="registerForm"
  registerForm: FormGroup = this.fb.group({
    nombreCompleto:  ['', [Validators.required, Validators.minLength(3)]],
    username:        ['', [Validators.required, Validators.minLength(3)]],
    email:           ['', [Validators.required, Validators.email]],
    telefono:        ['', [Validators.pattern(/^[0-9]{9}$/)]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    acceptTerms:     [false, Validators.requiredTrue]
  }, { validators: this.passwordMatch });

  isLoading           = false;
  showPassword        = false;
  showConfirmPassword = false;

  private passwordMatch(c: AbstractControl) {
    return c.get('password')?.value === c.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  // Getters que usa el HTML
  get nombreCompleto()  { return this.registerForm.get('nombreCompleto'); }
  get username()        { return this.registerForm.get('username'); }
  get email()           { return this.registerForm.get('email'); }
  get password()        { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get acceptTerms()     { return this.registerForm.get('acceptTerms'); }

  togglePasswordVisibility(): void        { this.showPassword        = !this.showPassword; }
  toggleConfirmPasswordVisibility(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.isLoading = true;
    const { nombreCompleto, email, telefono, password } = this.registerForm.value;

    // El backend register espera: { nombre, email, telefono, password }
    this.auth.register({ nombre: nombreCompleto, email, telefono, password }).subscribe({
      next: res => {
        this.isLoading = false;
        this.toastr.success('¡Cuenta creada!', 'Bienvenido');
        this.router.navigate(res.rol === 'ADMIN' ? ['/admin/dashboard'] : ['/home']);
      },
      error: () => { this.isLoading = false; }
    });
  }
}
