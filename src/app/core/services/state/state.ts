import { Injectable, computed, effect, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../models/product.model';
import { BehaviorSubject, Subject } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Interface for application notification
 */
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private platformId = inject(PLATFORM_ID);
  private snackBar = inject(MatSnackBar);

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE - Writable Signal
  // ═══════════════════════════════════════════════════════════

  
  /**
   * Global loading indicator
   * Usage: Show/hide loader when api calls are in progress
   */
  private loadingSignal = signal<boolean>(false);

  // Read-only computed signal for loading state
  isLoading = computed(() => this.loadingSignal());

  // ═══════════════════════════════════════════════════════════
  // PRODUCTS STATE - Writable Signal
  // ═══════════════════════════════════════════════════════════

  /**
   * Store all products in application state
   */
  private productsSignal = signal<Product[]>([]);

  // Read-only computed signal for products
  products = computed(() => this.productsSignal());

  /**
   * Currently selected product (for detail view)
   */
  private selectedProductsSignal = signal<Product | null>(null);

  selectedProduct = computed(() => this.selectedProductsSignal());

  /**
   * Currently search query entered by user
   */
  private searchQuerySignal = signal<string>('');
  
  searchQuery = computed(() => this.searchQuerySignal());

  // Selected category for filtering products
  private selectedCategorySignal = signal<string>('all');
  selectedCategory = computed(() => this.selectedCategorySignal());

  // Price range filter
  private priceRangeSignal = signal<{min: number; max: number}>({
    min: 0,
    max: 10000
  });
  priceRange = computed(() => this.priceRangeSignal());

  // ═══════════════════════════════════════════════════════════
  // COMPUTED SIGNALS - Derived State
  // ═══════════════════════════════════════════════════════════

  /**
   * Filtered products based on search query and filters
   * CONCEPT: Computed signals automatically recalculate when dependencies change
   */
  filteredProducts = computed(() => {
    const query = this.searchQuerySignal().toLowerCase().trim();
    const category = this.selectedCategorySignal();
    const priceRange = this.priceRangeSignal();
    let products = this.productsSignal();

    // filter by search query
    if(query) {
      products = products.filter(p => p.title.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    }

    // filter by category
    if(category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    // Filter by price range
    products = products.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    return products;
  });
  
  // Count of total products
  productsCount = computed(() => this.productsSignal().length);

  // Count of filtered products
  filteredProductsCount = computed(() => this.filteredProducts().length);

  // Check if products exist
  hasProducts = computed(() => this.productsSignal().length > 0);
  
  // Check if search/filter is active
  isFiltering = computed(() => {
    return this.searchQuerySignal() !== '' || this.selectedCategorySignal() !== 'all';
  });

  // Get unique categories from products
  categories = computed(() => {
    const products = this.productsSignal();
    const categorySet = new Set(products.map(p => p.category));
    return Array.from(categorySet).sort();
  });

  // ═══════════════════════════════════════════════════════════
  // NOTIFICATIONS STATE - Writable Signal
  // ═══════════════════════════════════════════════════════════

  /**
   * Store application notifications
   */
  private notificationsSignal = signal<Notification[]>([]);
  notifiaction = computed(() => this.notificationsSignal());

  // Count of unread notifications
  notificationsCount = computed(() => this.notificationsSignal().length);

  // ═══════════════════════════════════════════════════════════
  // RXJS - BehaviorSubject & Subject
  // ═══════════════════════════════════════════════════════════

  /**
   * BehaviorSubject: Holds current value, emits immediately to new suubscribers 
   * Use case: Theme perference, user settings
   */
  private themeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  theme$ = this.themeSubject.asObservable();

  /**
   * Subject: Does not hold value, only emits to active subscribers
   * Use case: One-time events like product added, deleted
   */
  private productAddedSubject = new Subject<Product>();
  productAdded$ = this.productAddedSubject.asObservable();

  private ProductDeletedSubject = new Subject<number>();
  productDeleted$ = this.ProductDeletedSubject.asObservable();

  private productUpdatedSubject = new Subject<Product>();
  productUpdated$ = this.productUpdatedSubject.asObservable();


  constructor() {
    /**
     * EFFECTS 1: Log when products change
     * Runs automatically whenever productsSignal changes
     */
    effect(() => {
      const count = this.productsSignal().length;
      console.log(`📦 Products updated: ${count} products in state`);
    });

    /**
     * EFFECT 2: Save search query to localStorage
     * Persist user's last search for better UX
     */
    effect(() => {
      const query = this.searchQuerySignal();
      if(query && isPlatformBrowser(this.platformId)) {
        localStorage.setItem('lastSearch', query);
        console.log(`🔍 Search query saved: "${query}"`);
      }
    });

    /**
     * EFFECT 3: Log loading state changes
     */
    effect(() => {
      const loading = this.loadingSignal();
      console.log(`⌛ Loading state: ${loading ? 'ON' : 'OFF'}`);
    });

    /**
     * EFFECT 4: Auto-clear old notifications
     * Remove notification older than 5 seconds
     */
    effect(() => {
      const notifications = this.notificationsSignal();
      if(notifications.length > 0) {
        setTimeout(() => {
          this.clearOldNotifications();
        }, 5000);
      }
    });

    // Load saved search on initialization
    this.loadSavedSearch();
  }

  /**
   * Set loading state
   * Call before API request starts
   */
  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  // Show loader
  showLoader(): void {
    this.loadingSignal.set(true);
  }

  // Hide loader
  hideLoader(): void {
    this.loadingSignal.set(false);
  }

  /**
   * Set entire products array
   * Use after fetching products from API 
   */
  setProducts(products: Product[]): void {
    this.productsSignal.set(products);
  }

  /**
   * Add single product to state
   * Use after creating new product
   */
  addProduct(product: Product): void {
    // update() method: Get current value, modify return new value
    this.productsSignal.update(products => [...products, product]);
    
    // Emit event via Subject
    this.productAddedSubject.next(product)

    // Show success notification
    this.addNotification('success', `Product "${product.title}" added!`);
  }

  /**
   * update existing product
   */
  updateProduct(id: number, updates: Partial<Product>): void {
    this.productsSignal.update(products => 
      products.map(p => p.id === id ? {...p, ...updates} : p)
    );

    const updatedProduct = this.productsSignal().find(p => p.id === id);

    if(updatedProduct) {
      this.productUpdatedSubject.next(updatedProduct);
      this.addNotification('success','Product updated successfully!');
    }
  }

  // Delete product from state
  deleteProduct(id: number): void {
    const product = this.productsSignal().find(p => p.id === id);

    this.productsSignal.update(products => 
      products.filter(p =>p.id !== id)
    );

    this.ProductDeletedSubject.next(id);

    if(product) {
      this.addNotification('success', `"${product.title}" deleted!`);
    }
  }

  // Clear all products
  clearProducts(): void {
    this.productsSignal.set([]);
  }

  // Set selected product for detail view
  setSelectedProduct(product: Product | null): void {
    this.selectedProductsSignal.set(product);
  }

  // Clear selected product
  clearSelectedProduct(): void {
    this.selectedProductsSignal.set(null);
  }

  //Update search query
  setSearchQuery(query: string): void {
    this.searchQuerySignal.set(query);
  }

  // Clear search query
  clearSearch(): void {
    this.searchQuerySignal.set('');
  }

  // Set Category filter
  setCategory(category: string): void {
    this.selectedCategorySignal.set(category);
  }

  // Set price range filter
  setPriceRange(min: number, max: number): void {
    this.priceRangeSignal.set({min, max});
  }
 
  // Reset all filters
  resetFilters(): void {
    this.searchQuerySignal.set('');
    this.selectedCategorySignal.set('all');
    this.priceRangeSignal.set({min: 0, max: 10000});
  }

  // Load saved search from localStorage
  private loadSavedSearch(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const savedSearch = localStorage.getItem('lastSearch');
    if(savedSearch) {
      this.searchQuerySignal.set(savedSearch);
    }
  }

  // Add notification to state
  addNotification(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };

    this.notificationsSignal.update(notifications => [...notifications, notification]);

    // Show Material Snackbar
    if (isPlatformBrowser(this.platformId)) {
      this.snackBar.open(message, 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: type === 'success' ? ['bg-green-500', 'text-white'] : 
                    type === 'error' ? ['bg-red-500', 'text-white'] : 
                    ['bg-gray-800', 'text-white']
      });
    }
  }

  // Remove specific notification
  removeNotification(id: string): void{
    this.notificationsSignal.update(notifications => notifications.filter(n =>n.id !== id));
  }

  // Clear all notifications
  clearNotifications(): void {
    this.notificationsSignal.set([]);
  }

  // Clear old notifications (older than 5 seconds)
  private clearOldNotifications(): void {
    const now = new Date().getTime();
    this.notificationsSignal.update(notifications => notifications.filter(n => now - n.timestamp.getTime() < 5000));
  }

  // Toggle theme between light and dark
  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.themeSubject.next(newTheme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', newTheme);
    }
  }

  // Get current theme
  getCurrentTheme(): 'light' | 'dark' {
    return this.themeSubject.value;
  }
}
