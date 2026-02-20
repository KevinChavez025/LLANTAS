import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private auth    = inject(AuthService);
  private svc     = inject(UsuarioService);
  private fb      = inject(FormBuilder);
  private toastr  = inject(ToastrService);

  guardando = signal(false);

  form: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    telefono:       [''],
    direccion:      [''],
    ciudad:         [''],
    distrito:       [''],
  });

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.svc.obtenerPorId(user.id).subscribe({
        next: u => this.form.patchValue(u)
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) return;
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.guardando.set(true);
    this.svc.actualizar(user.id, this.form.value).subscribe({
      next: () => { this.guardando.set(false); this.toastr.success('Perfil actualizado'); },
      error: () => this.guardando.set(false)
    });
  }
}
