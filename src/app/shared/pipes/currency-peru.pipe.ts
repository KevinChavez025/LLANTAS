import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyPeru',
  standalone: true
})
export class CurrencyPeruPipe implements PipeTransform {
  transform(value: number | string, showSymbol: boolean = true): string {
    if (value === null || value === undefined || value === '') {
      return showSymbol ? 'S/ 0.00' : '0.00';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return showSymbol ? 'S/ 0.00' : '0.00';
    }

    const formatted = numValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return showSymbol ? `S/ ${formatted}` : formatted;
  }
}
