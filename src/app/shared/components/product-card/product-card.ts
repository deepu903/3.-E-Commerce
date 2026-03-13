import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HighlightDirective } from "../../directives/highlight/highlight";
import { Product } from '../../../core/models/product.model';
import { RouterLink } from "@angular/router";
import { CartService } from '../../../core/services/cart/cart';
import { DecimalPipe } from '@angular/common';
import { TruncatePipe } from "../../pipes/truncate/truncate-pipe";
import { IndianCurrencyPipe } from '../../pipes/indian-currency/indian-currency-pipe';
import { MatAnchor, MatIconButton } from "@angular/material/button";
import { TooltipDirective } from "../../directives/tooltip/tooltip";

@Component({
  selector: 'app-product-card',
  imports: [MatCardModule, MatIconModule, HighlightDirective, RouterLink, DecimalPipe, TruncatePipe, IndianCurrencyPipe, MatAnchor, TooltipDirective, MatIconButton],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  //Receives product data from parent component
  @Input({ required: true }) product!: Product;

  // Emits event when add to cart is clicked
  @Output() addToCart = new EventEmitter<Product>();

  // Inject CartService
  private cartService = inject(CartService);

  //Calculated discounted price
  getDiscountedPrice(product: Product): number {
    const discount = product.discountPercentage || 0;
    return product.price * (1 - discount / 100);
  }

  // Handle add to cart
  onAddToCart(): void {
    this.cartService.addToCart(this.product);
    this.addToCart.emit(this.product);
  }
}
