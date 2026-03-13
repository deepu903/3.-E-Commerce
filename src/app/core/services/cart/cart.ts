import { Injectable, computed, effect, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Cart, CartItem, Product, getDiscountedPrice } from '../../models/product.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // ═══════════════════════════════════════════════════════════
  // SIGNALS - State Management
  // ═══════════════════════════════════════════════════════════

  // Writable Signal - Cart items array 
  private cartItemsSignal = signal<CartItem[]>([]);
  private platformId = inject(PLATFORM_ID);

  // Computed Signal - Total items count
  cartItems = computed(() => this.cartItemsSignal());

  // Computed Signal - Total items count
  itemCount = computed(() => {
    return this.cartItemsSignal().reduce(
      (count, item) => count + item.quantity,
      0
    );
  });

  // Computed Signal - Subtotal (before tax & shipping)
  subtotal =  computed(() => {
    return this.cartItemsSignal().reduce((total, item) => {
      const price = getDiscountedPrice(item.product);
      return total + (price * item.quantity);
    }, 0);
  });

  // Computed Signal - Tax (18% GST)
  tax = computed(() => {
    return this.subtotal() * 0.18;
  });

  // Computed Signal - Shipping charges
  shipping = computed(() => {
    const subtotalValue = this.subtotal();
    if(subtotalValue === 0) return 0;
    if(subtotalValue > 1000) return 0; // Free shipping above ₹1000
    return 50; // Fixed shipping charge
  })

  // Computed Signal - Grand total
  total = computed(() => {
    return this.subtotal() + this.tax() + this.shipping();
  });

  // Computed Signal - Check if cart is empty
  isEmpty = computed(() => this.cartItemsSignal().length === 0);

  // Computed Signal - Cart Summary
  cartSummary = computed(() => ({
    items: this.cartItemsSignal(),
    itemCount: this.itemCount(),
    subtotal: this.subtotal(),
    tax: this.tax(),
    shipping: this.shipping(),
    total: this.total(),
    isEmpty: this.isEmpty()
  }));

  // ═══════════════════════════════════════════════════════════
  // RXJS SUBJECTS - Events
  // ═══════════════════════════════════════════════════════════

  // Subject for item added event
  private itemAddedSubject = new Subject<Product>();
  itemAdded$ = this.itemAddedSubject.asObservable();

  // Subject for item removed event 
  private itemRemovedSubject = new Subject<Product>();
  itemRemoved$ = this.itemRemovedSubject.asObservable();

  // Subject for cart cleared event
  private cartClearedSubject = new Subject<void>();
  cartCleared$ = this.cartClearedSubject.asObservable();

  // ═══════════════════════════════════════════════════════════
  // EFFECTS - Side Effects
  // ═══════════════════════════════════════════════════════════
  constructor() {
    //Effect: load cart from localStorage on initialization
    effect(() => {
      this.loadCartFromStorage();
    }, { allowSignalWrites: true});

    //Effect: save cart to localStorage when cart whenever it changes
    effect(() => {
      const items = this.cartItemsSignal();
      this.saveCartToStorage(items);
      console.log('🛒 Cart updated:', items.length, 'items');
    });

    //Effect: Log total when it changes
    effect(() => {
      const totalValue = this.total();
      console.log('💰 Cart Total:', totalValue.toFixed(2));
    });
  }

  // ═══════════════════════════════════════════════════════════
  // CART OPERATIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Add product to cart
   * @param product - Product to add
   * @param quantity - Quantity to add (default: 1)
   */
  addToCart(product: Product, quantity: number = 1): void {
    this.cartItemsSignal.update(items => {
      const existingItem = items.find(
        item => item.product.id === product.id
      );

      if(existingItem) {
        // Update quantity if product already exists
        return items.map(item => item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity}
          : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          product,
          quantity,
          addedAt: new Date()
        };
        return [...items, newItem];
      }
    });
    // Emit event
    this.itemAddedSubject.next(product);
    console.log('✅ Added to cart:', product.title);
  }

  /**
   * Remove product from cart
   * @param productId - Product ID to remove
   */
  removeFromCart(productId: number): void {
    const removedProduct = this.cartItemsSignal().find(item => item.product.id === productId)?.product;

    this.cartItemsSignal.update(items => items.filter(item => item.product.id !== productId));

    if(removedProduct) {
      this.itemRemovedSubject.next(removedProduct);
      console.log('❌ Removed from cart:', removedProduct.title);
    }
  }

  /**
   * Update item quantity 
   * @param productId - Product ID
   * @param quantity - New quantity
   */
  updateQuantity(productId: number, quantity: number): void {
    if(quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.cartItemsSignal.update(items => items.map(item => item.product.id === productId ? { ...item, quantity } : item));
    console.log('🔄️ Updated quantity for product:', productId);
  }

  /**
   * Increment item quantity
   * @param productId - Product ID
   */
  incrementQuantity(productId: number): void {
    this.cartItemsSignal.update(items => items.map(item => item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
  }

  /**
   * Decrement item quantity
   * @para productId - Product ID
   */
  decrementQuantity(productId: number): void {
    const item = this.cartItemsSignal().find(i => i.product.id === productId);

    if(item && item.quantity > 1) {
      this.cartItemsSignal.update(items => items.map(i => i.product.id === productId ? {...i, quantity: i.quantity - 1} : i));
    } else {
      this.removeFromCart(productId);
    }

  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    this.cartItemsSignal.set([]);
    this.cartClearedSubject.next();
    console.log('🗑️ cart cleared');
  }

  /**
   * Check if product is in cart
   * @param productId - Product ID to check
   */
  isInCart(productId: number): boolean {
    return this.cartItemsSignal().some(item => item.product.id === productId);
  }

  /**
   * Get item from cart
   * @param productId - Product ID
   */
  getCartItem(productId: number): CartItem | undefined {
    return this.cartItemsSignal().find(item => item.product.id === productId);
  }

  /**
   * Get product quantity in cart
   * @param productId - Product ID
   */
  getProductQuantity(productId: number): number {
    const item = this.getCartItem(productId);
    return item?.quantity || 0;
  }

  // ═══════════════════════════════════════════════════════════
  // LOCALSTORAGE PERSISTENCE
  // ═══════════════════════════════════════════════════════════

  /**
   * Save cart to localStorage
   */
  private saveCartToStorage(items: CartItem[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }


  // Load cart from localStorage
  private loadCartFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const cartData = localStorage.getItem('cart');
      if(cartData) {
        const items = JSON.parse(cartData);
        this.cartItemsSignal.set(items);
        console.log('✅ Cart loaded from storage')
      } 
    }catch (error) {
      console.error('Failed to load cart:', error);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // CHECKOUT METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * Prepare checkout data
   */
  prepareCheckout(): Cart {
    return {
      items: this.cartItemsSignal(),
      subTotal: this.subtotal(),
      tax: this.tax(),
      shipping: this.shipping(),
      total: this.total(),
      itemCount: this.itemCount()
    };
  }

  /**
   * Simulate checkout process
   */
  checkout(): void {
    console.log('🛒 Processing checkout...');
    console.log('Total amount:', this.total());
    //In Real app, call API to process order
    this.clearCart();
    console.log('✅ Order placed successfully!');
  }
}
