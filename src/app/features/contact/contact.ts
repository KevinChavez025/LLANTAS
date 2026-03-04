import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import emailjs from '@emailjs/browser';

// ──────────────────────────────────────────────────────────
// 🔧 REEMPLAZA ESTOS 3 VALORES con los de tu cuenta EmailJS
// dashboard → https://www.emailjs.com
// ──────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_yitptfn';   // ej: 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'template_dmofjhk';  // ej: 'template_xyz789'
const EMAILJS_PUBLIC_KEY  = 'mNCmvNFAIBqmIMIml';   // ej: 'aBcDeFgHiJkLmNoP'

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements OnInit {
  private fb = new FormBuilder();

  enviando = false;
  enviado  = false;
  error    = false;

  form: FormGroup = this.fb.group({
    nombre:   ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
    telefono: [''],
    asunto:   ['', Validators.required],
    mensaje:  ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.error    = false;

    const { nombre, email, telefono, asunto, mensaje } = this.form.value;

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        nombre,
        email,
        telefono:  telefono || 'No indicado',
        asunto,
        mensaje,
        reply_to:  email,
      });

      this.enviado = true;
      this.form.reset();
      setTimeout(() => this.enviado = false, 6000);

    } catch (err) {
      console.error('EmailJS error:', err);
      this.error = true;
      setTimeout(() => this.error = false, 6000);

    } finally {
      this.enviando = false;
    }
  }

  campo(nombre: string) { return this.form.get(nombre); }
  invalido(nombre: string): boolean {
    const c = this.campo(nombre);
    return !!(c?.invalid && c?.touched);
  }
}