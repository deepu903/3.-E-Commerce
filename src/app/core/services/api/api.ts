import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, retry, throwError, tap } from 'rxjs';
import { Category, Product, ProductResponse } from '../../models/product.model';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Inject HttpClient using new Angular inject() function
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // Base API URL
  private apiUrl = 'https://dummyjson.com';

  // PRODUCT CRUD OPERATIONS
  
  
  /**
   * GET - Fetch all products with pagination
   * @param limit - Number of products to fetch
   * @param skip - Number of products to skip
   */
  getProducts(limit: number = 30,skip: number = 0
  ): Observable<ProductResponse> {
    const params = new HttpParams().set('limit', limit.toString()).set('skip', skip.toString());

    return this.http.get<ProductResponse>(`${this.apiUrl}/products`, { params }).pipe(retry(2),catchError(this.handleError));
  }

  /**
   * GET - Fetch single product by ID
   * @param id - Product ID
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(
      `${this.apiUrl}/products/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST - Create new product
   * @param product - Product data
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(
      `${this.apiUrl}/products/add`, product, { headers: this.getHeaders() }).pipe(catchError(this.handleError));
  }

  /**
   * PUT - Update existing product
   * @param id - Product ID
   * @param product - Update product data
   */
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`
      ${this.apiUrl}/products/${id}`, 
      product, 
      {headers:this.getHeaders()}
    ).pipe(
        catchError(this.handleError)
      );
  }

  /**
   * DELETE - Remove product
   * @param id - Product ID
   */
  deleteProduct(id: number): Observable<any>{
    return this.http.delete<{isDeleted: boolean; id: number}>(
      `${this.apiUrl}/products/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET - Search products by query
   * @param query - Search query string
   */
  searchProducts(query: string): Observable<ProductResponse>{
    return this.http.get<ProductResponse>(
      `${this.apiUrl}/products/search?q=${encodeURIComponent(query)}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get products by Category
   * @param category - Category slug
   */
  getProductByCategory(category: string): Observable<ProductResponse>{
    return this.http.get<ProductResponse>(
      `${this.apiUrl}/products/category/${category}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get all categories
   */
  getCategories(): Observable<Category[]>{
    return this.http.get<Category[]>(
      `${this.apiUrl}/products/categories`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST - Register new user
   * @param data - Registration data
   */
  register(data: RegisterData): Observable<User> {
    const payload = {
      username: data.username,
      password: data.password,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      phone: data.phone,
      role: data.role || 'user'
    };

    return this.http.post<User>(
      `${this.apiUrl}/users/add`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST - User login
   * @param credentials - Login credentials 
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      credentials,
      { headers: this.getHeaders() }
    ).pipe(
      tap(() => console.log('📤 Login Request Sent:', JSON.stringify(credentials))),
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(
      `${this.apiUrl}/auth/me`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST - Refresh auth token
   * @param refreshToken - Refresh token
   */
  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/refresh`,
      { refreshToken },
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get all users (admin only)
   */
  getUser(limit: number = 30): Observable<any> {
    const params = new HttpParams()
    .set('limit', limit.toString());
    return this.http.get<any>(
      `${this.apiUrl}/users`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET - Get user by ID
   * @param id - User id
   */
  getUserById(id:number): Observable<User> {
    return this.http.get<User>(
      `${this.apiUrl}/users/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Get common HTTP headers
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  /**
   * Get headers with authorization token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId) 
      ? localStorage.getItem('token') 
      : null;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Handle HTTP errors
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error accurred';

    if(error.error instanceof ErrorEvent) {
      // Clien-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-Side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }

    console.error('API Error:', errorMessage);
    if(error.error) {
        console.error('API Error Details (Body):', error.error);
    }
    return throwError(() => new Error(errorMessage));
  }
}
