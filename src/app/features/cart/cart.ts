import { Component, inject } from '@angular/core';
import { CartService } from '../../core/services/cart/cart';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from "@angular/router";
import { TruncatePipe } from '../../shared/pipes/truncate/truncate-pipe';
import { IndianCurrencyPipe } from '../../shared/pipes/indian-currency/indian-currency-pipe';
import { A11yModule } from "@angular/cdk/a11y";
@Component({
  selector: 'app-cart',
  imports: [MatButtonModule, MatCardModule, MatIconModule, RouterLink, TruncatePipe, IndianCurrencyPipe, A11yModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private cartService = inject(CartService);

  cartItems = this.cartService.cartItems;
  subtotal = this.cartService.subtotal;
  tax = this.cartService.tax;
  shipping = this.cartService.shipping;
  total = this.cartService.total;
  isEmpty = this.cartService.isEmpty;

  incrementQty(id: number): void {
    this.cartService.incrementQuantity(id);
  }

  decrementQty(id: number): void {
    this.cartService.decrementQuantity(id);
  }

  removeItem(id: number): void {
    this.cartService.removeFromCart(id);
  }

  checkout(): void {
    this.cartService.checkout();
    alert('Order placed successfully!');
  }
}
