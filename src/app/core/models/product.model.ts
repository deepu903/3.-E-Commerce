// Main Product interface Complete product object
export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage?: number;
    rating?: number;
    stock: number;
    brand?: string;
    category: string;
    thumbnail: string;
    images?: string[];
    tags?: string[];
    weight?: number;
    dimensions?: ProductDimensions;
    warrantyInformation?: string;
    shippingInformation?: string;
    availabilityStatus?: string;
    reviews?: ProductReview[];
    returnPolicy?: string;
    minimumOrderQuantity?: number;
}

// Product Dimensions interface
export interface ProductDimensions {
    height: number;
    width: number;
    depth: number;
}

// Product Review interface
export interface ProductReview {
    rating: number;
    comment: string;
    date: Date;
    reviewerName: string;
    reviewerEmail: string;
}

// Product Response Interface API response for products list
export interface ProductResponse {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}

// Cart Item interface Product in shopping cart with quantity
export interface CartItem {
    product: Product;
    quantity: number;
    addedAt: Date;
}

// Cart interface complete shopping cart
export interface Cart {
    items: CartItem[];
    subTotal: number;
    tax: number;
    shipping: number;
    total: number;
    itemCount: number;
}

// Category interface
export interface Category {
    slug: string;
    name: string;
    url: string;
}

// Product filter interface for filtering products
export interface ProductFilter {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
    rating?: string;
    inStock?: boolean;
    sortBy?: 'price' | 'rating' | 'title' | 'newest';
    sortOrder?: 'asc' | 'desc';
    searchQuery?: string;
}

// Wishlist Item InterFace
export interface WishlistItem {
    product: Product;
    addedAt: Date;
}

// Generic API Response interface strongly typed API responses
export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
    error?: string;
}

// Product Form Data Interface for add/edit product form
export interface ProductFormData {
    title: string;
    description: string;
    price: number;
    discountPercentage?: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail?: string;
    images?: string[];
}

// Order Interface
export interface Order {
    id: number;
    userId: number;
    products: CartItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: string;
    shippingAddress: string;
    orderDate: Date;
    deliveryDate: Date;
}

// Calculate discounted price
export function getDiscountedPrice(product: Product): number {
    if (!product.discountPercentage) {
        return product.price;
    }
    const discount = (product.price * product.discountPercentage) / 100;
    return product.price - discount;
}

// Check if product is in stock
export function isInStock(product: Product) {
    return product.stock > 0;
}

// Get Product rating stars array
export function getRatingStars(rating: number): boolean[] {
    return Array.from({length: 5}, (_, i) => i < Math.round(rating))
}

// Calculate cart total
export function calculateCartTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
        const price = getDiscountedPrice(item.product);
        return total + (price * item.quantity);
    },0);
}

// Calculate cart item count
export function getCartItemCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0);
}

// Format price in Indian Rupees
export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
}

// Generate product slug from title
export function generateSlug(title: string): string{
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}