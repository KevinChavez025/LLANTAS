import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, AsyncPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private auth    = inject(AuthService);
  private svc     = inject(UsuarioService);
  private fb      = inject(FormBuilder);
  private toastr  = inject(ToastrService);

  usuario   = this.auth.currentUser$;
  guardando = signal(false);
  editando  = signal(false);

  form: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    telefono:       ['', Validators.pattern(/^[0-9]{9}$/)],
    direccion:      [''],
    ciudad:         [''],
    distrito:       [''],
  });

  ngOnInit(): void {
    // Carga datos reales del backend
    const user = this.auth.getCurrentUser();
    if (user) {
      this.svc.obtenerPorId(user.id).subscribe({
        next: (u) => this.form.patchValue(u),
        error: () => {
          // Fallback a datos del token si el backend no responde
          this.form.patchValue({ nombre: user.nombre, email: user.email });
        }
      });
    }
  }

  get f() { return this.form.controls; }

  toggleEditar(): void { this.editando.update(v => !v); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const user = this.auth.getCurrentUser();
    if (user) {
      this.svc.actualizar(user.id, this.form.value).subscribe({
        next: () => {
          this.guardando.set(false);
          this.editando.set(false);
          this.toastr.success('Perfil actualizado correctamente', '¡Listo!');
        },
        error: () => {
          this.guardando.set(false);
          this.toastr.error('No se pudo actualizar el perfil', 'Error');
        }
      });
    }
  }

  cancelar(): void {
    this.editando.set(false);
    this.ngOnInit();
  }
}