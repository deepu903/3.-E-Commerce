import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api/api';
import { AuthService } from '../../core/services/auth/auth';
import { CartService } from '../../core/services/cart/cart';
import { RouterLink } from "@angular/router";
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PermissionDirective } from '../../shared/directives/permission/permission';
import { IndianCurrencyPipe } from '../../shared/pipes/indian-currency/indian-currency-pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, IndianCurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit{
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  // Signals from services
  userName = this.authService.userFullName;
  userRole = this.authService.userRole;
  cartItems = this.cartService.itemCount;
  cartTotal = this.cartService.total;

  // Local signals
  totalProducts = signal<number>(0);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.apiService.getProducts(10).subscribe({
      next: (response) => {
        this.totalProducts.set(response.total);
      },
      error: (err) => console.error(err)
    });
  }

}
