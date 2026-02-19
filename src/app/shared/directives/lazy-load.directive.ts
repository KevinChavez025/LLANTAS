import { Directive, ElementRef, OnInit, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit {
  @Input() appLazyLoad: string = '';
  @Input() defaultImage: string = 'assets/images/placeholder.jpg';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Mostrar imagen por defecto
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.defaultImage);
    
    // Crear el observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          observer.unobserve(this.el.nativeElement);
        }
      });
    }, {
      rootMargin: '50px'
    });

    observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    const img = new Image();
    img.src = this.appLazyLoad;
    
    img.onload = () => {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.appLazyLoad);
      this.renderer.addClass(this.el.nativeElement, 'loaded');
    };

    img.onerror = () => {
      console.error(`Error loading image: ${this.appLazyLoad}`);
    };
  }
}
