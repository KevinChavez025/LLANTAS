import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  forgotForm: FormGroup;
  isLoading = false;
  emailSent = false;

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.forgotForm.get('email');
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { email } = this.forgotForm.value;

    // Simular envío de email (implementar con tu backend)
    setTimeout(() => {
      this.isLoading = false;
      this.emailSent = true;
      this.toastr.success('Revisa tu correo para restablecer tu contraseña', 'Email enviado');
    }, 2000);

    // Implementación real:
    // this.http.post(`${environment.apiUrl}/api/auth/forgot-password`, { email })
    //   .subscribe({
    //     next: () => {
    //       this.isLoading = false;
    //       this.emailSent = true;
    //       this.toastr.success('Revisa tu correo', 'Email enviado');
    //     },
    //     error: (error) => {
    //       this.isLoading = false;
    //       this.toastr.error('Error al enviar el email', 'Error');
    //     }
    //   });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
