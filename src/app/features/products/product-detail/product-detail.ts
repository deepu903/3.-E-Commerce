import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api/api';
import { CartService } from '../../../core/services/cart/cart';
import { StateService } from '../../../core/services/state/state';
import { Product, getDiscountedPrice } from '../../../core/models/product.model';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { IndianCurrencyPipe } from '../../../shared/pipes/indian-currency/indian-currency-pipe';
import { MatAnchor } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, MatChipsModule, MatIconModule, DecimalPipe, IndianCurrencyPipe, MatAnchor, MatCardModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);
  private stateService = inject(StateService);

  product = signal<Product | null>(null);
  selectedImage = signal<string>('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduct(id)
  }

  loadProduct(id: number) {
    this.stateService.showLoader();
    this.apiService.getProductById(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.selectedImage.set(product.thumbnail);
        this.stateService.hideLoader();
      }, error: (err) => {
        console.clear();
        console.error(err);
        this.stateService.hideLoader();
        this.router.navigate(['/products']);

      }
    });
  }

  getPrice(): number {
    return getDiscountedPrice(this.product()!);
  }

  addToCart() {
    this.cartService.addToCart(this.product()!);
    this.stateService.addNotification('success', 'Product added to cart!');
  }
}
