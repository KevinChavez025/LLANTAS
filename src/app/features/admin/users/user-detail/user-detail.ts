import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss'
})
export class UserDetail implements OnInit {
  private svc    = inject(UsuarioService);
  private route  = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  usuario  = signal<Usuario | null>(null);
  cargando = signal(true);

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.svc.obtenerPorId(id).subscribe({
      next: u => { this.usuario.set(u); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  toggleActivo(): void {
    const u = this.usuario();
    if (!u) return;
    this.svc.toggleActivo(u.id, !u.activo).subscribe({
      next: updated => { this.usuario.set(updated); this.toastr.success('Estado actualizado'); }
    });
  }
}
