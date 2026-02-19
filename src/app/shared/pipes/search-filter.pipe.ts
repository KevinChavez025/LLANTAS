import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
  standalone: true
})
export class SearchFilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, fields: string[] = []): any[] {
    if (!items || !items.length) {
      return [];
    }

    if (!searchText || !searchText.trim()) {
      return items;
    }

    searchText = searchText.toLowerCase().trim();

    return items.filter(item => {
      // Si no se especifican campos, busca en todos los campos del objeto
      if (fields.length === 0) {
        return Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchText)
        );
      }

      // Busca solo en los campos especificados
      return fields.some(field => {
        const value = this.getNestedProperty(item, field);
        return value && value.toString().toLowerCase().includes(searchText);
      });
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
  }
}
