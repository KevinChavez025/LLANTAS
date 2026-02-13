import { Directive, ElementRef, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective implements AfterViewInit, OnDestroy {
  @Output() clickOutside = new EventEmitter<void>();
  
  private listener: ((event: MouseEvent) => void) | null = null;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    // Esperar al siguiente ciclo para evitar que se dispare inmediatamente
    setTimeout(() => {
      this.listener = (event: MouseEvent) => {
        const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
        
        if (!clickedInside) {
          this.clickOutside.emit();
        }
      };

      document.addEventListener('click', this.listener);
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.listener) {
      document.removeEventListener('click', this.listener);
    }
  }
}
