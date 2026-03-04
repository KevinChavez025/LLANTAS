import { isPlatformBrowser } from '@angular/common';

export function initRevealObserver(platformId: object): void {
  if (!isPlatformBrowser(platformId)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  setTimeout(() => {
    document.querySelectorAll('.reveal, .reveal-item').forEach(el => observer.observe(el));
  }, 80);
}