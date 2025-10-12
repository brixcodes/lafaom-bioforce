import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private selectedCategoriesSubject = new BehaviorSubject<number[]>([]);
  public selectedCategories$ = this.selectedCategoriesSubject.asObservable();

  setSelectedCategories(categories: number[]) {
    this.selectedCategoriesSubject.next(categories);
  }

  getSelectedCategories(): number[] {
    return this.selectedCategoriesSubject.value;
  }
}
