import { Component, OnInit, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../../../core/services/api/api';
import { StateService } from '../../../core/services/state/state';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ProductCard } from '../../../shared/components/product-card/product-card';

import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-list',
  imports: [MatIconModule, MatFormFieldModule, FormsModule, MatSelectModule, ProductCard, MatInputModule, RouterLink, MatButtonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  private apiService = inject(ApiService);
  private stateService = inject(StateService);

  searchQuery = '';
  selectedCategory = 'all';

  // Signals From State Service
  products = this.stateService.products;
  filteredProducts = this.stateService.filteredProducts;
  categories = this.stateService.categories;
  isLoading = this.stateService.isLoading;

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts(): void {  
    this.stateService.showLoader();
    this.apiService.getProducts(50).subscribe({
      next: (response) => {
        this.stateService.setProducts(response.products);
        this.stateService.hideLoader();
      },
      error: (error) => {
        setInterval(() => {
          console.clear();
          console.log(error);
        }, 2000);
      }
    });
  }

  onSearchChange(): void {
    this.stateService.setSearchQuery(this.searchQuery);
  }

  onFilterChange(): void {
    this.stateService.setCategory(this.selectedCategory);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.stateService.resetFilters();
  }

  onAddToCart(product:any): void {
    this.stateService.addNotification('success',`${product.title} added to cart`)
  }

}
