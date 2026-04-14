import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Injectable, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';

Chart.register(...registerables);

// ==================== INTERFACES ====================
export interface CouponUsage {
  id: number;
  couponId: number;
  couponCode: string;
  orderId: number;
  orderNumber: string;
  customerId?: number;
  customerName: string;
  customerEmail: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  usedAt: string;
  status: 'SUCCESS' | 'CANCELLED' | 'REFUNDED';
  orderStatus?: string;
}
export interface DashboardStats {
  totalRevenue: number;
  pendingOrders: number;
  unreadMessages: number;
  lowStockProducts: number;
  urgentMessages: number;
  averageOrderValue: number;
  revenueThisMonth: number;
  newCustomersThisMonth: number;
  monthlyStats: any[];
  topProducts: any[];
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  totalMessages: number;
  ordersThisMonth?: number;
  totalCategories?: number;
  activeCoupons?: number;
  customersWithOrders?: number;
  customersWithoutOrders?: number;
  customerOrderRate?: number;
  revenueToday?: number;
  revenueThisWeek?: number;
  revenueThisYear?: number;
  ordersToday?: number;
  ordersThisWeek?: number;
  conversionRate?: number;
  averageItemsPerOrder?: number;
  refundedOrders?: number;
  returnRate?: number;
  customerSatisfaction?: number;
  topCategories?: any[];
  salesByCategory?: any[];
  customerAcquisitionCost?: number;
  customerLifetimeValue?: number;
  repeatCustomerRate?: number;
  abandonedCarts?: number;
  inventoryValue?: number;
  bestSellingProducts?: any[];
  worstSellingProducts?: any[];
  salesGrowth?: number;
  customerGrowth?: number;
  orderGrowth?: number;
  dailyStats?: any[];
  weeklyStats?: any[];
  yearlyStats?: any[];
  salesByCountry?: any[];
  customersByCountry?: any[];
  newVsReturningCustomers?: any;
  customerDemographics?: any;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  priority: string;
  status: string;
  adminResponse?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  repliedAt?: string;
}

export interface CustomerOrder {
  couponCode?: string;  // AJOUTER CE CHAMP
  
  isTemporary: any;
  source: string;
  id: number;
  orderNumber: string;
  customerId?: number;
  customerFirstName?: string;
  customerLastName?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress?: string;
  status: string;
  orderDate: string;
  paymentStatus?: string;
  paymentMethod?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  subtotal: number;
  shippingCost: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  orderItems?: OrderItem[];
  
  // ADD THESE PROPERTIES TO FIX THE ERRORS
  synchronizedAt?: string;
  lastUpdate?: string;
  receivedAt?: string;
  governorate?: string;
  city?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  brand?: string;
  weight?: number;
  isActive: boolean;
  salesCount?: number;
  createdAt?: string;
  updatedAt?: string;
  composition?: string;
  skinType?: string;
  reference?: string;
  specialOffer?: string;
  originalPrice?: number;
  hasDiscount?: boolean;
  discountPercentage?: number;
  couponIds?: number[];
  discountedPrice?: number;
  lastSaleDate?: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  governorate?: string;
  ordersCount?: number;
  totalSpent?: number;
  registrationDate?: string;
  firstOrderDate?: string;
  lastOrderDate?: string;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountValue: number;
  discountType: string;
  discountExtra?: number;
  expiryDate: string;
  startDate?: string;
  description?: string;
  maxUses?: number;        // ← Limite maximale (ex: 100)
  usedCount: number;       // ← Compteur actuel (doit être incrémenté)
  minOrderAmount?: number;
  isActive: boolean;
  freeShipping?: boolean;
  createdAt?: string;
  updatedAt?: string;
  applicableProducts?: number[];
}

export interface OrderItem {
  id: number;
  orderId?: number;
  productId?: number;
  productName: string;
  productSku?: string;
  productCategory?: string;
  price: number;
  quantity: number;
  total: number;
  createdAt?: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  type: 'INCREMENT' | 'DECREMENT' | 'ADJUSTMENT' | 'INITIAL' | 'CORRECTION';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  notes?: string;
  reference?: string;
  performedBy: string;
  performedAt: string;
  costPrice?: number;
  retailPrice?: number;
}

export interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  currentStock: number;
  threshold: number;
  status: 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK' | 'OK';
  lastAlertDate?: string;
  alertCount: number;
  notified: boolean;
}

export interface InventoryReport {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalStockValue: number;
  averageStockLevel: number;
  stockTurnoverRate: number;
  bestSellingProducts: Product[];
  slowMovingProducts: Product[];
  stockMovements: StockMovement[];
  stockAlerts: StockAlert[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  dashboard?: DashboardStats;
  messages?: Message[];
  orders?: CustomerOrder[];
  products?: Product[];
  customers?: Customer[];
  categories?: Category[];
  coupons?: Coupon[];
  orderItems?: OrderItem[];
  messageData?: Message;
  order?: CustomerOrder;
  valid?: boolean;
  canDelete?: boolean;
  deletedCount?: number;
  cannotDeleteCount?: number;
  imageUrl?: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  stats?: any;
  coupon?: Coupon;
  user?: any;
  token?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  imageUrl: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  validated?: boolean;
}

export interface ImageUrlResponse {
  success: boolean;
  message: string;
  imageUrl: string;
  validated: boolean;
}

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  code?: string;
  discountValue?: number;
  discountType?: string;
  applicableProducts?: number[];
  minOrderAmount?: number;
  freeShipping?: boolean;
}

export interface CouponSimulationResult {
  success: boolean;
  valid: boolean;
  coupon?: Coupon;
  originalAmount: number;
  discountAmount: number;
  discountType: string;
  discountValue: number;
  finalAmount: number;
  freeShipping: boolean;
  savingsPercentage: number;
  message?: string;
  minOrderAmount?: number;
}

export interface CouponValidationResponse {
  success: boolean;
  exists: boolean;
  valid: boolean;
  status: string;
  coupon?: Coupon;
}

// ==================== SERVICE ====================

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';
  private savonProductsKey = 'savonProducts';
  private adminProductsKey = 'adminProducts';
  private huilesEssentiellesProductsKey = 'huilesEssentiellesProducts';
  private huileOliveProductsKey = 'huileOliveProducts';
  private couponsKey = 'adminCoupons';
  private productCouponsKey = 'productCoupons';
  getSoinProductsOnly: any;

  constructor(private http: HttpClient) {}

  // ==================== GESTION DE STOCK ====================

  getStockMovements(productId?: number): Observable<ApiResponse<StockMovement[]>> {
    const url = productId 
      ? `${this.apiUrl}/stock/movements?productId=${productId}`
      : `${this.apiUrl}/stock/movements`;
    
    return this.http.get<ApiResponse<StockMovement[]>>(url)
      .pipe(catchError(this.handleError<ApiResponse<StockMovement[]>>('getStockMovements')));
  }

  getStockAlerts(): Observable<ApiResponse<StockAlert[]>> {
    return this.http.get<ApiResponse<StockAlert[]>>(`${this.apiUrl}/stock/alerts`)
      .pipe(catchError(this.handleError<ApiResponse<StockAlert[]>>('getStockAlerts')));
  }

  getInventoryReport(): Observable<ApiResponse<InventoryReport>> {
    return this.http.get<ApiResponse<InventoryReport>>(`${this.apiUrl}/stock/inventory-report`)
      .pipe(catchError(this.handleError<ApiResponse<InventoryReport>>('getInventoryReport')));
  }

  adjustStock(productId: number, quantity: number, reason: string, notes?: string): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/stock/adjust/${productId}`, {
      quantity,
      reason,
      notes
    }).pipe(catchError(this.handleError<ApiResponse<Product>>('adjustStock')));
  }

  incrementStock(productId: number, quantity: number, reason: string, notes?: string): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/stock/increment/${productId}`, {
      quantity,
      reason,
      notes
    }).pipe(catchError(this.handleError<ApiResponse<Product>>('incrementStock')));
  }

  decrementStock(productId: number, quantity: number, reason: string, notes?: string): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/stock/decrement/${productId}`, {
      quantity,
      reason,
      notes
    }).pipe(catchError(this.handleError<ApiResponse<Product>>('decrementStock')));
  }

  setStockThreshold(productId: number, threshold: number): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/stock/threshold/${productId}`, {
      threshold
    }).pipe(catchError(this.handleError<ApiResponse<Product>>('setStockThreshold')));
  }

  bulkStockUpdate(updates: Array<{productId: number, quantity: number, reason: string}>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/stock/bulk-update`, {
      updates
    }).pipe(catchError(this.handleError<ApiResponse<any>>('bulkStockUpdate')));
  }

  getStockHistory(startDate?: string, endDate?: string): Observable<ApiResponse<StockMovement[]>> {
    let url = `${this.apiUrl}/stock/history`;
    const params = [];
    
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<ApiResponse<StockMovement[]>>(url)
      .pipe(catchError(this.handleError<ApiResponse<StockMovement[]>>('getStockHistory')));
  }

  // ==================== AUTHENTIFICATION ====================

  login(username: string, password: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/login`, {
      username: username,
      password: password
    }).pipe(catchError(this.handleError<ApiResponse<any>>('login')));
  }

  verifyToken(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/verify-token`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('verifyToken')));
  }

  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/logout`, {})
      .pipe(catchError(this.handleError<ApiResponse<any>>('logout')));
  }

  // ==================== MÉTHODES POUR LES COUPONS ====================

  validateCouponForOrder(
    couponCode: string, 
    orderItems: OrderItem[], 
    orderTotal: number, 
    shippingCost: number = 0
  ): Observable<CouponValidationResult> {
    return this.http.post<CouponSimulationResult>(`${this.apiUrl}/coupons/simulate`, {
      code: couponCode,
      orderAmount: orderTotal,
      shippingCost: shippingCost
    }).pipe(
      map(response => {
        const result: CouponValidationResult = {
          isValid: response.valid,
          message: response.message || (response.valid ? 'Coupon valide' : 'Coupon invalide'),
          code: couponCode,
          discountValue: response.discountValue,
          discountType: response.discountType,
          freeShipping: response.freeShipping
        };
        
        if (response.minOrderAmount) {
          result.minOrderAmount = response.minOrderAmount;
        }
        
        return result;
      }),
      catchError(this.handleError<CouponValidationResult>('validateCouponForOrder'))
    );
  }

  generateCouponCode(prefix: string = 'PROMO'): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/coupons/generate-code`, {
      prefix: prefix
    }).pipe(catchError(this.handleError<ApiResponse<string>>('generateCouponCode')));
  }

  validateCouponCode(couponCode: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/coupons/validate-code`, {
      code: couponCode
    }).pipe(catchError(this.handleError<ApiResponse<any>>('validateCouponCode')));
  }

  simulateCouponApplication(
    couponCode: string, 
    orderAmount: number
  ): Observable<CouponSimulationResult> {
    return this.http.post<CouponSimulationResult>(`${this.apiUrl}/coupons/simulate`, {
      code: couponCode,
      orderAmount: orderAmount
    }).pipe(catchError(this.handleError<CouponSimulationResult>('simulateCouponApplication')));
  }

  useCoupon(
    couponCode: string, 
    orderAmount: number = 0
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/coupons/use`, {
      code: couponCode,
      orderAmount: orderAmount
    }).pipe(catchError(this.handleError<ApiResponse<any>>('useCoupon')));
  }

  getCouponStatistics(couponId: number): Observable<ApiResponse<any>> {
    return this.getCouponStats(couponId);
  }

  getCouponStats(couponId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/coupons/stats/${couponId}`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('getCouponStats')));
  }

  validateCoupon(couponCode: string): Observable<CouponValidationResponse> {
    return this.http.post<CouponValidationResponse>(`${this.apiUrl}/coupons/validate-code`, {
      code: couponCode
    }).pipe(catchError(this.handleError<CouponValidationResponse>('validateCoupon')));
  }

  // ==================== MÉTHODES POUR L'UPLOAD D'IMAGES ====================

  validateImageUrl(imageUrl: string): Observable<ImageUrlResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|svg))(:\d+)?(\/.*)?$/i;
        const isValid = urlPattern.test(imageUrl);
        
        observer.next({
          success: true,
          message: isValid ? 'URL valide' : 'URL invalide',
          imageUrl: imageUrl,
          validated: isValid
        });
        observer.complete();
      }, 500);
    });
  }

  uploadImageByUrl(imageUrl: string, uploadType: string): Observable<ImageUploadResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          message: 'Image téléchargée par URL',
          imageUrl: imageUrl,
          validated: true
        });
        observer.complete();
      }, 1000);
    });
  }

  uploadProductImageByUrl(imageUrl: string): Observable<ImageUploadResponse> {
    return this.uploadImageByUrl(imageUrl, 'products');
  }

  uploadCategoryImageByUrl(imageUrl: string): Observable<ImageUploadResponse> {
    return this.uploadImageByUrl(imageUrl, 'categories');
  }

  uploadImage(file: File, uploadType: string): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file, file.name);
    formData.append('uploadType', uploadType);

    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/upload/image`, formData)
      .pipe(catchError(this.handleError<ImageUploadResponse>('uploadImage')));
  }

  uploadProductImage(file: File): Observable<ImageUploadResponse> {
    return this.uploadImage(file, 'products');
  }

  uploadCategoryImage(file: File): Observable<ImageUploadResponse> {
    return this.uploadImage(file, 'categories');
  }

  // ==================== MÉTHODES POUR LES CLIENTS ====================

  createCustomer(customerData: any): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.apiUrl}/customers`, customerData)
      .pipe(catchError(this.handleError<ApiResponse<Customer>>('createCustomer')));
  }

  createCustomerFromOrder(order: CustomerOrder): Observable<ApiResponse<Customer>> {
    const { firstName, lastName } = this.extractCustomerNames(order.customerName);
    
    const customerData = {
      firstName: firstName,
      lastName: lastName,
      email: order.customerEmail,
      phoneNumber: order.customerPhone || '',
      address: order.deliveryAddress || '',
      ordersCount: 1,
      totalSpent: order.totalAmount,
      firstOrderDate: order.orderDate,
      lastOrderDate: order.orderDate,
      isActive: true
    };

    return this.http.post<ApiResponse<Customer>>(`${this.apiUrl}/customers`, customerData)
      .pipe(catchError(this.handleError<ApiResponse<Customer>>('createCustomerFromOrder')));
  }

  getOrCreateCustomerFromOrder(order: CustomerOrder): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.apiUrl}/customers/get-or-create`, {
      email: order.customerEmail,
      name: order.customerName,
      orderData: order
    }).pipe(catchError(this.handleError<ApiResponse<Customer>>('getOrCreateCustomerFromOrder')));
  }

  updateCustomerFromOrder(customerId: number, order: CustomerOrder): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.apiUrl}/customers/${customerId}/update-from-order`, {
      orderAmount: order.totalAmount,
      orderDate: order.orderDate
    }).pipe(catchError(this.handleError<ApiResponse<Customer>>('updateCustomerFromOrder')));
  }

  updateCustomer(id: number, customerData: any): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.apiUrl}/customers/${id}`, customerData)
      .pipe(catchError(this.handleError<ApiResponse<Customer>>('updateCustomer')));
  }

  private extractCustomerNames(fullName: string): { firstName: string, lastName: string } {
    const nameParts = fullName.trim().split(' ');
    
    if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: '' };
    }
    
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    return { firstName, lastName };
  }

  // ==================== MÉTHODES SPÉCIFIQUES POUR CHAQUE PAGE ====================

  getSavonProductsOnly(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`)
      .pipe(
        map(response => {
          if (response.success && response.products) {
            const savonProducts = response.products.filter(product => 
              this.isSavonProduct(product)
            );
            return {
              ...response,
              products: savonProducts
            };
          }
          return response;
        }),
        catchError(this.handleError<ApiResponse<Product[]>>('getSavonProductsOnly'))
      );
  }

  getHuilesEssentiellesProductsOnly(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`)
      .pipe(
        map(response => {
          if (response.success && response.products) {
            const huilesProducts = response.products.filter(product => 
              this.isHuilesEssentiellesProduct(product)
            );
            return {
              ...response,
              products: huilesProducts
            };
          }
          return response;
        }),
        catchError(this.handleError<ApiResponse<Product[]>>('getHuilesEssentiellesProductsOnly')));
  }

  // ==================== SUPPRESSION DÉFINITIVE ====================

  deleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/products/${id}`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('deleteProduct')));
  }

  deleteCustomer(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/customers/${id}`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('deleteCustomer')));
  }

  canDeleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/products/${id}/can-delete`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('canDeleteProduct')));
  }

  bulkDeleteProducts(productIds: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/products/bulk-delete`, {
      productIds: productIds
    }).pipe(catchError(this.handleError<ApiResponse<any>>('bulkDeleteProducts')));
  }

  bulkDeleteCustomers(customerIds: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/customers/bulk-delete`, {
      customerIds: customerIds
    }).pipe(catchError(this.handleError<ApiResponse<any>>('bulkDeleteCustomers')));
  }

  deleteCategory(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/categories/${id}`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('deleteCategory')));
  }

  deleteCoupon(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/coupons/${id}`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('deleteCoupon')));
  }

  deleteMessage(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/messages/${id}`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('deleteMessage')));
  }

  // ==================== MÉTHODES DU SERVICE EXISTANTES ====================

  getDashboard(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard`)
      .pipe(catchError(this.handleError<ApiResponse<DashboardStats>>('getDashboard')));
  }

  getAllMessages(): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${this.apiUrl}/messages`)
      .pipe(catchError(this.handleError<ApiResponse<Message[]>>('getAllMessages')));
  }

  getAllOrders(): Observable<ApiResponse<CustomerOrder[]>> {
    return this.http.get<ApiResponse<CustomerOrder[]>>(`${this.apiUrl}/orders`)
      .pipe(catchError(this.handleError<ApiResponse<CustomerOrder[]>>('getAllOrders')));
  }

  getAllProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`)
      .pipe(catchError(this.handleError<ApiResponse<Product[]>>('getAllProducts')));
  }

  getAllCustomers(): Observable<ApiResponse<Customer[]>> {
    return this.http.get<ApiResponse<Customer[]>>(`${this.apiUrl}/customers`)
      .pipe(catchError(this.handleError<ApiResponse<Customer[]>>('getAllCustomers')));
  }

  getAllCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/categories`)
      .pipe(catchError(this.handleError<ApiResponse<Category[]>>('getAllCategories')));
  }

  getAllCoupons(): Observable<ApiResponse<Coupon[]>> {
    return this.http.get<ApiResponse<Coupon[]>>(`${this.apiUrl}/coupons`)
      .pipe(catchError(this.handleError<ApiResponse<Coupon[]>>('getAllCoupons')));
  }

  getAllOrderItems(): Observable<ApiResponse<OrderItem[]>> {
    return this.http.get<ApiResponse<OrderItem[]>>(`${this.apiUrl}/order-items`)
      .pipe(catchError(this.handleError<ApiResponse<OrderItem[]>>('getAllOrderItems')));
  }

  getProductsByCategory(category: string): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products/category/${category}`)
      .pipe(catchError(this.handleError<ApiResponse<Product[]>>('getProductsByCategory')));
  }

  markMessageAsRead(id: number): Observable<ApiResponse<Message>> {
    return this.http.put<ApiResponse<Message>>(`${this.apiUrl}/messages/${id}/read`, {})
      .pipe(catchError(this.handleError<ApiResponse<Message>>('markMessageAsRead')));
  }

  markMessageAsUnread(id: number): Observable<ApiResponse<Message>> {
    return this.http.put<ApiResponse<Message>>(`${this.apiUrl}/messages/${id}/unread`, {})
      .pipe(catchError(this.handleError<ApiResponse<Message>>('markMessageAsUnread')));
  }

  respondToMessage(id: number, response: string, adminNotes: string): Observable<ApiResponse<Message>> {
    return this.http.post<ApiResponse<Message>>(`${this.apiUrl}/messages/${id}/respond`, {
      response,
      adminNotes
    }).pipe(catchError(this.handleError<ApiResponse<Message>>('respondToMessage')));
  }

  updateMessagePriority(id: number, priority: string): Observable<ApiResponse<Message>> {
    return this.http.put<ApiResponse<Message>>(`${this.apiUrl}/messages/${id}/priority`, { priority })
      .pipe(catchError(this.handleError<ApiResponse<Message>>('updateMessagePriority')));
  }

  updateOrderStatus(id: number, status: string): Observable<ApiResponse<CustomerOrder>> {
    return this.http.put<ApiResponse<CustomerOrder>>(`${this.apiUrl}/orders/${id}/status`, { status })
      .pipe(catchError(this.handleError<ApiResponse<CustomerOrder>>('updateOrderStatus')));
  }

  updateTrackingNumber(id: number, trackingNumber: string): Observable<ApiResponse<CustomerOrder>> {
    return this.http.put<ApiResponse<CustomerOrder>>(`${this.apiUrl}/orders/${id}/tracking`, { trackingNumber })
      .pipe(catchError(this.handleError<ApiResponse<CustomerOrder>>('updateTrackingNumber')));
  }

  confirmOrder(id: number): Observable<ApiResponse<CustomerOrder>> {
    return this.http.put<ApiResponse<CustomerOrder>>(`${this.apiUrl}/orders/${id}/confirm`, {})
      .pipe(catchError(this.handleError<ApiResponse<CustomerOrder>>('confirmOrder')));
  }

  shipOrder(id: number, trackingNumber: string): Observable<ApiResponse<CustomerOrder>> {
    return this.http.put<ApiResponse<CustomerOrder>>(`${this.apiUrl}/orders/${id}/ship`, { trackingNumber })
      .pipe(catchError(this.handleError<ApiResponse<CustomerOrder>>('shipOrder')));
  }

  deliverOrder(id: number): Observable<ApiResponse<CustomerOrder>> {
    return this.http.put<ApiResponse<CustomerOrder>>(`${this.apiUrl}/orders/${id}/deliver`, {})
      .pipe(catchError(this.handleError<ApiResponse<CustomerOrder>>('deliverOrder')));
  }

  cancelOrder(id: number): Observable<ApiResponse<CustomerOrder>> {
    return this.http.put<ApiResponse<CustomerOrder>>(`${this.apiUrl}/orders/${id}/cancel`, {})
      .pipe(catchError(this.handleError<ApiResponse<CustomerOrder>>('cancelOrder')));
  }

  createProduct(productData: any): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/products`, productData)
      .pipe(catchError(this.handleError<ApiResponse<Product>>('createProduct')));
  }

  updateProduct(id: number, productData: any): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`, productData)
      .pipe(catchError(this.handleError<ApiResponse<Product>>('updateProduct')));
  }

  updateProductStock(id: number, stockQuantity: number): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/products/${id}/stock`, { stockQuantity })
      .pipe(catchError(this.handleError<ApiResponse<Product>>('updateProductStock')));
  }

  updateProductStatus(id: number, isActive: boolean): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/products/${id}/status`, { isActive })
      .pipe(catchError(this.handleError<ApiResponse<Product>>('updateProductStatus')));
  }

  createCategory(categoryData: any): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.apiUrl}/categories`, categoryData)
      .pipe(catchError(this.handleError<ApiResponse<Category>>('createCategory')));
  }

  updateCategory(id: number, categoryData: any): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.apiUrl}/categories/${id}`, categoryData)
      .pipe(catchError(this.handleError<ApiResponse<Category>>('updateCategory')));
  }

  createCoupon(couponData: any): Observable<ApiResponse<Coupon>> {
    return this.http.post<ApiResponse<Coupon>>(`${this.apiUrl}/coupons`, couponData)
      .pipe(catchError(this.handleError<ApiResponse<Coupon>>('createCoupon')));
  }

  updateCoupon(id: number, couponData: any): Observable<ApiResponse<Coupon>> {
    return this.http.put<ApiResponse<Coupon>>(`${this.apiUrl}/coupons/${id}`, couponData)
      .pipe(catchError(this.handleError<ApiResponse<Coupon>>('updateCoupon')));
  }

  // ==================== STATISTIQUES AVANCÉES ====================

  getAdvancedStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats/advanced`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('getAdvancedStats')));
  }

  getSystemInfo(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/system/info`)
      .pipe(catchError(this.handleError<ApiResponse<any>>('getSystemInfo')));
  }

  // ==================== MÉTHODES POUR LA SYNCHRONISATION ====================

  saveSavonProducts(products: Product[]): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      try {
        localStorage.setItem(this.savonProductsKey, JSON.stringify(products));
        
        const adminProducts = JSON.parse(localStorage.getItem(this.adminProductsKey) || '[]');
        
        products.forEach(savonProduct => {
          const existingIndex = adminProducts.findIndex((p: any) => p.id === savonProduct.id);
          if (existingIndex !== -1) {
            adminProducts[existingIndex] = { ...adminProducts[existingIndex], ...savonProduct };
          } else {
            adminProducts.push(savonProduct);
          }
        });
        
        localStorage.setItem(this.adminProductsKey, JSON.stringify(adminProducts));
        
        observer.next({
          success: true,
          message: `${products.length} produits savon sauvegardés avec succès`,
          data: products
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur sauvegarde produits savon:', error);
        observer.error(error);
      }
    });
  }

  getSavonProducts(): Observable<ApiResponse<Product[]>> {
    return new Observable(observer => {
      try {
        const products = JSON.parse(localStorage.getItem(this.savonProductsKey) || '[]');
        observer.next({
          success: true,
          products: products
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur récupération produits savon:', error);
        observer.error(error);
      }
    });
  }

  syncAdminToSavon(): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      try {
        const adminProducts = JSON.parse(localStorage.getItem(this.adminProductsKey) || '[]');
        
        const savonProducts = adminProducts.filter((product: any) => 
          this.isSavonProduct(product)
        );
        
        localStorage.setItem(this.savonProductsKey, JSON.stringify(savonProducts));
        
        window.dispatchEvent(new Event('savonProductsUpdated'));
        
        observer.next({
          success: true,
          message: `${savonProducts.length} produits savon synchronisés`,
          data: savonProducts
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur synchronisation savon:', error);
        observer.error(error);
      }
    });
  }

  saveHuilesEssentiellesProducts(products: Product[]): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      try {
        localStorage.setItem(this.huilesEssentiellesProductsKey, JSON.stringify(products));
        
        const adminProducts = JSON.parse(localStorage.getItem(this.adminProductsKey) || '[]');
        
        products.forEach(huilesProduct => {
          const existingIndex = adminProducts.findIndex((p: any) => p.id === huilesProduct.id);
          if (existingIndex !== -1) {
            adminProducts[existingIndex] = { ...adminProducts[existingIndex], ...huilesProduct };
          } else {
            adminProducts.push(huilesProduct);
          }
        });
        
        localStorage.setItem(this.adminProductsKey, JSON.stringify(adminProducts));
        
        observer.next({
          success: true,
          message: `${products.length} produits huiles essentielles sauvegardés avec succès`,
          data: products
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur sauvegarde produits huiles essentielles:', error);
        observer.error(error);
      }
    });
  }

  getHuilesEssentiellesProducts(): Observable<ApiResponse<Product[]>> {
    return new Observable(observer => {
      try {
        const products = JSON.parse(localStorage.getItem(this.huilesEssentiellesProductsKey) || '[]');
        observer.next({
          success: true,
          products: products
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur récupération produits huiles essentielles:', error);
        observer.error(error);
      }
    });
  }

  syncAdminToHuilesEssentielles(): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      try {
        const adminProducts = JSON.parse(localStorage.getItem(this.adminProductsKey) || '[]');
        
        const huilesProducts = adminProducts.filter((product: any) => 
          this.isHuilesEssentiellesProduct(product)
        );
        
        localStorage.setItem(this.huilesEssentiellesProductsKey, JSON.stringify(huilesProducts));
        
        window.dispatchEvent(new Event('huilesEssentiellesProductsUpdated'));
        
        observer.next({
          success: true,
          message: `${huilesProducts.length} produits huiles essentielles synchronisés`,
          data: huilesProducts
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur synchronisation huiles essentielles:', error);
        observer.error(error);
      }
    });
  }

  // ==================== MÉTHODES POUR L'HUILE D'OLIVE ====================

  saveHuileOliveProducts(products: Product[]): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      try {
        localStorage.setItem(this.huileOliveProductsKey, JSON.stringify(products));
        
        const adminProducts = JSON.parse(localStorage.getItem(this.adminProductsKey) || '[]');
        
        products.forEach(huileOliveProduct => {
          const existingIndex = adminProducts.findIndex((p: any) => p.id === huileOliveProduct.id);
          if (existingIndex !== -1) {
            adminProducts[existingIndex] = { ...adminProducts[existingIndex], ...huileOliveProduct };
          } else {
            adminProducts.push(huileOliveProduct);
          }
        });
        
        localStorage.setItem(this.adminProductsKey, JSON.stringify(adminProducts));
        
        observer.next({
          success: true,
          message: `${products.length} produits huile d'olive sauvegardés avec succès`,
          data: products
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur sauvegarde produits huile d\'olive:', error);
        observer.error(error);
      }
    });
  }

  getHuileOliveProducts(): Observable<ApiResponse<Product[]>> {
    return new Observable(observer => {
      try {
        const products = JSON.parse(localStorage.getItem(this.huileOliveProductsKey) || '[]');
        observer.next({
          success: true,
          products: products
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur récupération produits huile d\'olive:', error);
        observer.error(error);
      }
    });
  }

  syncAdminToHuileOlive(): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      try {
        const adminProducts = JSON.parse(localStorage.getItem(this.adminProductsKey) || '[]');
        
        const huileOliveProducts = adminProducts.filter((product: any) => 
          this.isHuileOliveProduct(product)
        );
        
        localStorage.setItem(this.huileOliveProductsKey, JSON.stringify(huileOliveProducts));
        
        window.dispatchEvent(new Event('huileOliveProductsUpdated'));
        
        observer.next({
          success: true,
          message: `${huileOliveProducts.length} produits huile d'olive synchronisés`,
          data: huileOliveProducts
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur synchronisation huile d\'olive:', error);
        observer.error(error);
      }
    });
  }

  isHuileOliveProduct(product: any): boolean {
    if (!product) return false;
    
    const category = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    const isHuileOlive = 
      category.includes('olive') || 
      name.includes('olive') ||
      description.includes('olive') ||
      category.includes('huile d\'olive') ||
      name.includes('huile d\'olive') ||
      category.includes('huile olive') ||
      name.includes('huile olive') ||
      category.includes('olive oil') ||
      name.includes('olive oil') ||
      category.includes('extra virgin') ||
      name.includes('extra virgin') ||
      category.includes('extra-vierge') ||
      name.includes('extra-vierge') ||
      category.includes('vierge') ||
      name.includes('vierge');
      
    const isActive = product.isActive === undefined ? true : product.isActive;
    
    return isHuileOlive && isActive;
  }

  // ==================== MÉTHODES POUR LES COUPONS AVEC PRODUITS ====================

  saveCoupons(coupons: Coupon[]): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      try {
        localStorage.setItem(this.couponsKey, JSON.stringify(coupons));
        observer.next({
          success: true,
          message: `${coupons.length} coupons sauvegardés`,
          data: coupons
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur sauvegarde coupons:', error);
        observer.error(error);
      }
    });
  }

  getCoupons(): Observable<ApiResponse<Coupon[]>> {
    return new Observable(observer => {
      try {
        const coupons = JSON.parse(localStorage.getItem(this.couponsKey) || '[]');
        observer.next({
          success: true,
          coupons: coupons
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur récupération coupons:', error);
        observer.error(error);
      }
    });
  }

  saveProductCoupons(productId: number, couponIds: number[]): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      try {
        const productCoupons = JSON.parse(localStorage.getItem(this.productCouponsKey) || '{}');
        productCoupons[productId] = couponIds;
        localStorage.setItem(this.productCouponsKey, JSON.stringify(productCoupons));
        
        observer.next({
          success: true,
          message: `${couponIds.length} coupons associés au produit`,
          data: { productId, couponIds }
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur sauvegarde coupons produit:', error);
        observer.error(error);
      }
    });
  }

  getProductCouponsLocal(productId: number): Observable<ApiResponse<number[]>> {
    return new Observable(observer => {
      try {
        const productCoupons = JSON.parse(localStorage.getItem(this.productCouponsKey) || '{}');
        const couponIds = productCoupons[productId] || [];
        
        observer.next({
          success: true,
          data: couponIds
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur récupération coupons produit:', error);
        observer.error(error);
      }
    });
  }

  // ==================== MÉTHODES POUR SYNCHRONISER LES COUPONS PAR PAGE ====================

  saveCouponsToLocalStorage(coupons: Coupon[]): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      try {
        localStorage.setItem('adminCoupons', JSON.stringify(coupons));
        
        observer.next({
          success: true,
          message: `${coupons.length} coupons sauvegardés`,
          data: coupons
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur sauvegarde coupons:', error);
        observer.error(error);
      }
    });
  }

  getCouponsForPage(pageType: 'savon' | 'huiles' | 'olive' | 'all'): Observable<ApiResponse<Coupon[]>> {
    return new Observable(observer => {
      try {
        const allCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
        let filteredCoupons: Coupon[] = [];
        
        if (pageType === 'all') {
          filteredCoupons = allCoupons;
        } else {
          filteredCoupons = allCoupons.filter((coupon: Coupon) => {
            if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
              return false;
            }
            
            const productCoupons = JSON.parse(localStorage.getItem(this.productCouponsKey) || '{}');
            return coupon.applicableProducts.some(productId => {
              const product = JSON.parse(localStorage.getItem(this.adminProductsKey) || '[]')
                .find((p: any) => p.id === productId);
              
              if (!product) return false;
              
              if (pageType === 'savon') {
                return this.isSavonProduct(product);
              } else if (pageType === 'huiles') {
                return this.isHuilesEssentiellesProduct(product);
              } else if (pageType === 'olive') {
                return this.isHuileOliveProduct(product);
              }
              return false;
            });
          });
        }
        
        observer.next({
          success: true,
          coupons: filteredCoupons
        });
        observer.complete();
      } catch (error) {
        console.error('❌ Erreur récupération coupons par page:', error);
        observer.error(error);
      }
    });
  }

  // ==================== MÉTHODES DE FILTRAGE CORRIGÉES ====================

  isSavonProduct(product: any): boolean {
    if (!product) return false;
    
    const category = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    const isSavon = 
      category.includes('savon') || 
      name.includes('savon') ||
      description.includes('savon') ||
      category.includes('soap') ||
      name.includes('soap') ||
      category.includes('savons') ||
      name.includes('savons') ||
      category.includes('bar') ||
      name.includes('bar');
      
    const isActive = product.isActive === undefined ? true : product.isActive;
    
    return isSavon && isActive;
  }

  isHuilesEssentiellesProduct(product: any): boolean {
    if (!product) return false;
    
    const category = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    const isHuilesEssentielles = 
      category.includes('huile') || 
      name.includes('huile') ||
      description.includes('huile') ||
      category.includes('essentiel') ||
      name.includes('essentiel') ||
      category.includes('aroma') ||
      name.includes('aroma') ||
      category.includes('diffuseur') ||
      name.includes('diffuseur') ||
      category.includes('bougie') ||
      name.includes('bougie') ||
      category.includes('parfum') ||
      name.includes('parfum') ||
      category.includes('odorat') ||
      name.includes('odorat') ||
      category.includes('sent') ||
      name.includes('sent') ||
      category.includes('encens') ||
      name.includes('encens');
      
    const isActive = product.isActive === undefined ? true : product.isActive;
    
    return isHuilesEssentielles && isActive;
  }

  // ==================== MÉTHODE POUR SYNCHRONISER LES CLIENTS ====================

  syncCustomersFromOrders(): Observable<ApiResponse<any>> {
    return new Observable(observer => {
      observer.next({
        success: true,
        message: 'Synchronisation gérée côté frontend'
      });
      observer.complete();
    });
  }

  // ==================== MÉTHODE DE GESTION D'ERREUR ====================

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      let errorMessage = 'Une erreur est survenue';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erreur: ${error.error.message}`;
      } else {
        errorMessage = `Erreur ${error.status}: ${error.message}`;
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        }
      }
      console.error(errorMessage);
      const safeResult: ApiResponse<any> = {
        success: false,
        message: errorMessage
      };
      return of(safeResult as T);
    };
  }
}

// ==================== COMPOSANT ADMIN ====================

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule
  ],
  providers: [AdminService]
})
export class AdminComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('ordersChart') ordersChartRef!: ElementRef;
  @ViewChild('salesChart') salesChartRef!: ElementRef;
  @ViewChild('productImageInput') productImageInput!: ElementRef;
  @ViewChild('categoryImageInput') categoryImageInput!: ElementRef;

  private destroy$ = new Subject<void>();

  // Navigation et état
  activeSection: string = 'dashboard';
  sidebarCollapsed = false;
  mobileMenuOpen = false;

  // Authentification
  isLoggedIn: boolean = true;
  currentUser: any = null;

  // Données principales
  dashboardStats: DashboardStats = {
    totalRevenue: 0,
    pendingOrders: 0,
    unreadMessages: 0,
    lowStockProducts: 0,
    urgentMessages: 0,
    averageOrderValue: 0,
    revenueThisMonth: 0,
    newCustomersThisMonth: 0,
    monthlyStats: [],
    topProducts: [],
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalMessages: 0,
    customersWithOrders: 0,
    customersWithoutOrders: 0,
    customerOrderRate: 0,
    revenueToday: 0,
    revenueThisWeek: 0,
    ordersToday: 0,
    conversionRate: 0,
    averageItemsPerOrder: 0,
    repeatCustomerRate: 0,
    customerLifetimeValue: 0,
    inventoryValue: 0,
    salesGrowth: 0,
    customerGrowth: 0,
    topCategories: [],
    salesByCategory: [],
    bestSellingProducts: [],
    worstSellingProducts: []
  };
  
  messages: Message[] = [];
  orders: CustomerOrder[] = [];
  products: Product[] = [];
  customers: Customer[] = [];
  categories: Category[] = [];
  coupons: Coupon[] = [];
  orderItems: OrderItem[] = [];

  // Gestion de stock
  stockMovements: StockMovement[] = [];
  stockAlerts: StockAlert[] = [];
  inventoryReport: InventoryReport | null = null;
  selectedStockMovement: StockMovement | null = null;

  // Liste des produits pour les coupons
  availableProductsForCoupons: Product[] = [];
  filteredProductsForCoupons: Product[] = [];
  
  // Produits pour la sélection dans les coupons
  filteredApplicableProducts: Product[] = [];
  availableApplicableProducts: Product[] = [];

  // Éléments sélectionnés
  selectedMessage: Message | null = null;
  selectedOrder: CustomerOrder | null = null;
  selectedProduct: Product | null = null;
  selectedCustomer: Customer | null = null;
  selectedCategory: Category | null = null;
  selectedCoupon: Coupon | null = null;

  // Onglet stock actuel
  currentStockTab: string = 'movements';

  // Formulaires
  productForm: FormGroup;
  categoryForm: FormGroup;
  couponForm: FormGroup;
  messageResponseForm: FormGroup;
  orderStatusForm: FormGroup;
  couponProductsForm: FormGroup;
  stockAdjustmentForm: FormGroup;
  stockThresholdForm: FormGroup;
  bulkStockForm: FormGroup;
  loginForm: FormGroup;

  // Propriétés pour l'upload d'image
  imagePreview: string | ArrayBuffer | null = null;
  selectedImageFile: File | null = null;
  categoryImagePreview: string | ArrayBuffer | null = null;
  selectedCategoryImageFile: File | null = null;
  
  // Propriétés pour l'upload par URL
  imageUrlInput: string = '';
  categoryImageUrlInput: string = '';
  isUrlValid: boolean = false;
  isCategoryUrlValid: boolean = false;
  urlValidationMessage: string = '';
  categoryUrlValidationMessage: string = '';
  
  uploadProgress: number = 0;
  isUploading: boolean = false;

  // Filtres et recherche
  messageFilter: string = 'all';
  orderFilter: string = 'all';
  productFilter: string = 'all';
  customerFilter: string = 'all';
  couponFilter: string = 'all';
  stockFilter: string = 'all';
  searchTerm: string = '';
  couponSearchTerm: string = '';
  dateRange: any = {
    start: '',
    end: ''
  };
  stockDateRange: any = {
    start: '',
    end: ''
  };

  // Pagination
  currentPage: any = {
    messages: 1,
    orders: 1,
    products: 1,
    customers: 1,
    categories: 1,
    coupons: 1,
    couponProducts: 1,
    stockMovements: 1,
    stockAlerts: 1
  };
  itemsPerPage = 10;
  couponProductsPerPage = 20;

  // États de chargement
  loading: any = {
    dashboard: false,
    messages: false,
    orders: false,
    products: false,
    customers: false,
    categories: false,
    coupons: false,
    couponProducts: false,
    stockMovements: false,
    stockAlerts: false,
    inventoryReport: false,
    action: false,
    auth: false
  };

  // États de modal
  modals: any = {
    product: false,
    category: false,
    coupon: false,
    couponProducts: false,
    stockAdjustment: false,
    stockThreshold: false,
    bulkStockUpdate: false,
    stockMovementDetail: false,
    inventoryReportModal: false,
    messageDetail: false,
    orderDetail: false,
    customerDetail: false,
    confirmDelete: false,
    deleteConfirmation: false,
    couponPreview: false,
    login: false
  };

  // Données pour suppression
  itemToDelete: any = null;
  deleteType: string = '';
  canDeleteItem: boolean = true;

  // Graphiques
  revenueChart: any;
  ordersChart: any;
  salesChart: any;

  // Statistiques en temps réel
  realTimeStats: any = {
    onlineUsers: 0,
    salesToday: 0,
    conversionRate: 0
  };

  // Alertes et notifications
  alerts: any[] = [];

  // Groupes de champs
  fieldGroups: any = {
    additionalInfo: false
  };

  // Sélection multiple pour suppression en masse
  selectedProducts: number[] = [];
  selectedCustomers: number[] = [];
  selectedCouponProducts: number[] = [];

  // Segments clients
  customerSegments: any = {};

  // Données pour prévisualisation coupon
  couponPreviewData: any = null;
  couponSimulationResult: CouponSimulationResult | null = null;

  // Données d'authentification
  username: string = '';
  password: string = '';
  apiUrl: any;
  loadOrdersWithFallback: any;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // Initialisation des formulaires
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      imageUrl: [''],
      brand: [''],
      weight: [0],
      isActive: [true],
      composition: [''],
      skinType: [''],
      reference: [''],
      specialOffer: ['']
    });

    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      imageUrl: [''],
      displayOrder: [0],
      isActive: [true]
    });

    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      discountValue: [0, [Validators.required, Validators.min(0)]],
      discountType: ['PERCENTAGE', Validators.required],
      discountExtra: [0],
      expiryDate: ['', Validators.required],
      startDate: [''],
      description: [''],
      maxUses: [100, [Validators.required, Validators.min(1)]],
      minOrderAmount: [0, [Validators.min(0)]],
      isActive: [true],
      freeShipping: [false],
      applicableProducts: [[]]
    });

    this.couponProductsForm = this.fb.group({
      searchTerm: [''],
      selectedProducts: [[]],
      selectAll: [false]
    });

    this.messageResponseForm = this.fb.group({
      response: ['', [Validators.required, Validators.minLength(10)]],
      adminNotes: ['']
    });

    this.orderStatusForm = this.fb.group({
      status: ['', Validators.required],
      trackingNumber: [''],
      notes: ['']
    });

    this.stockAdjustmentForm = this.fb.group({
      productId: ['', Validators.required],
      adjustmentType: ['ADJUSTMENT', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      reason: ['', Validators.required],
      notes: [''],
      reference: ['']
    });

    this.stockThresholdForm = this.fb.group({
      productId: ['', Validators.required],
      threshold: [10, [Validators.required, Validators.min(0)]]
    });

    this.bulkStockForm = this.fb.group({
      updates: this.fb.array([]),
      reason: ['', Validators.required]
    });
  }

  // ==================== LIFECYCLE HOOKS ====================

 

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.dashboardStats.monthlyStats.length > 0) {
        this.initCharts();
      }
    }, 1000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupCharts();
  }

  // ==================== AUTHENTIFICATION ====================

  checkAuthentication(): void {
    this.loading.auth = true;
    this.adminService.verifyToken().subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success && response.valid) {
          this.isLoggedIn = true;
          this.currentUser = response.user;
          this.loadInitialData();
        } else {
          this.showLoginModal();
        }
        this.loading.auth = false;
      },
      error: (error) => {
        console.error('Erreur vérification token:', error);
        this.showLoginModal();
        this.loading.auth = false;
      }
    });
  }

  showLoginModal(): void {
    this.modals.login = true;
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loading.auth = true;
      const { username, password } = this.loginForm.value;
      
      this.adminService.login(username, password).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            this.isLoggedIn = true;
            this.currentUser = response.user || {
              username: username,
              role: 'ADMIN',
              authenticated: true
            };
            this.modals.login = false;
            this.showAlert('Connexion réussie', 'success');
            this.loadInitialData();
          } else {
            this.showAlert(response.message || 'Identifiants invalides', 'error');
          }
          this.loading.auth = false;
        },
        error: (error) => {
          console.error('Erreur connexion:', error);
          this.showAlert('Erreur lors de la connexion', 'error');
          this.loading.auth = false;
        }
      });
    } else {
      this.showAlert('Veuillez remplir tous les champs', 'warning');
    }
  }

  logout(): void {
    this.adminService.logout().subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success) {
          this.isLoggedIn = false;
          this.currentUser = null;
          this.showAlert('Déconnexion réussie', 'success');
          this.showLoginModal();
        }
      },
      error: (error) => {
        console.error('Erreur déconnexion:', error);
        this.isLoggedIn = false;
        this.currentUser = null;
        this.showLoginModal();
      }
    });
  }

  // ==================== INITIALISATION ====================

  setupEventListeners(): void {
    // Écouter les changements de recherche pour les produits coupons
    this.couponProductsForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterCouponProducts(term);
    });

    // Écouter les changements de sélection
    this.couponProductsForm.get('selectAll')?.valueChanges.subscribe(checked => {
      if (checked) {
        this.selectAllCouponProducts();
      } else {
        this.deselectAllCouponProducts();
      }
    });
  }

 
  // ==================== CHARGEMENT DES DONNÉES ====================

  loadDashboard() {
    if (!this.isLoggedIn) return;
    
    console.log('📊 Chargement dashboard...');
    this.loading.dashboard = true;
    this.adminService.getDashboard().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<DashboardStats>) => {
        console.log('📊 Dashboard response:', response);
        if (response.success && response.dashboard) {
          this.dashboardStats = { ...this.dashboardStats, ...response.dashboard };
          console.log('✅ Dashboard chargé:', this.dashboardStats);
          this.initCharts();
        } else {
          console.error('❌ Erreur dashboard:', response.message);
          this.showAlert('Erreur lors du chargement du dashboard', 'error');
        }
        this.loading.dashboard = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur API dashboard:', error);
        this.showAlert('Erreur lors du chargement du dashboard', 'error');
        this.loading.dashboard = false;
      }
    });
  }

  loadMessages() {
    if (!this.isLoggedIn) return;
    
    console.log('📧 Chargement messages...');
    this.loading.messages = true;
    this.adminService.getAllMessages().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Message[]>) => {
        console.log('📧 Messages response:', response);
        if (response.success && response.messages) {
          this.messages = response.messages;
          console.log(`✅ ${this.messages.length} messages chargés`);
        } else {
          console.error('❌ Erreur messages:', response.message);
          this.showAlert('Erreur lors du chargement des messages', 'error');
        }
        this.loading.messages = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur API messages:', error);
        this.showAlert('Erreur lors du chargement des messages', 'error');
        this.loading.messages = false;
      }
    });
  }

 

  loadCustomers() {
    if (!this.isLoggedIn) return;
    
    console.log('👥 Chargement clients...');
    this.loading.customers = true;
    this.adminService.getAllCustomers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Customer[]>) => {
        console.log('👥 Customers response:', response);
        if (response.success && response.customers) {
          this.customers = response.customers;
          console.log(`✅ ${this.customers.length} clients chargés`);
        } else {
          console.error('❌ Erreur clients:', response.message);
          this.showAlert('Erreur lors du chargement des clients', 'error');
        }
        this.loading.customers = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur API clients:', error);
        this.showAlert('Erreur lors du chargement des clients', 'error');
        this.loading.customers = false;
      }
    });
  }

  loadCategories() {
    if (!this.isLoggedIn) return;
    
    console.log('📂 Chargement catégories...');
    this.loading.categories = true;
    this.adminService.getAllCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Category[]>) => {
        console.log('📂 Categories response:', response);
        if (response.success && response.categories) {
          this.categories = response.categories;
          console.log(`✅ ${this.categories.length} catégories chargées`);
        } else {
          console.error('❌ Erreur catégories:', response.message);
          this.showAlert('Erreur lors du chargement des catégories', 'error');
        }
        this.loading.categories = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur API catégories:', error);
        this.showAlert('Erreur lors du chargement des catégories', 'error');
        this.loading.categories = false;
      }
    });
  }

 
  // ==================== GESTION DE STOCK ====================

  loadStockMovements(): void {
    console.log('📊 Chargement des mouvements de stock...');
    this.loading.stockMovements = true;
    
    this.adminService.getStockMovements()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<StockMovement[]>) => {
          if (response.success && response.data) {
            this.stockMovements = response.data;
            console.log(`✅ ${this.stockMovements.length} mouvements de stock chargés`);
          }
          this.loading.stockMovements = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement mouvements stock:', error);
          this.loading.stockMovements = false;
        }
      });
  }

  loadStockAlerts(): void {
    console.log('🚨 Chargement des alertes de stock...');
    this.loading.stockAlerts = true;
    
    this.adminService.getStockAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<StockAlert[]>) => {
          if (response.success && response.data) {
            this.stockAlerts = response.data;
            console.log(`✅ ${this.stockAlerts.length} alertes de stock chargées`);
          }
          this.loading.stockAlerts = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement alertes stock:', error);
          this.loading.stockAlerts = false;
        }
      });
  }

  loadInventoryReport(): void {
    console.log('📈 Chargement rapport d\'inventaire...');
    this.loading.inventoryReport = true;
    
    this.adminService.getInventoryReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<InventoryReport>) => {
          if (response.success && response.data) {
            this.inventoryReport = response.data;
            console.log('✅ Rapport d\'inventaire chargé');
          }
          this.loading.inventoryReport = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement rapport inventaire:', error);
          this.loading.inventoryReport = false;
        }
      });
  }

  openStockAdjustmentModal(product?: Product): void {
    console.log('📝 Ouverture modal ajustement stock:', product);
    
    if (product) {
      this.stockAdjustmentForm.patchValue({
        productId: product.id
      });
    } else {
      this.stockAdjustmentForm.reset({
        adjustmentType: 'ADJUSTMENT',
        quantity: 0,
        reason: ''
      });
    }
    
    this.modals.stockAdjustment = true;
  }

  applyStockAdjustment(): void {
    if (this.stockAdjustmentForm.valid) {
      const formData = this.stockAdjustmentForm.value;
      console.log('📝 Application ajustement stock:', formData);
      
      this.loading.action = true;
      
      let observable: Observable<ApiResponse<Product>>;
      
      switch (formData.adjustmentType) {
        case 'INCREMENT':
          observable = this.adminService.incrementStock(
            formData.productId,
            formData.quantity,
            formData.reason,
            formData.notes
          );
          break;
        case 'DECREMENT':
          observable = this.adminService.decrementStock(
            formData.productId,
            formData.quantity,
            formData.reason,
            formData.notes
          );
          break;
        case 'ADJUSTMENT':
        default:
          observable = this.adminService.adjustStock(
            formData.productId,
            formData.quantity,
            formData.reason,
            formData.notes
          );
          break;
      }
      
      observable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: ApiResponse<Product>) => {
          if (response.success) {
            this.showAlert('Stock ajusté avec succès', 'success');
            this.modals.stockAdjustment = false;
            
            // Mettre à jour le produit dans la liste
            const index = this.products.findIndex(p => p.id === formData.productId);
            if (index !== -1 && response.data) {
              this.products[index] = response.data;
            }
            
            // Recharger les mouvements de stock
            this.loadStockMovements();
            this.loadStockAlerts();
          } else {
            this.showAlert('Erreur lors de l\'ajustement du stock', 'error');
          }
          this.loading.action = false;
        },
        error: (error) => {
          console.error('❌ Erreur ajustement stock:', error);
          this.loading.action = false;
        }
      });
    }
  }

  openStockThresholdModal(product?: Product): void {
    if (product) {
      console.log('⚡ Ouverture modal seuil de stock:', product);
      
      this.stockThresholdForm.patchValue({
        productId: product.id,
        threshold: 10
      });
      
      this.modals.stockThreshold = true;
    } else {
      this.showAlert('Produit non trouvé', 'error');
    }
  }

  setStockThreshold(): void {
    if (this.stockThresholdForm.valid) {
      const formData = this.stockThresholdForm.value;
      console.log('⚡ Définition seuil de stock:', formData);
      
      this.loading.action = true;
      
      this.adminService.setStockThreshold(formData.productId, formData.threshold)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResponse<Product>) => {
            if (response.success) {
              this.showAlert('Seuil de stock défini avec succès', 'success');
              this.modals.stockThreshold = false;
              
              // Recharger les alertes
              this.loadStockAlerts();
            } else {
              this.showAlert('Erreur lors de la définition du seuil', 'error');
            }
            this.loading.action = false;
          },
          error: (error) => {
            console.error('❌ Erreur définition seuil stock:', error);
            this.loading.action = false;
          }
        });
    }
  }

  openBulkStockUpdateModal(): void {
    console.log('📦 Ouverture modal mise à jour groupée stock');
    
    // Initialiser avec les produits en faible stock
    const lowStockProducts = this.getLowStockProducts();
    const updatesArray = this.bulkUpdatesArray;
    updatesArray.clear();
    
    lowStockProducts.forEach(product => {
      updatesArray.push(this.fb.group({
        productId: [product.id],
        productName: [product.name],
        currentStock: [product.stockQuantity],
        newStock: [product.stockQuantity + 10],
        quantity: [10],
        selected: [true]
      }));
    });
    
    this.modals.bulkStockUpdate = true;
  }

  applyBulkStockUpdate(): void {
    if (this.bulkStockForm.valid) {
      const formData = this.bulkStockForm.value;
      console.log('📦 Application mise à jour groupée stock:', formData);
      
      const updates = formData.updates
        .filter((update: any) => update.selected)
        .map((update: any) => ({
          productId: update.productId,
          quantity: update.quantity,
          reason: `Mise à jour groupée: ${formData.reason}`
      }));
      
      this.loading.action = true;
      
      this.adminService.bulkStockUpdate(updates)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResponse<any>) => {
            if (response.success) {
              this.showAlert('Mise à jour groupée effectuée avec succès', 'success');
              this.modals.bulkStockUpdate = false;
              
              // Recharger les produits et les mouvements
              this.loadProducts();
              this.loadStockMovements();
              this.loadStockAlerts();
            } else {
              this.showAlert('Erreur lors de la mise à jour groupée', 'error');
            }
            this.loading.action = false;
          },
          error: (error) => {
            console.error('❌ Erreur mise à jour groupée stock:', error);
            this.loading.action = false;
          }
        });
    }
  }

  viewStockMovementDetail(movement: StockMovement): void {
    this.selectedStockMovement = movement;
    this.modals.stockMovementDetail = true;
  }

  viewInventoryReport(): void {
    this.loadInventoryReport();
    this.modals.inventoryReportModal = true;
  }

  getStockMovementTypeText(type: string): string {
    const types: any = {
      'INCREMENT': 'Entrée',
      'DECREMENT': 'Sortie',
      'ADJUSTMENT': 'Ajustement',
      'INITIAL': 'Stock initial',
      'CORRECTION': 'Correction'
    };
    return types[type] || type;
  }

  getStockAlertStatusText(status: string): string {
    const statuses: any = {
      'LOW': 'Stock faible',
      'CRITICAL': 'Stock critique',
      'OUT_OF_STOCK': 'Rupture',
      'OK': 'Normal'
    };
    return statuses[status] || status;
  }

  getStockAlertStatusClass(status: string): string {
    const classes: any = {
      'LOW': 'alert-warning',
      'CRITICAL': 'alert-danger',
      'OUT_OF_STOCK': 'alert-dark',
      'OK': 'alert-success'
    };
    return classes[status] || 'alert-secondary';
  }

  // ==================== MÉTHODES MANQUANTES POUR LE TEMPLATE ====================

  // Stock History Viewing
  viewProductStockHistory(product: Product): void {
    console.log('📊 Affichage historique stock pour:', product.name);
    this.setActiveSection('stock');
    this.loadStockMovements();
    this.showAlert(`Affichage de l'historique du stock pour ${product.name}`, 'info');
  }

  // Product Selection for Stock Adjustment
  onProductSelectedForAdjustment(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const productId = Number(selectElement.value);
    
    if (productId) {
      const product = this.getProductById(productId);
      if (product) {
        this.stockAdjustmentForm.patchValue({
          productId: product.id
        });
      }
    }
  }

  // Bulk Update Management - Getters
  get bulkUpdatesArray(): FormArray {
    return this.bulkStockForm.get('updates') as FormArray;
  }

  toggleBulkUpdate(index: number): void {
    const update = this.bulkUpdatesArray.at(index);
    const isSelected = update.get('selected')?.value;
    update.patchValue({ selected: !isSelected });
  }

  updateBulkQuantity(index: number): void {
    const update = this.bulkUpdatesArray.at(index);
    const currentStock = update.get('currentStock')?.value || 0;
    const quantity = update.get('quantity')?.value || 0;
    const newStock = currentStock + quantity;
    update.patchValue({ newStock: newStock });
  }

  getBulkQuantityClass(quantity: number): string {
    if (quantity > 0) return 'text-success';
    if (quantity < 0) return 'text-danger';
    return 'text-secondary';
  }

  selectAllBulkUpdates(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.bulkUpdatesArray.controls.forEach(control => {
      control.patchValue({ selected: isChecked });
    });
  }

  applyBulkPreset(preset: string): void {
    const updatesArray = this.bulkUpdatesArray;
    
    updatesArray.controls.forEach(control => {
      const currentStock = control.get('currentStock')?.value || 0;
      let quantity = 0;
      
      switch (preset) {
        case 'low_stock':
          quantity = Math.max(0, 20 - currentStock);
          break;
        case 'out_of_stock':
          quantity = Math.max(0, 50 - currentStock);
          break;
        case 'reset':
          quantity = 0;
          break;
      }
      
      control.patchValue({
        quantity: quantity,
        newStock: currentStock + quantity
      });
    });
  }

  getSelectedBulkUpdatesCount(): number {
    return this.bulkUpdatesArray.controls.filter(control => 
      control.get('selected')?.value
    ).length;
  }

  getTotalBulkQuantity(): number {
    return this.bulkUpdatesArray.controls
      .filter(control => control.get('selected')?.value)
      .reduce((total, control) => total + (control.get('quantity')?.value || 0), 0);
  }

  getBulkImpactEstimate(): string {
    const selectedCount = this.getSelectedBulkUpdatesCount();
    const totalQuantity = this.getTotalBulkQuantity();
    
    if (selectedCount === 0) return 'Aucun impact';
    
    const averagePrice = 25; // Prix moyen estimé
    const totalValue = totalQuantity * averagePrice;
    
    return `≈ ${this.formatCurrency(totalValue)}`;
  }

  // Turnover Rate Methods
  getTurnoverRateClass(salesCount: number, stockQuantity: number): string {
    if (stockQuantity === 0) return 'text-danger';
    
    const turnoverRate = salesCount / Math.max(stockQuantity, 1);
    
    if (turnoverRate > 2) return 'text-success'; // Rotation élevée
    if (turnoverRate > 1) return 'text-warning'; // Rotation moyenne
    return 'text-danger'; // Rotation faible
  }

  calculateTurnoverRate(salesCount: number, stockQuantity: number): string {
    if (stockQuantity === 0) return '0.0';
    
    const rate = (salesCount / Math.max(stockQuantity, 1)).toFixed(1);
    return rate;
  }

  // Stock Age Method
  getStockAge(createdAt: string): number {
    if (!createdAt) return 0;
    
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Stock Recommendation Method
  getStockRecommendation(product: Product): string {
    if (!product.salesCount) return 'Données insuffisantes';
    
    const salesCount = product.salesCount || 0;
    const stockQuantity = product.stockQuantity;
    const stockAge = this.getStockAge(product.createdAt || '');
    
    if (stockQuantity === 0) return 'Réapprovisionner urgemment';
    
    const turnoverRate = salesCount / Math.max(stockQuantity, 1);
    
    if (turnoverRate > 2 && stockQuantity < 20) {
      return 'Augmenter le stock (vente rapide)';
    } else if (turnoverRate < 0.5 && stockAge > 90) {
      return 'Réduire le stock (vente lente)';
    } else if (turnoverRate > 1) {
      return 'Maintenir le stock actuel';
    } else {
      return 'Surveiller les ventes';
    }
  }

  // Print Report Method
  printReport(): void {
    console.log('🖨️ Impression du rapport...');
    
    const printContent = document.getElementById('stock-report-content');
    
    if (!printContent) {
      this.showAlert('Contenu du rapport non trouvé', 'error');
      return;
    }
    
    const originalContents = document.body.innerHTML;
    const reportContents = printContent.innerHTML;
    
    document.body.innerHTML = `
      <html>
        <head>
          <title>Rapport d'Inventaire - ${new Date().toLocaleDateString('fr-FR')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .text-success { color: #10b981; }
            .text-warning { color: #f59e0b; }
            .text-danger { color: #ef4444; }
            .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${reportContents}
          <div class="no-print" style="margin-top: 20px;">
            <button onclick="window.close()" style="padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Fermer
            </button>
          </div>
        </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
    
    this.showAlert('Rapport prêt pour impression', 'success');
  }

  // Méthodes utilitaires pour la gestion de stock
  getMovementRowClass(type: string): string {
    const classes: any = {
      'INCREMENT': 'stock-increment',
      'DECREMENT': 'stock-decrement',
      'ADJUSTMENT': 'stock-adjustment',
      'INITIAL': 'stock-initial',
      'CORRECTION': 'stock-correction'
    };
    return classes[type] || '';
  }

  getMovementTypeBadge(type: string): string {
    const badges: any = {
      'INCREMENT': 'badge-success',
      'DECREMENT': 'badge-danger',
      'ADJUSTMENT': 'badge-warning',
      'INITIAL': 'badge-info',
      'CORRECTION': 'badge-secondary'
    };
    return badges[type] || 'badge-secondary';
  }

  getQuantityClass(type: string): string {
    const classes: any = {
      'INCREMENT': 'text-success',
      'DECREMENT': 'text-danger',
      'ADJUSTMENT': 'text-warning'
    };
    return classes[type] || 'text-secondary';
  }

  getCriticalAlertsCount(): number {
    return this.stockAlerts.filter(alert => alert.status === 'CRITICAL').length;
  }

  getLowAlertsCount(): number {
    return this.stockAlerts.filter(alert => alert.status === 'LOW').length;
  }

  getOutOfStockProducts(): Product[] {
    return this.products.filter(p => p.stockQuantity === 0);
  }

  getLowStockProducts(): Product[] {
    return this.products.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0);
  }

  getSufficientStockProducts(): Product[] {
    return this.products.filter(p => p.stockQuantity >= 10);
  }

  getProductsForStockManagement(): Product[] {
    return this.products.filter(p => p.isActive);
  }

  getStockLevelClass(stock: number): string {
    if (stock === 0) return 'text-danger';
    if (stock < 10) return 'text-warning';
    if (stock < 20) return 'text-info';
    return 'text-success';
  }

  getStockStatusBadge(stock: number): string {
    if (stock === 0) return 'badge-danger';
    if (stock < 10) return 'badge-warning';
    if (stock < 20) return 'badge-info';
    return 'badge-success';
  }

  markAlertAsNotified(alert: StockAlert): void {
    alert.notified = true;
    this.showAlert('Alerte marquée comme notifiée', 'success');
  }

  getSelectedProductForAdjustment(): Product | undefined {
    const productId = this.stockAdjustmentForm.get('productId')?.value;
    return this.getProductById(productId);
  }

  calculateEstimatedStock(): number {
    const product = this.getSelectedProductForAdjustment();
    const quantity = this.stockAdjustmentForm.get('quantity')?.value || 0;
    const type = this.stockAdjustmentForm.get('adjustmentType')?.value;
    
    if (!product) return 0;
    
    switch (type) {
      case 'INCREMENT':
        return product.stockQuantity + quantity;
      case 'DECREMENT':
        return Math.max(0, product.stockQuantity - quantity);
      case 'ADJUSTMENT':
      default:
        return quantity;
    }
  }

  getEstimatedStockClass(): string {
    const estimatedStock = this.calculateEstimatedStock();
    return this.getStockLevelClass(estimatedStock);
  }

  getSelectedProductForThreshold(): Product | undefined {
    const productId = this.stockThresholdForm.get('productId')?.value;
    return this.getProductById(productId);
  }

  getThresholdStatusClass(): string {
    const product = this.getSelectedProductForThreshold();
    const threshold = this.stockThresholdForm.get('threshold')?.value || 10;
    
    if (!product) return 'text-secondary';
    
    if (product.stockQuantity === 0) return 'text-danger';
    if (product.stockQuantity < threshold) return 'text-warning';
    return 'text-success';
  }

  getThresholdStatusText(): string {
    const product = this.getSelectedProductForThreshold();
    const threshold = this.stockThresholdForm.get('threshold')?.value || 10;
    
    if (!product) return 'Non défini';
    
    if (product.stockQuantity === 0) return 'Rupture de stock';
    if (product.stockQuantity < threshold) return 'En dessous du seuil';
    return 'Au-dessus du seuil';
  }

  // ==================== MÉTHODES POUR L'HUILE D'OLIVE ====================

  isHuileOliveProduct(product: any): boolean {
    if (!product) return false;
    
    const category = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    const isHuileOlive = 
      category.includes('olive') || 
      name.includes('olive') ||
      description.includes('olive') ||
      category.includes('huile d\'olive') ||
      name.includes('huile d\'olive') ||
      category.includes('huile olive') ||
      name.includes('huile olive') ||
      category.includes('olive oil') ||
      name.includes('olive oil') ||
      category.includes('extra virgin') ||
      name.includes('extra virgin') ||
      category.includes('extra-vierge') ||
      name.includes('extra-vierge') ||
      category.includes('vierge') ||
      name.includes('vierge');
      
    const isActive = product.isActive === undefined ? true : product.isActive;
    
    return isHuileOlive && isActive;
  }

  syncAllToHuileOlivePage(): void {
    console.log('🔄 Synchronisation manuelle vers la page HUILE D\'OLIVE...');
    this.loading.action = true;

    this.adminService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        if (response.success && response.products) {
          const huileOliveProducts = response.products.filter(product => 
            this.isHuileOliveProduct(product)
          );
          
          localStorage.setItem('huileOliveProducts', JSON.stringify(huileOliveProducts));
          window.dispatchEvent(new Event('huileOliveProductsUpdated'));
          
          this.showAlert(`${huileOliveProducts.length} produits huile d'olive synchronisés`, 'success');
        } else {
          this.showAlert('Erreur lors de la synchronisation huile d\'olive', 'error');
        }
        this.loading.action = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur synchronisation huile d\'olive:', error);
        this.showAlert('Erreur lors de la synchronisation huile d\'olive', 'error');
        this.loading.action = false;
      }
    });
  }

  getHuileOliveProductsCount(): number {
    return this.products.filter(product => this.isHuileOliveProduct(product)).length;
  }

  autoSyncHuileOlive(): void {
    console.log('🔄 Synchronisation automatique huile d\'olive...');
    
    const huileOliveProducts = this.products.filter(product => 
      this.isHuileOliveProduct(product)
    );

    if (huileOliveProducts.length > 0) {
      localStorage.setItem('huileOliveProducts', JSON.stringify(huileOliveProducts));
      window.dispatchEvent(new Event('huileOliveProductsUpdated'));
      console.log(`✅ ${huileOliveProducts.length} produits huile d'olive synchronisés automatiquement`);
    }
  }

  syncSingleProductToHuileOlive(product: any): void {
    console.log('🔄 Synchronisation produit huile d\'olive:', product.name);
    
    let huileOliveProducts: Product[] = [];
    try {
      const storedProducts = localStorage.getItem('huileOliveProducts');
      if (storedProducts) {
        huileOliveProducts = JSON.parse(storedProducts);
      }
    } catch (error) {
      console.error('❌ Erreur chargement produits huile d\'olive:', error);
    }
    
    const existingIndex = huileOliveProducts.findIndex(p => p.id === product.id);
    
    if (existingIndex !== -1) {
      huileOliveProducts[existingIndex] = { ...huileOliveProducts[existingIndex], ...product };
      console.log('✅ Produit huile d\'olive mis à jour dans le stockage local');
    } else {
      huileOliveProducts.push(product);
      console.log('✅ Nouveau produit huile d\'olive ajouté au stockage local');
    }
    
    localStorage.setItem('huileOliveProducts', JSON.stringify(huileOliveProducts));
    window.dispatchEvent(new Event('huileOliveProductsUpdated'));
    
    const message = existingIndex !== -1 ? 
      'Produit huile d\'olive mis à jour avec succès' : 
      'Nouveau produit huile d\'olive ajouté avec succès';
    
    this.showAlert(message, 'success');
  }

  // ==================== GESTION DES COUPONS AVEC PRODUITS ====================

  getProductCoupons(product: Product): Coupon[] {
    if (!product.couponIds || product.couponIds.length === 0) {
      return [];
    }
    
    return this.coupons.filter(coupon => 
      product.couponIds!.includes(coupon.id) && 
      coupon.isActive && 
      !this.isCouponExpired(coupon)
    );
  }

  getBestProductCoupon(product: Product): Coupon | null {
    const coupons = this.getProductCoupons(product);
    if (coupons.length === 0) return null;
    
    return coupons.reduce((best, current) => {
      const currentDiscount = this.calculateDiscountAmount(product.price, current);
      const bestDiscount = best ? this.calculateDiscountAmount(product.price, best) : 0;
      return currentDiscount > bestDiscount ? current : best;
    }, null as Coupon | null);
  }

  calculateDiscountedPrice(originalPrice: number, coupon: Coupon): number {
    let discountedPrice = originalPrice;
    
    switch (coupon.discountType) {
      case 'PERCENTAGE':
        discountedPrice = originalPrice * (1 - coupon.discountValue / 100);
        break;
      case 'FIXED':
        discountedPrice = Math.max(0, originalPrice - coupon.discountValue);
        break;
    }
    
    return Math.round(discountedPrice * 100) / 100;
  }

  calculateDiscountAmount(originalPrice: number, coupon: Coupon): number {
    return originalPrice - this.calculateDiscountedPrice(originalPrice, coupon);
  }

  // ==================== SYNCHRONISATION AUTOMATIQUE DES COUPONS ====================

  setupAutoCouponSync(): void {
    this.couponForm.valueChanges.subscribe(() => {
      if (this.couponForm.valid) {
        this.previewCouponSync();
      }
    });
    
    setInterval(() => {
      if (this.coupons.length > 0) {
        this.syncCouponsToPages();
      }
    }, 300000);
  }

  previewCouponSync(): void {
    this.updateProductCouponAssociations();
  }

  // ==================== AUTRES MÉTHODES POUR LES COUPONS ====================

  openCouponProductsModal(coupon?: Coupon): void {
    console.log('🎫 Ouverture modal produits coupon:', coupon);
    
    if (coupon) {
      this.selectedCoupon = coupon;
      this.loadProductsForCoupon();
    } else {
      this.selectedCoupon = null;
      this.availableProductsForCoupons = [...this.products];
      this.filteredProductsForCoupons = [...this.products];
    }
    
    this.selectedCouponProducts = [];
    this.couponProductsForm.patchValue({
      searchTerm: '',
      selectedProducts: [],
      selectAll: false
    });
    
    this.modals.couponProducts = true;
  }

  loadProductsForCoupon(): void {
    if (!this.selectedCoupon) return;
    
    this.loading.couponProducts = true;
    this.availableProductsForCoupons = [...this.products];
    this.filteredProductsForCoupons = [...this.availableProductsForCoupons];
    this.loading.couponProducts = false;
  }

  filterCouponProducts(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredProductsForCoupons = [...this.availableProductsForCoupons];
      return;
    }
    
    const term = searchTerm.toLowerCase();
    this.filteredProductsForCoupons = this.availableProductsForCoupons.filter(product =>
      product.name.toLowerCase().includes(term) ||
      (product.category && product.category.toLowerCase().includes(term)) ||
      (product.description && product.description.toLowerCase().includes(term))
    );
  }

  toggleCouponProductSelection(productId: number): void {
    const index = this.selectedCouponProducts.indexOf(productId);
    if (index === -1) {
      this.selectedCouponProducts.push(productId);
    } else {
      this.selectedCouponProducts.splice(index, 1);
    }
    
    this.couponProductsForm.patchValue({
      selectedProducts: this.selectedCouponProducts,
      selectAll: this.selectedCouponProducts.length === this.filteredProductsForCoupons.length
    });
  }

  selectAllCouponProducts(): void {
    this.selectedCouponProducts = this.filteredProductsForCoupons.map(p => p.id);
    this.couponProductsForm.patchValue({
      selectedProducts: this.selectedCouponProducts
    });
  }

  deselectAllCouponProducts(): void {
    this.selectedCouponProducts = [];
    this.couponProductsForm.patchValue({
      selectedProducts: []
    });
  }

  isCouponProductSelected(productId: number): boolean {
    return this.selectedCouponProducts.includes(productId);
  }

  applyCouponToSelectedProducts(): void {
    if (!this.selectedCoupon || this.selectedCouponProducts.length === 0) {
      this.showAlert('Veuillez sélectionner un coupon et des produits', 'warning');
      return;
    }
    
    console.log(`🎫 Application coupon ${this.selectedCoupon.code} à ${this.selectedCouponProducts.length} produits`);
    this.showAlert('Fonctionnalité gérée côté frontend (localStorage)', 'info');
    this.modals.couponProducts = false;
  }

  removeCouponFromSelectedProducts(): void {
    if (!this.selectedCoupon || this.selectedCouponProducts.length === 0) {
      this.showAlert('Veuillez sélectionner un coupon et des produits', 'warning');
      return;
    }
    
    console.log(`🎫 Retrait coupon ${this.selectedCoupon.code} de ${this.selectedCouponProducts.length} produits`);
    this.showAlert('Fonctionnalité gérée côté frontend (localStorage)', 'info');
    this.modals.couponProducts = false;
  }

  // ==================== MISE À JOUR DE L'AFFICHAGE DES PRODUITS ====================

  updateProductDiscountDisplay(): void {
    this.products.forEach(product => {
      const bestCoupon = this.getBestProductCoupon(product);
      if (bestCoupon) {
        product.hasDiscount = true;
        product.discountedPrice = this.calculateDiscountedPrice(product.price, bestCoupon);
        product.discountPercentage = Math.round((1 - (product.discountedPrice! / product.price)) * 100);
        product.originalPrice = product.price;
      } else {
        product.hasDiscount = false;
        product.discountedPrice = undefined;
        product.discountPercentage = undefined;
        product.originalPrice = undefined;
      }
    });
    
    this.syncProductsWithCouponsToPages();
  }

  isCouponExpired(coupon: Coupon): boolean {
    if (!coupon.expiryDate) return false;
    
    const now = new Date();
    const expiryDate = new Date(coupon.expiryDate);
    
    return expiryDate < now;
  }

  // ==================== EXPORT EXCEL ====================

  exportToExcel(dataType: string): void {
    console.log(`📊 Export Excel: ${dataType}`);
    
    let data: any[] = [];
    let filename = '';
    
    switch (dataType) {
      case 'products':
        data = this.prepareProductsForExport();
        filename = `Produits_${this.formatDateForFilename()}.xlsx`;
        break;
      case 'orders':
        data = this.prepareOrdersForExport();
        filename = `Commandes_${this.formatDateForFilename()}.xlsx`;
        break;
      case 'customers':
        data = this.prepareCustomersForExport();
        filename = `Clients_${this.formatDateForFilename()}.xlsx`;
        break;
      case 'stock':
        data = this.prepareStockForExport();
        filename = `Stock_${this.formatDateForFilename()}.xlsx`;
        break;
      case 'sales':
        data = this.prepareSalesForExport();
        filename = `Ventes_${this.formatDateForFilename()}.xlsx`;
        break;
      default:
        this.showAlert('Type d\'export non supporté', 'warning');
        return;
    }
    
    if (data.length === 0) {
      this.showAlert('Aucune donnée à exporter', 'warning');
      return;
    }
    
    this.generateExcelFile(data, filename);
  }

  private prepareProductsForExport(): any[] {
    return this.products.map(product => ({
      'ID': product.id,
      'Référence': product.reference || '',
      'Nom': product.name,
      'Description': product.description,
      'Catégorie': product.category,
      'Marque': product.brand || '',
      'Prix (€)': product.price,
      'Prix de vente (€)': product.hasDiscount && product.discountedPrice ? product.discountedPrice : product.price,
      'Prix original (€)': product.hasDiscount ? product.originalPrice || product.price : product.price,
      'Réduction (%)': product.discountPercentage || 0,
      'En réduction': product.hasDiscount ? 'Oui' : 'Non',
      'Stock actuel': product.stockQuantity,
      'Statut stock': this.getStockStatusText(product.stockQuantity),
      'Statut': product.isActive ? 'Actif' : 'Inactif',
      'Type de peau': product.skinType || '',
      'Composition': product.composition || '',
      'Offre spéciale': product.specialOffer || '',
      'Poids (g)': product.weight || 0,
      'Image URL': product.imageUrl || '',
      'Coupons associés': product.couponIds ? product.couponIds.join(', ') : '',
      'Date création': this.formatDate(product.createdAt || ''),
      'Date modification': this.formatDate(product.updatedAt || '')
    }));
  }

  private prepareOrdersForExport(): any[] {
    return this.orders.map(order => ({
      'Numéro commande': order.orderNumber,
      'ID commande': order.id,
      'Date commande': this.formatDateTime(order.orderDate),
      'Nom client': order.customerName,
      'Email client': order.customerEmail,
      'Téléphone client': order.customerPhone || '',
      'Adresse livraison': order.deliveryAddress || '',
      'Statut': this.getStatusText(order.status),
      'Statut paiement': order.paymentStatus || '',
      'Méthode paiement': order.paymentMethod || '',
      'Méthode livraison': order.shippingMethod || '',
      'Numéro suivi': order.trackingNumber || '',
      'Sous-total (€)': order.subtotal,
      'Frais livraison (€)': order.shippingCost,
      'Taxes (€)': order.taxAmount || 0,
      'Réduction (€)': order.discountAmount || 0,
      'Total (€)': order.totalAmount,
      'Nombre articles': order.orderItems ? order.orderItems.length : 0,
      'Articles détaillés': order.orderItems ? 
        order.orderItems.map(item => 
          `${item.productName} (x${item.quantity}) = ${item.total}€`
        ).join('; ') : '',
      'Notes': order.notes || '',
      'Date création': this.formatDate(order.createdAt || ''),
      'Date modification': this.formatDate(order.updatedAt || '')
    }));
  }

  private prepareCustomersForExport(): any[] {
    return this.customers.map(customer => {
      const customerOrders = this.orders.filter(o => o.customerEmail === customer.email);
      const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      return {
        'ID client': customer.id,
        'Nom': customer.firstName,
        'Prénom': customer.lastName,
        'Nom complet': `${customer.firstName} ${customer.lastName}`,
        'Email': customer.email,
        'Téléphone': customer.phoneNumber || '',
        'Adresse': customer.address || '',
        'Ville': customer.city || '',
        'Région': customer.governorate || '',
        'Nombre commandes': customer.ordersCount || 0,
        'Total dépensé (€)': totalSpent,
        'Première commande': this.formatDate(customer.firstOrderDate || ''),
        'Dernière commande': this.formatDate(customer.lastOrderDate || ''),
        'Date inscription': this.formatDate(customer.registrationDate || ''),
        'Statut': customer.isActive ? 'Actif' : 'Inactif',
        'Segment': this.getCustomerSegment(customer),
        'Notes': customer.notes || '',
        'Date création': this.formatDate(customer.createdAt || ''),
        'Date modification': this.formatDate(customer.updatedAt || '')
      };
    });
  }

  private prepareStockForExport(): any[] {
    const data: any[] = [];
    
    // Produits avec stock
    this.products.forEach(product => {
      data.push({
        'Type': 'Produit',
        'ID': product.id,
        'Référence': product.reference || '',
        'Nom': product.name,
        'Catégorie': product.category,
        'Stock actuel': product.stockQuantity,
        'Stock minimum recommandé': 10,
        'Statut stock': this.getStockStatusText(product.stockQuantity),
        'Prix (€)': product.price,
        'Valeur stock (€)': product.price * product.stockQuantity,
        'Statut': product.isActive ? 'Actif' : 'Inactif',
        'Dernière modification': this.formatDate(product.updatedAt || '')
      });
    });
    
    // Mouvements de stock récents
    const recentMovements = this.stockMovements.slice(0, 100);
    recentMovements.forEach(movement => {
      data.push({
        'Type': 'Mouvement',
        'ID mouvement': movement.id,
        'Date mouvement': this.formatDateTime(movement.performedAt),
        'ID produit': movement.productId,
        'Produit': movement.productName,
        'Type mouvement': this.getStockMovementTypeText(movement.type),
        'Quantité': movement.quantity,
        'Stock précédent': movement.previousStock,
        'Nouveau stock': movement.newStock,
        'Raison': movement.reason,
        'Référence': movement.reference || '',
        'Effectué par': movement.performedBy,
        'Notes': movement.notes || ''
      });
    });
    
    // Alertes de stock
    this.stockAlerts.forEach(alert => {
      data.push({
        'Type': 'Alerte',
        'ID alerte': alert.id,
        'ID produit': alert.productId,
        'Produit': alert.productName,
        'Stock actuel': alert.currentStock,
        'Seuil': alert.threshold,
        'Statut': this.getStockAlertStatusText(alert.status),
        'Dernière alerte': this.formatDate(alert.lastAlertDate || ''),
        'Nombre alertes': alert.alertCount,
        'Notifié': alert.notified ? 'Oui' : 'Non'
      });
    });
    
    return data;
  }

  private prepareSalesForExport(): any[] {
    const data = [];
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    // Statistiques générales
    data.push({
      'Type': 'Statistiques générales',
      'Total revenus (€)': this.dashboardStats.totalRevenue,
      'Revenu ce mois (€)': this.dashboardStats.revenueThisMonth,
      'Revenu aujourd\'hui (€)': this.dashboardStats.revenueToday || 0,
      'Total commandes': this.dashboardStats.totalOrders,
      'Commandes ce mois': this.dashboardStats.ordersThisMonth || 0,
      'Commandes aujourd\'hui': this.dashboardStats.ordersToday || 0,
      'Panier moyen (€)': this.dashboardStats.averageOrderValue,
      'Taux conversion (%)': this.dashboardStats.conversionRate || 0,
      'Clients total': this.dashboardStats.totalCustomers,
      'Nouveaux clients ce mois': this.dashboardStats.newCustomersThisMonth,
      'Taux fidélisation (%)': this.dashboardStats.repeatCustomerRate || 0
    });
    
    // Commandes récentes
    const recentOrders = this.orders
      .filter(order => new Date(order.orderDate) >= lastMonth)
      .slice(0, 50);
    
    recentOrders.forEach(order => {
      data.push({
        'Type': 'Commande récente',
        'Numéro': order.orderNumber,
        'Date': this.formatDateTime(order.orderDate),
        'Client': order.customerName,
        'Email': order.customerEmail,
        'Statut': this.getStatusText(order.status),
        'Total (€)': order.totalAmount,
        'Articles': order.orderItems ? order.orderItems.length : 0
      });
    });
    
    // Produits les plus vendus
    const bestSelling = this.dashboardStats.bestSellingProducts || [];
    bestSelling.forEach((product: any, index: number) => {
      data.push({
        'Type': 'Top produit',
        'Position': index + 1,
        'Produit': product.name,
        'Quantité vendue': product.quantity || 0,
        'Revenu (€)': product.revenue || 0
      });
    });
    
    // Catégories les plus vendues
    const topCategories = this.dashboardStats.topCategories || [];
    topCategories.forEach((category: any, index: number) => {
      data.push({
        'Type': 'Top catégorie',
        'Position': index + 1,
        'Catégorie': category.category,
        'Revenu (€)': category.revenue,
        'Pourcentage (%)': category.percentage || 0
      });
    });
    
    return data;
  }

  private generateExcelFile(data: any[], filename: string): void {
    try {
      // Note: Cette méthode nécessite la bibliothèque ExcelJS
      // Pour une solution plus simple, utilisez CSV
      this.exportToCSV(data, filename.replace('.xlsx', '.csv'));
      
    } catch (error) {
      console.error('❌ Erreur génération Excel:', error);
      this.showAlert('Erreur lors de la génération du fichier Excel', 'error');
      
      // Fallback: exporter en CSV
      this.exportToCSV(data, filename.replace('.xlsx', '.csv'));
    }
  }

  private exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(';'),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const escaped = ('' + value).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(';')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
    this.showAlert(`Fichier CSV "${filename}" généré avec succès`, 'success');
  }

  private formatDateForFilename(): string {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  }

  // ==================== MÉTHODES EXISTANTES ====================

  get filteredProducts(): Product[] {
    let filtered = this.products;
    
    if (this.productFilter === 'low-stock') {
      filtered = filtered.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0);
    } else if (this.productFilter === 'out-of-stock') {
      filtered = filtered.filter(p => p.stockQuantity === 0);
    } else if (this.productFilter === 'active') {
      filtered = filtered.filter(p => p.isActive);
    } else if (this.productFilter === 'inactive') {
      filtered = filtered.filter(p => !p.isActive);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        (p.category && p.category.toLowerCase().includes(term)) ||
        (p.brand && p.brand.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    return this.paginateArray(filtered, this.currentPage.products, this.itemsPerPage);
  }

  get filteredCustomers(): Customer[] {
    let filtered = this.customers;

    if (this.customerFilter === 'active') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter(customer => {
        if (!customer.lastOrderDate) return false;
        const lastOrder = new Date(customer.lastOrderDate);
        return lastOrder >= sixMonthsAgo;
      });
    } else if (this.customerFilter === 'new') {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      filtered = filtered.filter(customer => {
        if (!customer.firstOrderDate) return false;
        const orderDate = new Date(customer.firstOrderDate);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      });
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phoneNumber && c.phoneNumber.toLowerCase().includes(term))
      );
    }

    return this.paginateArray(filtered, this.currentPage.customers, this.itemsPerPage);
  }

  get filteredCoupons(): Coupon[] {
    let filtered = this.coupons;

    if (this.couponFilter === 'active') {
      filtered = filtered.filter(c => c.isActive && !this.isCouponExpired(c));
    } else if (this.couponFilter === 'expired') {
      filtered = filtered.filter(c => this.isCouponExpired(c));
    } else if (this.couponFilter === 'inactive') {
      filtered = filtered.filter(c => !c.isActive);
    }

    if (this.couponSearchTerm) {
      const term = this.couponSearchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.code.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
      );
    }

    return this.paginateArray(filtered, this.currentPage.coupons, this.itemsPerPage);
  }

  get filteredStockMovements(): StockMovement[] {
    let filtered = this.stockMovements;
    
    if (this.stockFilter !== 'all') {
      filtered = filtered.filter(m => m.type === this.stockFilter);
    }
    
    if (this.stockDateRange.start && this.stockDateRange.end) {
      const startDate = new Date(this.stockDateRange.start);
      const endDate = new Date(this.stockDateRange.end);
      
      filtered = filtered.filter(m => {
        const movementDate = new Date(m.performedAt);
        return movementDate >= startDate && movementDate <= endDate;
      });
    }
    
    return this.paginateArray(filtered, this.currentPage.stockMovements, this.itemsPerPage);
  }

  get filteredStockAlerts(): StockAlert[] {
    return this.paginateArray(this.stockAlerts, this.currentPage.stockAlerts, this.itemsPerPage);
  }

  // ==================== MÉTHODES DE FORMATAGE ====================

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return '-';
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  // ==================== MÉTHODES D'AFFICHAGE ====================

  showAlert(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number = 3000): void {
    console.log(`💬 ${type}: ${message}`);
    const id = Date.now();
    this.alerts.push({ id, message, type });
    
    setTimeout(() => {
      this.removeAlert(id);
    }, duration);
  }

  removeAlert(id: number) {
    this.alerts = this.alerts.filter(alert => alert.id !== id);
  }

  getAlertIcon(type: string): string {
    const icons: any = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
  }

  // ==================== NAVIGATION ET SECTIONS ====================

  setActiveSection(section: string) {
    console.log(`🎯 Activation section: ${section}`);
    this.activeSection = section;
    this.loadSectionData(section);
    this.closeMobileMenu();
  }

  handleSectionClick(section: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.setActiveSection(section);
  }

  loadSectionData(section: string) {
    if (!this.isLoggedIn) return;
    
    console.log(`📥 Chargement section: ${section}`);
    switch (section) {
      case 'dashboard': 
        this.loadDashboard();
        setTimeout(() => {
          this.loadDetailedStats();
          this.calculatePerformanceMetrics();
        }, 1000);
        break;
      case 'messages': this.loadMessages(); break;
      case 'orders': this.loadOrders(); break;
      case 'products': this.loadProducts(); break;
      case 'customers': 
        this.loadCustomers(); 
        setTimeout(() => {
          this.customerSegments = this.segmentCustomers();
        }, 500);
        break;
      case 'categories': this.loadCategories(); break;
      case 'coupons': this.loadCoupons(); break;
      case 'stock':
        this.loadStockMovements();
        this.loadStockAlerts();
        break;
      case 'order-items': this.loadOrderItems(); break;
      default: console.warn('❌ Section inconnue:', section);
    }
  }

  getSectionTitle(section?: string): string {
  const currentSection = section || this.activeSection;
  const titles: any = {
    dashboard: 'Tableau de Bord',
    messages: 'Gestion des Messages',
    orders: 'Gestion des Commandes',
    products: 'Gestion des Produits',
    customers: 'Gestion des Clients',
    categories: 'Gestion des Catégories',
    coupons: 'Gestion des Coupons',
    stock: 'Gestion de Stock', // AJOUTER CETTE LIGNE
    'order-items': 'Articles de Commandes'
  };
  return titles[currentSection] || 'Administration';
}

 getSectionIcon(section: string): string {
  const icons: any = {
    'dashboard': '📊',
    'messages': '📧',
    'orders': '📦',
    'products': '🛍️',
    'customers': '👥',
    'categories': '📂',
    'coupons': '🎫',
    'stock': '📦' // AJOUTER CETTE LIGNE
  };
  return icons[section] || '📁';
}

  // ==================== PAGINATION ====================

  paginateArray(array: any[], currentPage: number, itemsPerPage: number): any[] {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return array.slice(startIndex, startIndex + itemsPerPage);
  }

  get totalPages(): any {
    return {
      messages: Math.ceil(this.messages.length / this.itemsPerPage),
      orders: Math.ceil(this.orders.length / this.itemsPerPage),
      products: Math.ceil(this.products.length / this.itemsPerPage),
      customers: Math.ceil(this.customers.length / this.itemsPerPage),
      categories: Math.ceil(this.categories.length / this.itemsPerPage),
      coupons: Math.ceil(this.coupons.length / this.itemsPerPage),
      stockMovements: Math.ceil(this.stockMovements.length / this.itemsPerPage),
      stockAlerts: Math.ceil(this.stockAlerts.length / this.itemsPerPage)
    };
  }

  changePage(section: string, page: number) {
    this.currentPage[section] = page;
  }

  // ==================== SYNCHRONISATION DES PRODUITS ====================

  isSavonProduct(product: Product): boolean {
    if (!product) return false;
    
    const category = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    const isSavon = 
      category.includes('savon') || 
      name.includes('savon') ||
      description.includes('savon') ||
      category.includes('soap') ||
      name.includes('soap') ||
      category.includes('savons') ||
      name.includes('savons') ||
      category.includes('bar') ||
      name.includes('bar');
      
    const isActive = product.isActive === undefined ? true : product.isActive;
    
    return isSavon && isActive;
  }

  isHuilesEssentiellesProduct(product: Product): boolean {
    if (!product) return false;
    
    const category = (product.category || '').toLowerCase();
    const name = (product.name || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    const isHuilesEssentielles = 
      category.includes('huile') || 
      name.includes('huile') ||
      description.includes('huile') ||
      category.includes('essentiel') ||
      name.includes('essentiel') ||
      category.includes('aroma') ||
      name.includes('aroma') ||
      category.includes('diffuseur') ||
      name.includes('diffuseur') ||
      category.includes('bougie') ||
      name.includes('bougie') ||
      category.includes('parfum') ||
      name.includes('parfum') ||
      category.includes('odorat') ||
      name.includes('odorat') ||
      category.includes('sent') ||
      name.includes('sent') ||
      category.includes('encens') ||
      name.includes('encens');
      
    const isActive = product.isActive === undefined ? true : product.isActive;
    
    return isHuilesEssentielles && isActive;
  }

  autoSyncProducts(): void {
    console.log('🔄 Synchronisation automatique des produits savon...');
    
    const savonProducts = this.products.filter(product => 
      this.isSavonProduct(product)
    );

    if (savonProducts.length > 0) {
      localStorage.setItem('savonProducts', JSON.stringify(savonProducts));
      window.dispatchEvent(new Event('savonProductsUpdated'));
      console.log(`✅ ${savonProducts.length} produits savon synchronisés automatiquement`);
    }
  }

  autoSyncHuilesEssentielles(): void {
    console.log('🔄 Synchronisation automatique des huiles essentielles...');
    
    const huilesProducts = this.products.filter(product => 
      this.isHuilesEssentiellesProduct(product)
    );

    if (huilesProducts.length > 0) {
      localStorage.setItem('huilesEssentiellesProducts', JSON.stringify(huilesProducts));
      window.dispatchEvent(new Event('huilesEssentiellesProductsUpdated'));
      console.log(`✅ ${huilesProducts.length} produits huiles essentielles synchronisés automatiquement`);
    }
  }

  // ==================== TEST API ====================

  testApiConnection() {
    console.log('🔍 Test de connexion API...');
    this.http.get('http://localhost:8080/api/admin/health').subscribe({
      next: (response) => {
        console.log('✅ API accessible:', response);
        this.showAlert('Connexion API établie', 'success');
      },
      error: (error) => {
        console.error('❌ API inaccessible:', error);
        this.showAlert('Erreur de connexion à l\'API', 'error');
      }
    });
  }

  // ==================== GRAPHIQUES ====================

  initCharts() {
    console.log('📊 Initialisation des graphiques...');
    try {
      this.initRevenueChart();
      this.initOrdersChart();
      this.initSalesChart();
    } catch (error) {
      console.error('❌ Erreur initialisation graphiques:', error);
    }
  }

  initRevenueChart() {
    if (!this.revenueChartRef?.nativeElement) {
      console.warn('❌ Element revenueChart non trouvé');
      return;
    }

    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    const monthlyStats = this.dashboardStats.monthlyStats || [];
    console.log('📈 Données revenue chart:', monthlyStats);

    if (monthlyStats.length === 0) {
      console.warn('⚠️ Aucune donnée pour le graphique des revenus');
      return;
    }

    const labels = monthlyStats.map((stat: any) => {
      const date = new Date(stat[0]);
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    });
    const revenues = monthlyStats.map((stat: any) => stat[1] || 0);
    const orders = monthlyStats.map((stat: any) => stat[2] || 0);

    try {
      this.revenueChart = new Chart(this.revenueChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Revenus (€)',
              data: revenues,
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              yAxisID: 'y'
            },
            {
              label: 'Commandes',
              data: orders,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 2,
              fill: false,
              tension: 0.4,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Revenus et Commandes Mensuels' }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: 'Revenus (€)' },
              ticks: { callback: (value: any) => value + '€' }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: { display: true, text: 'Commandes' },
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
      console.log('✅ Graphique revenus initialisé');
    } catch (error) {
      console.error('❌ Erreur création graphique revenus:', error);
    }
  }

  initOrdersChart() {
    if (!this.ordersChartRef?.nativeElement) {
      console.warn('❌ Element ordersChart non trouvé');
      return;
    }

    if (this.ordersChart) {
      this.ordersChart.destroy();
    }

    const statusData = {
      'EN ATTENTE': this.dashboardStats.pendingOrders || 0,
      'CONFIRMÉE': this.dashboardStats.confirmedOrders || 0,
      'EXPÉDIÉE': this.dashboardStats.shippedOrders || 0,
      'LIVRÉE': this.dashboardStats.deliveredOrders || 0,
      'ANNULÉE': this.dashboardStats.cancelledOrders || 0
    };

    console.log('📊 Données orders chart:', statusData);

    try {
      this.ordersChart = new Chart(this.ordersChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusData),
          datasets: [{
            data: Object.values(statusData),
            backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'],
            borderWidth: 3,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Répartition des Commandes' }
          }
        }
      });
      console.log('✅ Graphique commandes initialisé');
    } catch (error) {
      console.error('❌ Erreur création graphique commandes:', error);
    }
  }

  initSalesChart() {
    if (!this.salesChartRef?.nativeElement) {
      console.warn('❌ Element salesChart non trouvé');
      return;
    }

    if (this.salesChart) {
      this.salesChart.destroy();
    }

    const topProducts = this.dashboardStats.topProducts || [];
    console.log('📊 Données sales chart:', topProducts);

    if (topProducts.length === 0) {
      console.warn('⚠️ Aucune donnée pour le graphique des ventes');
      return;
    }

    const labels = topProducts.map((product: any) => product[0]);
    const sales = topProducts.map((product: any) => product[1]);

    try {
      this.salesChart = new Chart(this.salesChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Ventes',
            data: sales,
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderColor: '#4f46e5',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top 5 Produits les Plus Vendus' }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Quantité Vendue' }
            }
          }
        }
      });
      console.log('✅ Graphique ventes initialisé');
    } catch (error) {
      console.error('❌ Erreur création graphique ventes:', error);
    }
  }

  cleanupCharts() {
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.ordersChart) this.ordersChart.destroy();
    if (this.salesChart) this.salesChart.destroy();
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  closeModal() {
    this.modals = {
      product: false,
      category: false,
      coupon: false,
      couponProducts: false,
      stockAdjustment: false,
      stockThreshold: false,
      bulkStockUpdate: false,
      stockMovementDetail: false,
      inventoryReportModal: false,
      couponPreview: false,
      messageDetail: false,
      orderDetail: false,
      customerDetail: false,
      confirmDelete: false,
      deleteConfirmation: false,
      login: false
    };
    this.selectedMessage = null;
    this.selectedOrder = null;
    this.selectedProduct = null;
    this.selectedCategory = null;
    this.selectedCoupon = null;
    this.selectedCustomer = null;
    this.selectedStockMovement = null;
    this.itemToDelete = null;
    this.couponSimulationResult = null;
    
    this.removeImage();
    this.removeCategoryImage();
    this.resetFieldGroups();
  }

  resetFieldGroups() {
    this.fieldGroups = {
      additionalInfo: false
    };
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedImageFile = null;
    this.imageUrlInput = '';
    this.isUrlValid = false;
    this.urlValidationMessage = '';
    this.productForm.patchValue({ imageUrl: '' });
    
    if (this.productImageInput) {
      this.productImageInput.nativeElement.value = '';
    }
    
    this.showAlert('Image supprimée', 'info');
  }

  removeCategoryImage(): void {
    this.categoryImagePreview = null;
    this.selectedCategoryImageFile = null;
    this.categoryImageUrlInput = '';
    this.isCategoryUrlValid = false;
    this.categoryUrlValidationMessage = '';
    this.categoryForm.patchValue({ imageUrl: '' });
    
    if (this.categoryImageInput) {
      this.categoryImageInput.nativeElement.value = '';
    }
    
    this.showAlert('Image de catégorie supprimée', 'info');
  }

  // ==================== GETTERS POUR LES STATISTIQUES ====================

  get totalOrders(): number { return this.dashboardStats.totalOrders || 0; }
  get totalCustomers(): number { return this.dashboardStats.totalCustomers || 0; }
  get totalProducts(): number { return this.dashboardStats.totalProducts || 0; }
  get activeProducts(): number { return this.dashboardStats.activeProducts || 0; }
  get outOfStockProducts(): number { return this.dashboardStats.outOfStockProducts || 0; }
  get totalMessages(): number { return this.dashboardStats.totalMessages || 0; }
  get totalRevenue(): number { return this.dashboardStats.totalRevenue || 0; }
  get pendingOrdersCount(): number { return this.dashboardStats.pendingOrders || 0; }
  get unreadMessagesCount(): number { return this.dashboardStats.unreadMessages || 0; }
  get lowStockProductsCount(): number { return this.dashboardStats.lowStockProducts || 0; }
  get urgentMessagesCount(): number { return this.dashboardStats.urgentMessages || 0; }
  get averageOrderValue(): number { return this.dashboardStats.averageOrderValue || 0; }
  get revenueThisMonth(): number { return this.dashboardStats.revenueThisMonth || 0; }
  get newCustomersThisMonth(): number { return this.dashboardStats.newCustomersThisMonth || 0; }
  get confirmedOrders(): number { return this.dashboardStats.confirmedOrders || 0; }
  get shippedOrders(): number { return this.dashboardStats.shippedOrders || 0; }
  get deliveredOrders(): number { return this.dashboardStats.deliveredOrders || 0; }
  get cancelledOrders(): number { return this.dashboardStats.cancelledOrders || 0; }
  get ordersThisMonth(): number { return this.dashboardStats.ordersThisMonth || 0; }
  get customersWithOrders(): number { return this.dashboardStats.customersWithOrders || 0; }
  get customersWithoutOrders(): number { return this.dashboardStats.customersWithoutOrders || 0; }
  get customerOrderRate(): number { return this.dashboardStats.customerOrderRate || 0; }
  get revenueToday(): number { return this.dashboardStats.revenueToday || 0; }
  get repeatCustomerRate(): number { return this.dashboardStats.repeatCustomerRate || 0; }
  get customerLifetimeValue(): number { return this.dashboardStats.customerLifetimeValue || 0; }
  get inventoryValue(): number { return this.dashboardStats.inventoryValue || 0; }
  get salesGrowth(): number { return this.dashboardStats.salesGrowth || 0; }
  get conversionRate(): number { return this.dashboardStats.conversionRate || 0; }

  getSavonProductsCount(): number {
    return this.products.filter(product => this.isSavonProduct(product)).length;
  }

  getHuilesEssentiellesProductsCount(): number {
    return this.products.filter(product => this.isHuilesEssentiellesProduct(product)).length;
  }

  getStockStatusText(stockQuantity: number): string {
    if (stockQuantity === 0) {
      return 'Rupture de stock';
    } else if (stockQuantity < 10) {
      return 'Stock faible';
    } else if (stockQuantity < 25) {
      return 'Stock moyen';
    } else {
      return 'Stock suffisant';
    }
  }

  // ==================== MÉTHODES POUR LES SYNCHRONISATIONS ====================

 

  syncProductsWithCouponsToPages(): void {
    console.log('🔄 Synchronisation des produits avec coupons vers les pages...');
    
    const savonProducts = this.products.filter(product => 
      this.isSavonProduct(product)
    ).map(product => ({ ...product }));
    
    const huilesProducts = this.products.filter(product => 
      this.isHuilesEssentiellesProduct(product)
    ).map(product => ({ ...product }));
    
    const huileOliveProducts = this.products.filter(product => 
      this.isHuileOliveProduct(product)
    ).map(product => ({ ...product }));
    
    const savonCoupons = JSON.parse(localStorage.getItem('savonCoupons') || '[]');
    const huilesCoupons = JSON.parse(localStorage.getItem('huilesEssentiellesCoupons') || '[]');
    const huileOliveCoupons = JSON.parse(localStorage.getItem('huileOliveCoupons') || '[]');
    
    this.applyCouponsToProducts(savonProducts, savonCoupons);
    this.applyCouponsToProducts(huilesProducts, huilesCoupons);
    this.applyCouponsToProducts(huileOliveProducts, huileOliveCoupons);
    
    localStorage.setItem('savonProducts', JSON.stringify(savonProducts));
    localStorage.setItem('huilesEssentiellesProducts', JSON.stringify(huilesProducts));
    localStorage.setItem('huileOliveProducts', JSON.stringify(huileOliveProducts));
    
    console.log('✅ Produits avec coupons synchronisés vers les pages');
  }

  applyCouponsToProducts(products: Product[], coupons: Coupon[]): void {
    products.forEach(product => {
      const productCoupons = coupons.filter(coupon => 
        coupon.applicableProducts && coupon.applicableProducts.includes(product.id)
      );
      
      if (productCoupons.length > 0) {
        const bestCoupon = this.getBestProductCouponFromList(product, productCoupons);
        this.applyCouponToProduct(product, bestCoupon);
      } else {
        this.removeCouponFromProduct(product);
      }
    });
  }

  getBestProductCouponFromList(product: Product, coupons: Coupon[]): Coupon | null {
    if (coupons.length === 0) return null;
    
    return coupons.reduce((best, current) => {
      const currentDiscount = this.calculateDiscountAmount(product.price, current);
      const bestDiscount = best ? this.calculateDiscountAmount(product.price, best) : 0;
      return currentDiscount > bestDiscount ? current : best;
    }, null as Coupon | null);
  }

  applyCouponToProduct(product: Product, coupon: Coupon | null): void {
    if (coupon) {
      product.hasDiscount = true;
      product.discountedPrice = this.calculateDiscountedPrice(product.price, coupon);
      product.discountPercentage = Math.round(
        (1 - (product.discountedPrice / product.price)) * 100
      );
      product.originalPrice = product.price;
    } else {
      this.removeCouponFromProduct(product);
    }
  }

  removeCouponFromProduct(product: Product): void {
    product.hasDiscount = false;
    product.discountedPrice = undefined;
    product.discountPercentage = undefined;
    product.originalPrice = undefined;
  }

  updateProductCouponAssociations(): void {
    console.log('🔗 Mise à jour des associations produits-coupons...');
    
    this.products.forEach(product => {
      product.couponIds = [];
    });
    
    this.coupons.forEach(coupon => {
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        coupon.applicableProducts.forEach(productId => {
          const product = this.products.find(p => p.id === productId);
          if (product) {
            if (!product.couponIds) {
              product.couponIds = [];
            }
            if (!product.couponIds.includes(coupon.id)) {
              product.couponIds.push(coupon.id);
            }
          }
        });
      } else {
        this.products.forEach(product => {
          if (!product.couponIds) {
            product.couponIds = [];
          }
          if (!product.couponIds.includes(coupon.id)) {
            product.couponIds.push(coupon.id);
          }
        });
      }
    });
    
    this.updateProductDiscountDisplay();
  }

  // ==================== MÉTHODES POUR LE TEMPLATE ====================

  getStatusText(status: string): string {
    const texts: any = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée',
      'NEW': 'Nouveau',
      'READ': 'Lu',
      'REPLIED': 'Répondu',
      'ARCHIVED': 'Archivé',
      'URGENT': 'Urgent',
      'HIGH': 'Élevée',
      'MEDIUM': 'Moyenne',
      'LOW': 'Basse',
      'PAID': 'Payé',
      'UNPAID': 'Impayé',
      'REFUNDED': 'Remboursé'
    };
    return texts[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    const classes: any = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'SHIPPED': 'status-shipped',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled',
      'NEW': 'badge-secondary',
      'READ': 'badge-light',
      'REPLIED': 'badge-success'
    };
    return classes[status] || 'badge-secondary';
  }

  getCustomerSegment(customer: Customer): string {
    const customerDetails = this.getCustomerWithOrderDetails(customer.id);
    return customerDetails?.customerValue || 'Standard';
  }

  getCustomerWithOrderDetails(customerId: number): any {
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) return null;

    const customerOrders = this.orders.filter(order => 
      order.customerEmail === customer.email
    );

    const totalSpent = customerOrders.reduce((total, order) => total + order.totalAmount, 0);
    const averageOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
    
    const lastOrder = customerOrders.sort((a, b) => 
      new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    )[0];

    return {
      ...customer,
      orders: customerOrders,
      totalOrders: customerOrders.length,
      totalSpent,
      averageOrderValue,
      lastOrder,
      customerValue: this.calculateCustomerValue(customer, customerOrders)
    };
  }

  calculateCustomerValue(customer: Customer, orders: CustomerOrder[]): string {
    const totalSpent = orders.reduce((total, order) => total + order.totalAmount, 0);
    const orderCount = orders.length;
    
    if (totalSpent > 1000 && orderCount > 5) return 'VIP';
    if (totalSpent > 500 && orderCount > 3) return 'Fidèle';
    if (totalSpent > 100 && orderCount > 1) return 'Régulier';
    return 'Standard';
  }

  segmentCustomers(): any {
    const segments = {
      vip: [] as Customer[],
      loyal: [] as Customer[],
      regular: [] as Customer[],
      new: [] as Customer[],
      inactive: [] as Customer[]
    };

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    this.customers.forEach(customer => {
      const customerDetails = this.getCustomerWithOrderDetails(customer.id);
      
      if (!customer.lastOrderDate) {
        segments.new.push(customer);
      } else if (new Date(customer.lastOrderDate) < sixMonthsAgo) {
        segments.inactive.push(customer);
      } else if (customerDetails.customerValue === 'VIP') {
        segments.vip.push(customer);
      } else if (customerDetails.customerValue === 'Fidèle') {
        segments.loyal.push(customer);
      } else if (customerDetails.customerValue === 'Régulier') {
        segments.regular.push(customer);
      } else {
        segments.new.push(customer);
      }
    });

    return segments;
  }

  // ==================== MÉTHODES POUR LES PRODUITS ====================

  openProductModal(product?: Product) {
    console.log('🛍️ Ouverture modal produit:', product);
    
    this.resetFieldGroups();
    this.removeImage();
    
    if (product) {
      this.selectedProduct = product;
      this.productForm.patchValue({
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        category: product.category,
        imageUrl: product.imageUrl,
        brand: product.brand,
        weight: product.weight,
        isActive: product.isActive,
        composition: product.composition || '',
        skinType: product.skinType || '',
        reference: product.reference || '',
        specialOffer: product.specialOffer || ''
      });
    } else {
      this.selectedProduct = null;
      this.productForm.reset({
        price: 0,
        stockQuantity: 0,
        weight: 0,
        isActive: true
      });
    }
    this.modals.product = true;
  }

  saveProductWithImage(): void {
    if (this.productForm.valid) {
      console.log('🛍️ Sauvegarde produit avec image...');
      this.loading.action = true;

      if (this.isUrlValid && this.imageUrlInput) {
        console.log('🔗 Utilisation URL image validée:', this.imageUrlInput);
        this.saveProductFinal(this.imageUrlInput);
      } else if (this.selectedImageFile) {
        this.uploadProductImageWithCallback().then((imageUrl: string | null) => {
          if (imageUrl) {
            this.saveProductFinal(imageUrl);
          } else {
            this.showAlert('Erreur lors de l\'upload de l\'image', 'error');
            this.loading.action = false;
          }
        });
      } else {
        this.saveProductFinal();
      }
    } else {
      this.showAlert('Veuillez corriger les erreurs du formulaire', 'warning');
      this.markFormGroupTouched(this.productForm);
    }
  }

  saveProductFinal(imageUrl?: string): void {
    const productData = { ...this.productForm.value };
    
    if (imageUrl) {
      productData.imageUrl = imageUrl;
    }
    
    console.log('📤 Données finales du produit:', productData);

    const observable = this.selectedProduct
      ? this.adminService.updateProduct(this.selectedProduct.id, productData)
      : this.adminService.createProduct(productData);

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product>) => {
        if (response.success) {
          const action = this.selectedProduct ? 'modifié' : 'créé';
          const savedProduct = response.data || productData;
          
          this.showAlert(`Produit ${action} avec succès`, 'success');
          this.modals.product = false;
          this.loadProducts();
          
          this.forceSyncAfterProductSave(savedProduct);
          
        } else {
          console.error('❌ Réponse erreur du serveur:', response);
          this.showAlert(response.message || `Erreur lors de la ${this.selectedProduct ? 'modification' : 'création'}`, 'error');
        }
        this.loading.action = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur complète sauvegarde produit:', error);
        let errorMessage = `Erreur lors de la ${this.selectedProduct ? 'modification' : 'création'} du produit`;
        
        if (error.status === 500) {
          errorMessage += ' - Erreur interne du serveur. Vérifiez les logs.';
        } else if (error.error && error.error.message) {
          errorMessage += ` - ${error.error.message}`;
        }
        
        this.showAlert(errorMessage, 'error');
        this.loading.action = false;
      }
    });
  }

 
  private syncSingleProductToSavon(product: any): void {
    console.log('🔄 Synchronisation produit savon vers page savon:', product.name);
    
    this.adminService.getSavonProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        let savonProducts: Product[] = [];
        
        if (response.success && response.products) {
          savonProducts = response.products;
        }
        
        const existingIndex = savonProducts.findIndex(p => p.id === product.id);
        
        if (existingIndex !== -1) {
          savonProducts[existingIndex] = { ...savonProducts[existingIndex], ...product };
          console.log('✅ Produit savon mis à jour dans le stockage local');
        } else {
          savonProducts.push(product);
          console.log('✅ Nouveau produit savon ajouté au stockage local');
        }
        
        this.adminService.saveSavonProducts(savonProducts).subscribe({
          next: (saveResponse) => {
            if (saveResponse.success) {
              window.dispatchEvent(new Event('savonProductsUpdated'));
              
              const message = existingIndex !== -1 ? 
                'Produit savon mis à jour avec succès' : 
                'Nouveau produit savon ajouté avec succès';
              
              this.showAlert(message, 'success');
              
              console.log('📊 État des produits savon après synchronisation:', {
                totalProducts: savonProducts.length,
                productIds: savonProducts.map(p => ({id: p.id, name: p.name}))
              });
            }
          },
          error: (error) => {
            console.error('❌ Erreur sauvegarde produits savon:', error);
            this.showAlert('Erreur lors de la synchronisation savon', 'error');
          }
        });
      },
      error: (error) => {
        console.error('❌ Erreur chargement produits savon:', error);
      }
    });
  }

  private syncSingleProductToHuilesEssentielles(product: any): void {
    console.log('🔄 Synchronisation produit huiles essentielles:', product.name);
    
    this.adminService.getHuilesEssentiellesProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        let huilesProducts: Product[] = [];
        
        if (response.success && response.products) {
          huilesProducts = response.products;
        }
        
        const existingIndex = huilesProducts.findIndex(p => p.id === product.id);
        
        if (existingIndex !== -1) {
          huilesProducts[existingIndex] = { ...huilesProducts[existingIndex], ...product };
          console.log('✅ Produit huiles essentielles mis à jour dans le stockage local');
        } else {
          huilesProducts.push(product);
          console.log('✅ Nouveau produit huiles essentielles ajouté au stockage local');
        }
        
        this.adminService.saveHuilesEssentiellesProducts(huilesProducts).subscribe({
          next: (saveResponse) => {
            if (saveResponse.success) {
              window.dispatchEvent(new Event('huilesEssentiellesProductsUpdated'));
              
              const message = existingIndex !== -1 ? 
                'Produit huiles essentielles mis à jour avec succès' : 
                'Nouveau produit huiles essentielles ajouté avec succès';
              
              this.showAlert(message, 'success');
              
              console.log('📊 État des produits huiles essentielles après synchronisation:', {
                totalProducts: huilesProducts.length,
                productIds: huilesProducts.map(p => ({id: p.id, name: p.name}))
              });
            }
          },
          error: (error) => {
            console.error('❌ Erreur sauvegarde produits huiles essentielles:', error);
            this.showAlert('Erreur lors de la synchronisation huiles essentielles', 'error');
          }
        });
      },
      error: (error) => {
        console.error('❌ Erreur chargement produits huiles essentielles:', error);
      }
    });
  }

  toggleProductStatus(product: Product) {
    console.log('🛍️ Changement statut produit:', product.id, !product.isActive);
    const newStatus = !product.isActive;
    this.adminService.updateProductStatus(product.id, newStatus).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product>) => {
        if (response.success) {
          product.isActive = newStatus;
          this.showAlert(`Produit ${newStatus ? 'activé' : 'désactivé'}`, 'success');
          
          if (this.isSavonProduct(product)) {
            this.syncSingleProductToSavon(product);
          }
          
          if (this.isHuilesEssentiellesProduct(product)) {
            this.syncSingleProductToHuilesEssentielles(product);
          }
          
          if (this.isHuileOliveProduct(product)) {
            this.syncSingleProductToHuileOlive(product);
          }
        } else {
          this.showAlert('Erreur lors du changement de statut', 'error');
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur changement statut produit:', error);
      }
    });
  }

  // ==================== MÉTHODES POUR LES CATÉGORIES ====================

  openCategoryModal(category?: Category) {
    console.log('📂 Ouverture modal catégorie:', category);
    if (category) {
      this.selectedCategory = category;
      this.categoryForm.patchValue({
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        displayOrder: category.displayOrder,
        isActive: category.isActive
      });
    } else {
      this.selectedCategory = null;
      this.categoryForm.reset({
        displayOrder: 0,
        isActive: true
      });
    }
    this.modals.category = true;
  }

  saveCategoryWithImage(): void {
    if (this.categoryForm.valid) {
      console.log('📂 Sauvegarde catégorie avec image...');
      this.loading.action = true;

      if (this.isCategoryUrlValid && this.categoryImageUrlInput) {
        console.log('🔗 Utilisation URL image catégorie validée:', this.categoryImageUrlInput);
        this.saveCategoryFinal(this.categoryImageUrlInput);
      } else if (this.selectedCategoryImageFile) {
        this.uploadCategoryImageWithCallback().then((imageUrl: string | null) => {
          if (imageUrl) {
            this.saveCategoryFinal(imageUrl);
          } else {
            this.showAlert('Erreur lors de l\'upload de l\'image', 'error');
            this.loading.action = false;
          }
        });
      } else {
        this.saveCategoryFinal();
      }
    } else {
      this.showAlert('Veuillez corriger les erreurs du formulaire', 'warning');
    }
  }

  saveCategoryFinal(imageUrl?: string): void {
    const categoryData = { ...this.categoryForm.value };
    
    if (imageUrl) {
      categoryData.imageUrl = imageUrl;
    }

    const observable = this.selectedCategory
      ? this.adminService.updateCategory(this.selectedCategory.id, categoryData)
      : this.adminService.createCategory(categoryData);

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Category>) => {
        if (response.success) {
          const action = this.selectedCategory ? 'modifiée' : 'créée';
          this.showAlert(`Catégorie ${action} avec succès`, 'success');
          this.modals.category = false;
          this.loadCategories();
        } else {
          this.showAlert(`Erreur lors de la ${this.selectedCategory ? 'modification' : 'création'}`, 'error');
        }
        this.loading.action = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur sauvegarde catégorie:', error);
        this.loading.action = false;
      }
    });
  }

  toggleCategoryStatus(category: Category): void {
    const newStatus = !category.isActive;
    console.log('Changement statut catégorie:', category.id, newStatus);
    
    this.adminService.updateCategory(category.id, { isActive: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Category>) => {
          if (response.success) {
            category.isActive = newStatus;
            this.showAlert(`Catégorie ${newStatus ? 'activée' : 'désactivée'}`, 'success');
          } else {
            this.showAlert('Erreur lors du changement de statut', 'error');
          }
        },
        error: (error: any) => {
          console.error('❌ Erreur changement statut catégorie:', error);
          this.showAlert('Erreur lors du changement de statut', 'error');
        }
      });
  }

  // ==================== MÉTHODES POUR LES MESSAGES ====================

  openMessageDetail(message: Message | null) {
    if (message === null) {
      this.selectedMessage = {
        id: 0,
        name: '',
        email: '',
        subject: '',
        message: '',
        isRead: false,
        isReplied: false,
        priority: 'MEDIUM',
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      this.selectedMessage = message;
    }
    
    this.messageResponseForm.reset();
    this.modals.messageDetail = true;
    
    if (this.selectedMessage && !this.selectedMessage.isRead) {
      this.markMessageAsRead(this.selectedMessage);
    }
  }

  markMessageAsRead(message: Message) {
    console.log('📧 Marquer comme lu:', message.id);
    this.adminService.markMessageAsRead(message.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Message>) => {
        if (response.success) {
          message.isRead = true;
          message.status = 'READ';
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur marquage message lu:', error);
      }
    });
  }

  markMessageAsUnread(message: Message) {
    console.log('📧 Marquer comme non lu:', message.id);
    this.adminService.markMessageAsUnread(message.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Message>) => {
        if (response.success) {
          message.isRead = false;
          message.status = 'NEW';
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur marquage message non lu:', error);
      }
    });
  }

  respondToMessage() {
    if (this.messageResponseForm.valid && this.selectedMessage) {
      console.log('📧 Réponse au message:', this.selectedMessage.id);
      this.loading.action = true;
      const formData = this.messageResponseForm.value;

      this.adminService.respondToMessage(
        this.selectedMessage.id,
        formData.response,
        formData.adminNotes
      ).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: ApiResponse<Message>) => {
          if (response.success) {
            this.selectedMessage = response.messageData!;
            this.showAlert('Réponse envoyée avec succès', 'success');
            this.modals.messageDetail = false;
            this.loadMessages();
          } else {
            this.showAlert('Erreur lors de l\'envoi de la réponse', 'error');
          }
          this.loading.action = false;
        },
        error: (error: any) => {
          console.error('❌ Erreur réponse message:', error);
          this.loading.action = false;
        }
      });
    } else {
      this.showAlert('Veuillez remplir tous les champs requis', 'warning');
    }
  }

  // ==================== MÉTHODES POUR LES COMMANDES ====================

 

  updateOrderStatus() {
    if (this.orderStatusForm.valid && this.selectedOrder) {
      console.log('📦 Mise à jour statut commande:', this.selectedOrder.id);
      this.loading.action = true;
      const formData = this.orderStatusForm.value;

      this.adminService.updateOrderStatus(this.selectedOrder.id, formData.status)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ApiResponse<CustomerOrder>) => {
            if (response.success) {
              this.selectedOrder = response.order!;
              this.showAlert('Statut de commande mis à jour', 'success');
              this.loadOrders();
            } else {
              this.showAlert('Erreur lors de la mise à jour', 'error');
            }
            this.loading.action = false;
          },
          error: (error: any) => {
            console.error('❌ Erreur mise à jour statut:', error);
            this.loading.action = false;
          }
        });
    }
  }

  

  

  

  
  simulateCoupon(coupon?: any): void {
    let couponCode: string;
    let orderAmount: number;
    
    if (!coupon) {
      couponCode = prompt('Code coupon:') || '';
      const amountInput = prompt('Montant de la commande (€):');
      orderAmount = amountInput ? parseFloat(amountInput) : 0;
    } else if (typeof coupon === 'string') {
      couponCode = coupon;
      const amountInput = prompt('Montant de la commande (€):');
      orderAmount = amountInput ? parseFloat(amountInput) : 0;
    } else if (coupon.code) {
      couponCode = coupon.code;
      const amountInput = prompt('Montant de la commande (€):');
      orderAmount = amountInput ? parseFloat(amountInput) : 0;
    } else {
      this.showAlert('Coupon invalide', 'warning');
      return;
    }
    
    if (!couponCode || !orderAmount || orderAmount <= 0) {
      this.showAlert('Informations invalides', 'warning');
      return;
    }
    
    this.loading.action = true;
    
    this.adminService.simulateCouponApplication(couponCode, orderAmount)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: CouponSimulationResult) => {
          this.loading.action = false;
          this.couponSimulationResult = result;
          
          if (result.success && result.valid) {
            this.showAlert(
              `Coupon valide! Économie: ${this.formatCurrency(result.discountAmount)} (${result.savingsPercentage.toFixed(1)}%)`,
              'success'
            );
          } else {
            this.showAlert(result.message || 'Coupon invalide', 'error');
          }
        },
        error: (error) => {
          this.loading.action = false;
          console.error('❌ Erreur simulation:', error);
          this.showAlert('Erreur lors de la simulation', 'error');
        }
      });
  }

  private sendOrderConfirmationEmail(order: CustomerOrder): void {
    console.log('📧 Envoi email confirmation commande:', order.orderNumber);
    
    const emailData = {
      to: order.customerEmail,
      subject: `Confirmation de votre commande #${order.orderNumber}`,
      order: order,
    };
    
    this.http.post(`${this.apiUrl}/orders/${order.id}/send-confirmation-email`, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('✅ Email de confirmation envoyé', response);
        },
        error: (error) => {
          console.error('❌ Erreur envoi email:', error);
        }
      });
    
    console.log(`📧 Email de confirmation serait envoyé à: ${order.customerEmail}`);
  }

  private sendShippingEmail(order: CustomerOrder, trackingNumber: string): void {
    console.log('📧 Envoi email expédition:', order.orderNumber);
    console.log(`📧 Email d'expédition pour ${order.customerEmail}`);
    console.log(`Sujet: Votre commande #${order.orderNumber} a été expédiée`);
    console.log(`Numéro de suivi: ${trackingNumber}`);
  }

  private sendDeliveryEmail(order: CustomerOrder): void {
    console.log('📧 Envoi email livraison:', order.orderNumber);
    console.log(`📧 Email de livraison pour ${order.customerEmail}`);
    console.log(`Sujet: Votre commande #${order.orderNumber} a été livrée`);
  }

  private async registerCustomerFromOrder(order: CustomerOrder): Promise<void> {
    try {
      const existingCustomer = this.customers.find(c => 
        c.email.toLowerCase() === order.customerEmail.toLowerCase()
      );

      if (existingCustomer) {
        await this.adminService.updateCustomerFromOrder(existingCustomer.id, order)
          .pipe(takeUntil(this.destroy$))
          .toPromise();
      } else {
        const response = await this.adminService.createCustomerFromOrder(order)
          .pipe(takeUntil(this.destroy$))
          .toPromise();
        
        if (response && response.success && response.data) {
          this.customers.push(response.data);
        }
      }
    } catch (error) {
      console.error('❌ Erreur enregistrement client:', error);
    }
  }

  // ==================== MÉTHODES POUR LES CLIENTS ====================

  viewCustomerDetails(customer: Customer | null) {
    if (customer === null) {
      this.selectedCustomer = {
        id: 0,
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        governorate: '',
        ordersCount: 0,
        totalSpent: 0,
        registrationDate: new Date().toISOString(),
        firstOrderDate: '',
        lastOrderDate: '',
        isActive: true,
        notes: ''
      };
      console.log('👤 Création nouveau client');
    } else {
      this.selectedCustomer = customer;
      console.log('👤 Affichage détail client:', customer.email);
    }
    
    this.modals.customerDetail = true;
  }

  sendEmailToCustomer(customer: Customer): void {
    console.log('Envoi email à:', customer.email);
    this.showAlert(`Email envoyé à ${customer.email}`, 'success');
  }

  syncCustomerFromOrder(order: CustomerOrder): void {
    const existingCustomer = this.customers.find(c => 
      c.email.toLowerCase() === order.customerEmail.toLowerCase()
    );
    
    if (!existingCustomer) {
      this.createCustomerFromOrder(order);
    } else {
      this.updateCustomerFromOrder(existingCustomer, order);
    }
  }

  createCustomerFromOrder(order: CustomerOrder): void {
    console.log('👤 Création client depuis commande:', order.customerEmail);
    
    const nameParts = order.customerName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const customerData = {
      firstName: firstName,
      lastName: lastName,
      email: order.customerEmail,
      phoneNumber: order.customerPhone || '',
      address: order.deliveryAddress || '',
      governorate: order.deliveryAddress?.split(', ').pop() || '',
      ordersCount: 1,
      totalSpent: order.totalAmount,
      firstOrderDate: order.orderDate,
      lastOrderDate: order.orderDate,
      isActive: true,
      notes: `Client créé depuis commande ${order.orderNumber}`
    };
    
    this.adminService.createCustomer(customerData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Customer>) => {
          if (response.success && response.data) {
            console.log('✅ Client créé:', response.data.email);
            this.customers.push(response.data);
          }
        },
        error: (error: any) => {
          console.error('❌ Erreur création client:', error);
        }
      });
  }

  updateCustomerFromOrder(customer: Customer, order: CustomerOrder): void {
    const updateData = {
      ordersCount: (customer.ordersCount || 0) + 1,
      totalSpent: (customer.totalSpent || 0) + order.totalAmount,
      lastOrderDate: order.orderDate
    };
    
    if (!customer.firstOrderDate) {
      (updateData as any).firstOrderDate = order.orderDate;
    }
    
    this.adminService.updateCustomer(customer.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Customer>) => {
          if (response.success && response.data) {
            Object.assign(customer, response.data);
            console.log('✅ Client mis à jour:', customer.email);
          }
        },
        error: (error: any) => {
          console.error('❌ Erreur mise à jour client:', error);
        }
      });
  }

  // ==================== MÉTHODES DE SUPPRESSION ====================

  confirmDelete(type: string, item: any): void {
    console.log('🗑️ Confirmation suppression:', type, item?.id || item);
    
    if (!item) {
      console.error('❌ Aucun élément à supprimer');
      return;
    }

    this.itemToDelete = item;
    this.deleteType = type;
    
    if (type === 'product') {
      this.checkIfProductCanBeDeleted(item.id);
    } else {
      this.modals.confirmDelete = true;
    }
  }

  private checkIfProductCanBeDeleted(productId: number): void {
    this.loading.action = true;
    this.adminService.canDeleteProduct(productId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<any>) => {
        this.loading.action = false;
        if (response.success && response.canDelete !== false) {
          this.canDeleteItem = true;
          this.modals.confirmDelete = true;
        } else {
          this.canDeleteItem = false;
          this.modals.deleteConfirmation = true;
          this.showAlert(response.message || 'Ce produit ne peut pas être supprimé car il est associé à des commandes', 'warning');
        }
      },
      error: (error) => {
        console.error('❌ Erreur vérification suppression produit:', error);
        this.loading.action = false;
        this.canDeleteItem = true;
        this.modals.confirmDelete = true;
      }
    });
  }

  deleteItem() {
    if (!this.itemToDelete) {
      console.error('❌ Aucun élément à supprimer');
      return;
    }
    
    console.log('🗑️ Suppression effective:', this.deleteType, this.itemToDelete.id);
    this.loading.action = true;
    let observable: Observable<ApiResponse<any>>;

    switch (this.deleteType) {
      case 'product':
        observable = this.adminService.deleteProduct(this.itemToDelete.id);
        break;
      case 'category':
        observable = this.adminService.deleteCategory(this.itemToDelete.id);
        break;
      case 'coupon':
        observable = this.adminService.deleteCoupon(this.itemToDelete.id);
        break;
      case 'message':
        observable = this.adminService.deleteMessage(this.itemToDelete.id);
        break;
      case 'customer':
        observable = this.adminService.deleteCustomer(this.itemToDelete.id);
        break;
      default:
        console.error('❌ Type de suppression inconnu:', this.deleteType);
        this.loading.action = false;
        return;
    }

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<any>) => {
        this.loading.action = false;
        
        if (response.success) {
          this.showAlert('Élément supprimé avec succès', 'success');
          
          this.modals.confirmDelete = false;
          this.itemToDelete = null;
          this.deleteType = '';
          
          this.loadSectionData(this.activeSection);
          
          if (this.deleteType === 'product') {
            this.autoSyncProducts();
            this.autoSyncHuilesEssentielles();
            this.autoSyncHuileOlive();
          }
          if (this.deleteType === 'coupon') {
            this.syncCouponsToPages();
          }
        } else {
          this.showAlert(response.message || 'Erreur lors de la suppression', 'error');
        }
      },
      error: (error: any) => {
        this.loading.action = false;
        console.error('❌ Erreur suppression:', error);
        
        if (error.status === 400) {
          if (error.error && error.error.message) {
            this.showAlert(`Erreur 400: ${error.error.message}`, 'error');
          } else {
            this.showAlert('Erreur 400: Le serveur a rejeté la requête. Vérifiez que l\'élément peut être supprimé.', 'error');
          }
        } else {
          this.showAlert('Erreur lors de la suppression', 'error');
        }
      }
    });
  }

  // ==================== MÉTHODES POUR LA SYNCHRONISATION MANUELLE ====================

  syncAllToSavonPage(): void {
    console.log('🔄 Synchronisation manuelle vers la page SAVON...');
    this.loading.action = true;

    this.adminService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        if (response.success && response.products) {
          const savonProducts = response.products.filter(product => 
            this.isSavonProduct(product)
          );
          
          localStorage.setItem('savonProducts', JSON.stringify(savonProducts));
          window.dispatchEvent(new Event('savonProductsUpdated'));
          
          this.showAlert(`${savonProducts.length} produits SAVON synchronisés vers la page savon`, 'success');
        } else {
          this.showAlert('Erreur lors de la synchronisation SAVON', 'error');
        }
        this.loading.action = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur synchronisation SAVON:', error);
        this.showAlert('Erreur lors de la synchronisation SAVON', 'error');
        this.loading.action = false;
      }
    });
  }

  syncAllToHuilesEssentiellesPage(): void {
    console.log('🔄 Synchronisation manuelle vers la page HUILES ESSENTIELLES...');
    this.loading.action = true;

    this.adminService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        if (response.success && response.products) {
          const huilesProducts = response.products.filter(product => 
            this.isHuilesEssentiellesProduct(product)
          );
          
          localStorage.setItem('huilesEssentiellesProducts', JSON.stringify(huilesProducts));
          window.dispatchEvent(new Event('huilesEssentiellesProductsUpdated'));
          
          this.showAlert(`${huilesProducts.length} produits HUILES ESSENTIELLES synchronisés`, 'success');
        } else {
          this.showAlert('Erreur lors de la synchronisation HUILES ESSENTIELLES', 'error');
        }
        this.loading.action = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur synchronisation HUILES ESSENTIELLES:', error);
        this.showAlert('Erreur lors de la synchronisation HUILES ESSENTIELLES', 'error');
        this.loading.action = false;
      }
    });
  }

  syncAllProductsToPages(): void {
    console.log('🔄 Synchronisation manuelle de TOUS les produits vers les pages...');
    this.loading.action = true;

    this.adminService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        if (response.success && response.products) {
          const allProducts = response.products;
          
          const savonProducts = allProducts.filter(product => 
            this.isSavonProduct(product)
          );
          
          const huilesProducts = allProducts.filter(product => 
            this.isHuilesEssentiellesProduct(product)
          );
          
          const huileOliveProducts = allProducts.filter(product => 
            this.isHuileOliveProduct(product)
          );
          
          console.log('📊 Produits filtrés:', {
            total: allProducts.length,
            savon: savonProducts.length,
            huilesEssentielles: huilesProducts.length,
            huileOlive: huileOliveProducts.length
          });
          
          this.adminService.saveSavonProducts(savonProducts).subscribe({
            next: (savonResponse) => {
              if (savonResponse.success) {
                console.log(`✅ ${savonProducts.length} produits savon sauvegardés`);
                window.dispatchEvent(new Event('savonProductsUpdated'));
              }
            },
            error: (savonError) => {
              console.error('❌ Erreur sauvegarde produits savon:', savonError);
            }
          });
          
          this.adminService.saveHuilesEssentiellesProducts(huilesProducts).subscribe({
            next: (huilesResponse) => {
              if (huilesResponse.success) {
                console.log(`✅ ${huilesProducts.length} produits huiles essentielles sauvegardés`);
                window.dispatchEvent(new Event('huilesEssentiellesProductsUpdated'));
              }
            },
            error: (huilesError) => {
              console.error('❌ Erreur sauvegarde produits huiles essentielles:', huilesError);
            }
          });
          
          this.adminService.saveHuileOliveProducts(huileOliveProducts).subscribe({
            next: (huileOliveResponse) => {
              if (huileOliveResponse.success) {
                console.log(`✅ ${huileOliveProducts.length} produits huile d'olive sauvegardés`);
                window.dispatchEvent(new Event('huileOliveProductsUpdated'));
              }
            },
            error: (huileOliveError) => {
              console.error('❌ Erreur sauvegarde produits huile d\'olive:', huileOliveError);
            },
            complete: () => {
              this.showAlert(
                `Synchronisation terminée: ${savonProducts.length} produits savon, ${huilesProducts.length} produits huiles essentielles et ${huileOliveProducts.length} produits huile d'olive`,
                'success'
              );
              this.loading.action = false;
            }
          });
          
        } else {
          this.showAlert('Erreur lors de la récupération des produits', 'error');
          this.loading.action = false;
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur synchronisation produits:', error);
        this.showAlert('Erreur lors de la synchronisation', 'error');
        this.loading.action = false;
      }
    });
  }

  loadSavonProducts(): void {
    console.log('🧼 Chargement des produits savon...');
    this.loading.products = true;
    this.adminService.getSavonProductsOnly().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        if (response.success && response.products) {
          this.products = response.products;
          console.log(`✅ ${this.products.length} produits savon chargés`);
        } else {
          console.error('❌ Erreur produits savon:', response.message);
        }
        this.loading.products = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur API produits savon:', error);
        this.loading.products = false;
      }
    });
  }

  loadHuilesEssentiellesProducts(): void {
    console.log('🌿 Chargement des produits huiles essentielles...');
    this.loading.products = true;
    this.adminService.getHuilesEssentiellesProductsOnly().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        if (response.success && response.products) {
          this.products = response.products;
          console.log(`✅ ${this.products.length} produits huiles essentielles chargés`);
        } else {
          console.error('❌ Erreur produits huiles essentielles:', response.message);
        }
        this.loading.products = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur API produits huiles essentielles:', error);
        this.loading.products = false;
      }
    });
  }

  // ==================== MÉTHODES POUR LES COUPONS ====================

 

  loadApplicableProducts(): void {
    this.loading.action = true;
    console.log('📦 Chargement des produits pour coupons...');
    
    this.adminService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<Product[]>) => {
        if (response.success && response.products) {
          this.availableApplicableProducts = response.products;
          this.filteredApplicableProducts = [...this.availableApplicableProducts];
          
          let applicableProducts = [];
          
          if (this.selectedCoupon) {
            applicableProducts = [...this.selectedCouponProducts];
          } else {
            applicableProducts = this.couponForm.get('applicableProducts')?.value || [];
          }
          
          this.selectedCouponProducts = applicableProducts
            .filter((id: any) => 
              id !== undefined && 
              id !== null && 
              !isNaN(id) && 
              Number(id) > 0
            )
            .map((id: any) => Number(id));
          
          this.couponForm.patchValue({
            applicableProducts: [...this.selectedCouponProducts]
          }, { emitEvent: false });
          
          console.log(`✅ ${this.availableApplicableProducts.length} produits chargés pour les coupons`);
          console.log(`📋 ${this.selectedCouponProducts.length} produits sélectionnés:`, this.selectedCouponProducts);
          
        } else {
          console.error('❌ Erreur chargement produits pour coupons:', response.message);
          this.showAlert('Erreur lors du chargement des produits', 'error');
        }
        this.loading.action = false;
      },
      error: (error: any) => {
        console.error('❌ Erreur API produits pour coupons:', error);
        this.showAlert('Erreur lors du chargement des produits', 'error');
        this.loading.action = false;
      }
    });
  }

 

  generateCouponCode(): void {
    const prefix = 'PROMO';
    this.adminService.generateCouponCode(prefix)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<string>) => {
          if (response.success && response.data) {
            this.couponForm.patchValue({ code: response.data });
            this.showAlert('Code coupon généré avec succès', 'success');
          }
        },
        error: (error) => {
          console.error('❌ Erreur génération code coupon:', error);
        }
      });
  }

  toggleCouponStatus(coupon: Coupon): void {
    const newStatus = !coupon.isActive;
    console.log('🎫 Changement statut coupon:', coupon.id, coupon.code, newStatus);
    
    coupon.isActive = newStatus;
    
    this.adminService.updateCoupon(coupon.id, { isActive: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<Coupon>) => {
          if (response.success) {
            this.showAlert(`Coupon "${coupon.code}" ${newStatus ? 'activé' : 'désactivé'}`, 'success');
            this.syncCouponsToPages();
          } else {
            this.showAlert('Erreur lors du changement de statut', 'error');
            coupon.isActive = !newStatus;
          }
        },
        error: (error) => {
          console.error('❌ Erreur changement statut coupon:', error);
          coupon.isActive = !newStatus;
          this.showAlert('Erreur lors du changement de statut', 'error');
        }
      });
  }

  showCouponStats(coupon: Coupon) {
    this.adminService.getCouponStatistics(coupon.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: ApiResponse<any>) => {
        if (response.success && response.stats) {
          const stats = response.stats;
          
          let message = `📊 **Statistiques coupon ${coupon.code}**\n\n`;
          message += `Utilisations: ${stats.usedCount}${stats.maxUses ? `/${stats.maxUses}` : ''}\n`;
          if (stats.usageRate) {
            message += `Taux d'utilisation: ${stats.usageRate.toFixed(1)}%\n\n`;
          }
          message += `Statut: ${stats.isActive ? 'Actif' : 'Inactif'}\n`;
          message += `Expire dans: ${stats.daysUntilExpiry} jours`;
          
          this.showAlert(message, 'info');
        } else {
          this.showAlert('Erreur lors du chargement des statistiques', 'error');
        }
      },
      error: (error: any) => {
        console.error('❌ Erreur statistiques coupon:', error);
        this.showAlert('Erreur lors du chargement des statistiques', 'error');
      }
    });
  }

  duplicateCoupon(coupon: Coupon) {
    const newCoupon = {
      ...coupon,
      id: 0,
      code: `${coupon.code}_COPY${Math.floor(Math.random() * 1000)}`,
      usedCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.openCouponModal(newCoupon);
    this.showAlert('Coupon dupliqué - Modifiez le code et sauvegardez', 'info');
  }

  previewCoupon(): void {
    if (!this.couponForm.valid) {
      this.showAlert('Veuillez corriger les erreurs du formulaire', 'warning');
      return;
    }
    
    const couponData = this.couponForm.value;
    const errors = this.validateCouponData();
    
    if (errors.length > 0) {
      errors.forEach(error => this.showAlert(error, 'warning'));
      return;
    }
    
    this.couponPreviewData = {
      code: couponData.code,
      description: couponData.description || 'Sans description',
      discountType: couponData.discountType,
      discountValue: couponData.discountValue,
      discountLabel: this.getDiscountLabel(couponData),
      expiryDate: couponData.expiryDate,
      startDate: couponData.startDate,
      minOrderAmount: couponData.minOrderAmount,
      freeShipping: couponData.freeShipping,
      maxUses: couponData.maxUses,
      applicableProductsCount: couponData.applicableProducts?.length || 0
    };
    
    this.modals.couponPreview = true;
  }

  validateCouponData(): string[] {
    const errors: string[] = [];
    const formValue = this.couponForm.value;
    
    if (!formValue.code || formValue.code.trim().length < 3) {
      errors.push('Le code coupon doit contenir au moins 3 caractères');
    }
    
    if (!formValue.discountValue || formValue.discountValue <= 0) {
      errors.push('La valeur de réduction doit être positive');
    }
    
    if (formValue.discountType === 'PERCENTAGE' && formValue.discountValue > 100) {
      errors.push('La réduction ne peut pas dépasser 100%');
    }
    
    if (!formValue.expiryDate) {
      errors.push('La date d\'expiration est requise');
    } else {
      const expiryDate = new Date(formValue.expiryDate);
      const today = new Date();
      
      if (expiryDate < today) {
        errors.push('La date d\'expiration ne peut pas être dans le passé');
      }
    }
    
    if (formValue.startDate && formValue.expiryDate) {
      const startDate = new Date(formValue.startDate);
      const expiryDate = new Date(formValue.expiryDate);
      
      if (startDate >= expiryDate) {
        errors.push('La date de début doit être antérieure à la date d\'expiration');
      }
    }
    
    if (formValue.maxUses && formValue.maxUses <= 0) {
      errors.push('Le nombre maximum d\'utilisations doit être positif');
    }
    
    return errors;
  }

  getDiscountLabel(couponData: any): string {
    switch (couponData.discountType) {
      case 'PERCENTAGE':
        return `${couponData.discountValue}% de réduction`;
      case 'FIXED':
        return `${this.formatCurrency(couponData.discountValue)} de réduction`;
      case 'FREE_SHIPPING':
        return 'Livraison gratuite';
      default:
        return 'Réduction spéciale';
    }
  }

  // ==================== MÉTHODES POUR L'UPLOAD D'IMAGES ====================

  validateImageUrl(): void {
    if (!this.imageUrlInput.trim()) {
      this.isUrlValid = false;
      this.urlValidationMessage = 'Veuillez entrer une URL';
      return;
    }

    console.log('🔗 Validation URL image:', this.imageUrlInput);
    
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|svg))(:\d+)?(\/.*)?$/i;
    if (!urlPattern.test(this.imageUrlInput)) {
      this.isUrlValid = false;
      this.urlValidationMessage = 'URL invalide. Doit être une image (png, jpg, jpeg, gif, webp, bmp, svg)';
      return;
    }

    this.loading.action = true;
    this.adminService.validateImageUrl(this.imageUrlInput)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ImageUrlResponse) => {
          this.loading.action = false;
          if (response.success && response.validated) {
            this.isUrlValid = true;
            this.urlValidationMessage = '✅ URL valide';
            this.imagePreview = this.imageUrlInput;
            this.showAlert('URL d\'image validée avec succès', 'success');
          } else {
            this.isUrlValid = false;
            this.urlValidationMessage = response.message || 'URL non valide';
            this.showAlert('URL d\'image non valide', 'error');
          }
        },
        error: (error: any) => {
          this.loading.action = false;
          this.isUrlValid = false;
          this.urlValidationMessage = 'Erreur de validation';
          console.error('❌ Erreur validation URL:', error);
        }
      });
  }

  validateCategoryImageUrl(): void {
    if (!this.categoryImageUrlInput.trim()) {
      this.isCategoryUrlValid = false;
      this.categoryUrlValidationMessage = 'Veuillez entrer une URL';
      return;
    }

    console.log('🔗 Validation URL image catégorie:', this.categoryImageUrlInput);
    
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp|svg))(:\d+)?(\/.*)?$/i;
    if (!urlPattern.test(this.categoryImageUrlInput)) {
      this.isCategoryUrlValid = false;
      this.categoryUrlValidationMessage = 'URL invalide. Doit être une image (png, jpg, jpeg, gif, webp, bmp, svg)';
      return;
    }

    this.loading.action = true;
    this.adminService.validateImageUrl(this.categoryImageUrlInput)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ImageUrlResponse) => {
          this.loading.action = false;
          if (response.success && response.validated) {
            this.isCategoryUrlValid = true;
            this.categoryUrlValidationMessage = '✅ URL valide';
            this.categoryImagePreview = this.categoryImageUrlInput;
            this.showAlert('URL d\'image de catégorie validée avec succès', 'success');
          } else {
            this.isCategoryUrlValid = false;
            this.categoryUrlValidationMessage = response.message || 'URL non valide';
            this.showAlert('URL d\'image de catégorie non valide', 'error');
          }
        },
        error: (error: any) => {
          this.loading.action = false;
          this.isCategoryUrlValid = false;
          this.categoryUrlValidationMessage = 'Erreur de validation';
          console.error('❌ Erreur validation URL catégorie:', error);
        }
      });
  }

  useImageUrl(): void {
    if (this.isUrlValid && this.imageUrlInput) {
      this.productForm.patchValue({ imageUrl: this.imageUrlInput });
      this.showAlert('URL d\'image appliquée avec succès', 'success');
      console.log('✅ URL image appliquée:', this.imageUrlInput);
    } else {
      this.showAlert('Veuillez valider l\'URL d\'image d\'abord', 'warning');
    }
  }

  useCategoryImageUrl(): void {
    if (this.isCategoryUrlValid && this.categoryImageUrlInput) {
      this.categoryForm.patchValue({ imageUrl: this.categoryImageUrlInput });
      this.showAlert('URL d\'image de catégorie appliquée avec succès', 'success');
      console.log('✅ URL image catégorie appliquée:', this.categoryImageUrlInput);
    } else {
      this.showAlert('Veuillez valider l\'URL d\'image de catégorie d\'abord', 'warning');
    }
  }

  resetImageUrl(): void {
    this.imageUrlInput = '';
    this.isUrlValid = false;
    this.urlValidationMessage = '';
    this.imagePreview = null;
    this.productForm.patchValue({ imageUrl: '' });
    this.showAlert('URL d\'image réinitialisée', 'info');
  }

  resetCategoryImageUrl(): void {
    this.categoryImageUrlInput = '';
    this.isCategoryUrlValid = false;
    this.categoryUrlValidationMessage = '';
    this.categoryImagePreview = null;
    this.categoryForm.patchValue({ imageUrl: '' });
    this.showAlert('URL d\'image de catégorie réinitialisée', 'info');
  }

  onImageSelected(event: any): void {
    console.log('📸 Événement de sélection de fichier déclenché:', event);
    
    this.resetImageUrl();
    
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      console.log('📸 Fichier sélectionné:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      if (file.size > 5 * 1024 * 1024) {
        this.showAlert('L\'image est trop volumineuse (max 5MB)', 'error');
        this.resetImageSelection();
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.showAlert('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WEBP.', 'error');
        this.resetImageSelection();
        return;
      }
      
      this.selectedImageFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        console.log('✅ Aperçu image créé avec succès');
      };
      reader.onerror = (error) => {
        console.error('❌ Erreur lecture fichier:', error);
        this.showAlert('Erreur lors de la lecture du fichier', 'error');
        this.resetImageSelection();
      };
      reader.readAsDataURL(file);
      
      this.showAlert(`Image "${file.name}" sélectionnée avec succès`, 'success');
    } else {
      console.warn('⚠️ Aucun fichier sélectionné dans l\'événement');
      this.resetImageSelection();
    }
  }

  onCategoryImageSelected(event: any): void {
    console.log('📸 Événement de sélection de fichier catégorie déclenché:', event);
    
    this.resetCategoryImageUrl();
    
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      console.log('📸 Fichier catégorie sélectionné:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      if (file.size > 5 * 1024 * 1024) {
        this.showAlert('L\'image est trop volumineuse (max 5MB)', 'error');
        this.resetCategoryImageSelection();
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.showAlert('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WEBP.', 'error');
        this.resetCategoryImageSelection();
        return;
      }
      
      this.selectedCategoryImageFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.categoryImagePreview = e.target.result;
        console.log('✅ Aperçu image catégorie créé avec succès');
      };
      reader.onerror = (error) => {
        console.error('❌ Erreur lecture fichier catégorie:', error);
        this.showAlert('Erreur lors de la lecture du fichier', 'error');
        this.resetCategoryImageSelection();
      };
      reader.readAsDataURL(file);
      
      this.showAlert(`Image de catégorie "${file.name}" sélectionnée avec succès`, 'success');
    } else {
      console.warn('⚠️ Aucun fichier catégorie sélectionné dans l\'événement');
      this.resetCategoryImageSelection();
    }
  }

  uploadProductImageWithCallback(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.selectedImageFile) {
        resolve(null);
        return;
      }

      this.isUploading = true;
      this.uploadProgress = 0;

      this.adminService.uploadProductImage(this.selectedImageFile)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ImageUploadResponse) => {
            this.isUploading = false;
            this.uploadProgress = 100;
            
            if (response.success) {
              console.log('✅ Image uploadée avec succès:', response.imageUrl);
              resolve(response.imageUrl);
            } else {
              console.error('❌ Erreur upload image:', response.message);
              resolve(null);
            }
          },
          error: (error: any) => {
            this.isUploading = false;
            this.uploadProgress = 0;
            console.error('❌ Erreur upload image:', error);
            resolve(null);
          }
        });
    });
  }

  uploadCategoryImageWithCallback(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.selectedCategoryImageFile) {
        resolve(null);
        return;
      }

      this.isUploading = true;
      this.uploadProgress = 0;

      this.adminService.uploadCategoryImage(this.selectedCategoryImageFile)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: ImageUploadResponse) => {
            this.isUploading = false;
            this.uploadProgress = 100;
            
            if (response.success) {
              console.log('✅ Image catégorie uploadée avec succès:', response.imageUrl);
              resolve(response.imageUrl);
            } else {
              console.error('❌ Erreur upload image catégorie:', response.message);
              resolve(null);
            }
          },
          error: (error: any) => {
            this.isUploading = false;
            this.uploadProgress = 0;
            console.error('❌ Erreur upload image catégorie:', error);
            resolve(null);
          }
        });
    });
  }

  resetImageSelection(): void {
    this.imagePreview = null;
    this.selectedImageFile = null;
    if (this.productImageInput) {
      this.productImageInput.nativeElement.value = '';
    }
  }

  resetCategoryImageSelection(): void {
    this.categoryImagePreview = null;
    this.selectedCategoryImageFile = null;
    if (this.categoryImageInput) {
      this.categoryImageInput.nativeElement.value = '';
    }
  }

  // ==================== GESTION DES ACTIONS ====================

  handleButtonClick(action: string, data?: any, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log(`🔘 Action: ${action}`, data);

    switch (action) {
      case 'refresh':
        this.refreshData();
        break;
      case 'refreshDashboard':
        this.refreshDashboardWithAdvancedStats();
        break;
      case 'logout':
        this.logout();
        break;
      case 'openProductModal':
        this.openProductModal(data);
        break;
      case 'openCategoryModal':
        this.openCategoryModal(data);
        break;
      case 'openCouponModal':
        this.openCouponModal(data);
        break;
      case 'openMessageDetail':
        this.openMessageDetail(data);
        break;
      case 'openOrderDetail':
        this.openOrderDetail(data);
        break;
      case 'confirmDelete':
        this.confirmDelete(data.type, data.item);
        break;
      case 'saveCoupon':
        this.saveCoupon();
        break;
      case 'generateCouponCode':
        this.generateCouponCode();
        break;
      case 'syncCouponsToPages':
        this.syncCouponsToPages();
        break;
      case 'selectAllApplicableProducts':
        this.selectAllApplicableProducts();
        break;
      case 'deselectAllApplicableProducts':
        this.deselectAllApplicableProducts();
        break;
      case 'syncToHuileOlive':
        this.syncAllToHuileOlivePage();
        break;
      case 'login':
        this.login();
        break;
      case 'openStockAdjustment':
        this.openStockAdjustmentModal(data);
        break;
      case 'openStockThreshold':
        this.openStockThresholdModal(data);
        break;
      case 'openBulkStockUpdate':
        this.openBulkStockUpdateModal();
        break;
      case 'viewInventoryReport':
        this.viewInventoryReport();
        break;
      case 'exportToExcel':
        this.exportToExcel(data);
        break;
      default:
        console.warn('Action non gérée:', action);
    }
  }

  refreshData() {
    console.log('🔄 Actualisation des données...');
    this.loadSectionData(this.activeSection);
  }

  refreshDashboardWithAdvancedStats(): void {
    this.loadDashboard();
    setTimeout(() => {
      this.loadDetailedStats();
      this.calculatePerformanceMetrics();
      this.updateChartsWithAdvancedData();
    }, 1000);
  }

  updateChartsWithAdvancedData(): void {
    this.initCharts();
  }

  // ==================== STATISTIQUES DÉTAILLÉES ====================

  loadDetailedStats(): void {
    console.log('📊 Chargement des statistiques détaillées...');
    this.loadDailyStats();
    this.loadCategoryStats();
    this.loadCustomerAnalytics();
    this.loadProductAnalytics();
  }

  loadDailyStats(): void {
    const today = new Date();
    const todayOrders = this.orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.toDateString() === today.toDateString();
    });

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayOrders = this.orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate.toDateString() === yesterday.toDateString();
    });

    this.dashboardStats.revenueToday = todayOrders.reduce((total, order) => total + order.totalAmount, 0);
    this.dashboardStats.ordersToday = todayOrders.length;
    
    const yesterdayRevenue = yesterdayOrders.reduce((total, order) => total + order.totalAmount, 0);
    this.dashboardStats.salesGrowth = yesterdayRevenue > 0 ? 
      ((this.dashboardStats.revenueToday - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
  }

  loadCategoryStats(): void {
    const categorySales: any = {};
    const categoryOrders: any = {};

    this.orders.forEach(order => {
      if (order.orderItems) {
        order.orderItems.forEach(item => {
          const product = this.products.find(p => p.name === item.productName);
          if (product && product.category) {
            if (!categorySales[product.category]) {
              categorySales[product.category] = 0;
              categoryOrders[product.category] = 0;
            }
            categorySales[product.category] += item.price * item.quantity;
            categoryOrders[product.category]++;
          }
        });
      }
    });

    const totalRevenue = this.dashboardStats.totalRevenue || 1;

    this.dashboardStats.salesByCategory = Object.entries(categorySales)
      .map(([category, revenue]) => ({
        category,
        revenue,
        orders: categoryOrders[category],
        percentage: ((revenue as number) / totalRevenue) * 100
      }))
      .sort((a: any, b: any) => b.revenue - a.revenue);

    this.dashboardStats.topCategories = this.dashboardStats.salesByCategory.slice(0, 5);
  }

  loadCustomerAnalytics(): void {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const activeCustomers = this.customers.filter(customer => {
      if (!customer.lastOrderDate) return false;
      const lastOrder = new Date(customer.lastOrderDate);
      return lastOrder >= sixMonthsAgo;
    });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newCustomers = this.customers.filter(customer => {
      if (!customer.firstOrderDate) return false;
      const orderDate = new Date(customer.firstOrderDate);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    });

    const repeatCustomers = this.customers.filter(customer => 
      customer.ordersCount! > 1
    );

    this.dashboardStats.repeatCustomerRate = this.customers.length > 0 ?
      (repeatCustomers.length / this.customers.length) * 100 : 0;

    this.dashboardStats.customerGrowth = newCustomers.length;
    this.dashboardStats.customerLifetimeValue = this.customers.length > 0 ?
      this.dashboardStats.totalRevenue / this.customers.length : 0;
  }

  loadProductAnalytics(): void {
    const productSales: any = {};
    
    this.orders.forEach(order => {
      if (order.orderItems) {
        order.orderItems.forEach(item => {
          if (!productSales[item.productName]) {
            productSales[item.productName] = {
              quantity: 0,
              revenue: 0,
              product: this.products.find(p => p.name === item.productName)
            };
          }
          productSales[item.productName].quantity += item.quantity;
          productSales[item.productName].revenue += item.price * item.quantity;
        });
      }
    });

    this.dashboardStats.bestSellingProducts = Object.entries(productSales)
      .map(([name, data]: [string, any]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        product: data.product
      }))
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10);

    this.dashboardStats.worstSellingProducts = Object.entries(productSales)
      .map(([name, data]: [string, any]) => ({
        name,
        quantity: data.quantity,
        revenue: data.revenue,
        product: data.product
      }))
      .sort((a: any, b: any) => a.quantity - b.quantity)
      .slice(0, 10);

    this.dashboardStats.inventoryValue = this.products.reduce((total, product) => 
      total + (product.price * product.stockQuantity), 0
    );
  }

  calculatePerformanceMetrics(): void {
    const estimatedVisits = this.dashboardStats.totalOrders * 10;
    this.dashboardStats.conversionRate = estimatedVisits > 0 ?
      (this.dashboardStats.totalOrders / estimatedVisits) * 100 : 0;

    const totalItems = this.orders.reduce((total, order) => 
      total + (order.orderItems ? order.orderItems.length : 0), 0
    );
    this.dashboardStats.averageItemsPerOrder = this.dashboardStats.totalOrders > 0 ?
      totalItems / this.dashboardStats.totalOrders : 0;

    this.dashboardStats.returnRate = this.dashboardStats.totalOrders > 0 ?
      (this.dashboardStats.cancelledOrders / this.dashboardStats.totalOrders) * 100 : 0;
  }

  // ==================== UTILITAIRES DIVERS ====================

  

  getProductById(productId: number): Product | undefined {
    return this.products.find(p => p.id === productId);
  }

  getProductsByCategory(categoryName: string): Product[] {
    return this.products.filter(product => product.category === categoryName);
  }

  formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  isDatePast(dateString: string): boolean {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  }

  getDaysDifference(dateString: string): number {
    if (!dateString) return 0;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getOrderItemsCount(order: CustomerOrder): number {
    return order.orderItems ? order.orderItems.length : 0;
  }

  getTrendIndicator(current: number, previous: number): string {
    if (current > previous) return '↗️';
    if (current < previous) return '↘️';
    return '→';
  }

  getTrendClass(current: number, previous: number): string {
    if (current > previous) return 'trend-up';
    if (current < previous) return 'trend-down';
    return 'trend-neutral';
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getPageNumbers(section: string): number[] {
    const totalPages = this.totalPages[section];
    const currentPage = this.currentPage[section];
    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  }

  get activeCustomersCount(): number {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return this.customers.filter(customer => {
      if (!customer.lastOrderDate) return false;
      const lastOrder = new Date(customer.lastOrderDate);
      return lastOrder >= sixMonthsAgo;
    }).length;
  }

  get newCustomersThisMonthCount(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return this.customers.filter(customer => {
      if (!customer.firstOrderDate) return false;
      const orderDate = new Date(customer.firstOrderDate);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    }).length;
  }

  get activeCategoriesCount(): number {
    if (!this.categories || this.categories.length === 0) return 0;
    return this.categories.filter(category => category.isActive).length;
  }

  get activeCouponsCount(): number {
    if (!this.coupons || this.coupons.length === 0) return 0;
    return this.coupons.filter(coupon => coupon.isActive).length;
  }

  getProductsCountByCategory(categoryName: string): number {
    return this.products.filter(product => product.category === categoryName).length;
  }

  getCustomerSegmentClass(customer: Customer): string {
    const segment = this.getCustomerSegment(customer);
    switch (segment) {
      case 'VIP': return 'bg-primary';
      case 'Fidèle': return 'bg-success';
      case 'Régulier': return 'bg-info';
      case 'Nouveau': return 'bg-warning';
      case 'Inactif': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getPriorityBadge(priority: string): string {
    const classes: any = {
      'URGENT': 'badge-danger',
      'HIGH': 'badge-warning',
      'MEDIUM': 'badge-info',
      'LOW': 'badge-secondary'
    };
    return classes[priority] || 'badge-secondary';
  }

  getPriorityText(priority: string): string {
    const texts: any = {
      'URGENT': 'Urgent',
      'HIGH': 'Élevée',
      'MEDIUM': 'Moyenne',
      'LOW': 'Basse'
    };
    return texts[priority] || priority;
  }

  getStockStatus(stockQuantity: number): string {
    if (stockQuantity === 0) {
      return 'stock-out';
    } else if (stockQuantity < 10) {
      return 'stock-low';
    } else if (stockQuantity < 25) {
      return 'stock-medium';
    } else {
      return 'stock-high';
    }
  }

  getRepliedMessagesCount(): number {
    return this.messages.filter(m => m.isReplied).length;
  }

  getExpiredCouponsCount(): number {
    return this.coupons.filter(c => this.isCouponExpired(c)).length;
  }

  getInactiveCouponsCount(): number {
    return this.coupons.filter(c => !c.isActive).length;
  }

  get filteredMessages(): Message[] {
    let filtered = this.messages;
    
    if (this.messageFilter === 'unread') {
      filtered = filtered.filter(m => !m.isRead);
    } else if (this.messageFilter === 'urgent') {
      filtered = filtered.filter(m => m.priority === 'URGENT');
    } else if (this.messageFilter === 'replied') {
      filtered = filtered.filter(m => m.isReplied);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.subject.toLowerCase().includes(term) ||
        m.message.toLowerCase().includes(term)
      );
    }

    return this.paginateArray(filtered, this.currentPage.messages, this.itemsPerPage);
  }

  get filteredOrders(): CustomerOrder[] {
    let filtered = this.orders;
    
    if (this.orderFilter !== 'all') {
      filtered = filtered.filter(o => o.status === this.orderFilter);
    }

    if (this.dateRange.start && this.dateRange.end) {
      const startDate = new Date(this.dateRange.start);
      const endDate = new Date(this.dateRange.end);
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.orderNumber.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(term))
      );
    }

    return this.paginateArray(filtered, this.currentPage.orders, this.itemsPerPage);
  }

  get filteredCategories(): Category[] {
    let filtered = this.categories;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term))
      );
    }

    return this.paginateArray(filtered, this.currentPage.categories, this.itemsPerPage);
  }

  get filteredMessagesForRender(): Message[] {
    return this.filteredMessages;
  }

  get filteredOrdersForRender(): CustomerOrder[] {
    return this.filteredOrders;
  }

  get filteredProductsForRender(): Product[] {
    return this.filteredProducts;
  }

  get filteredCustomersForRender(): Customer[] {
    return this.filteredCustomers;
  }

  get filteredCategoriesForRender(): Category[] {
    return this.filteredCategories;
  }

  get filteredCouponsForRender(): Coupon[] {
    return this.filteredCoupons;
  }

  getCategoryStats(categoryName: string): { ordersCount: number, revenue: number } {
    if (!this.orders || !this.products) {
      return { ordersCount: 0, revenue: 0 };
    }

    let ordersCount = 0;
    let revenue = 0;

    this.orders.forEach(order => {
      if (order.orderItems) {
        order.orderItems.forEach(item => {
          const product = this.products.find(p => p.id === item.productId);
          if (product && product.category === categoryName) {
            ordersCount++;
            revenue += item.total || (item.price * item.quantity);
          }
        });
      }
    });

    return { ordersCount, revenue };
  }

  safeFormatDate(dateString: string | undefined | null): string {
    if (!dateString) return '-';
    try {
      return this.formatDate(dateString);
    } catch (error) {
      return '-';
    }
  }

  safeGetArrayLength(array: any[] | undefined | null): number {
    return array?.length || 0;
  }

  safeFormatNumber(value: number | undefined | null, defaultValue: number = 0): number {
    return value !== undefined && value !== null ? value : defaultValue;
  }

  safeFormatPercentage(value: number | undefined | null): string {
    const val = this.safeFormatNumber(value);
    return `${val.toFixed(1)}%`;
  }

  getApplicableProductsCount(coupon: Coupon): number {
    return coupon.applicableProducts?.length || 0;
  }

  getCouponUsageRate(coupon: Coupon): number {
    if (!coupon.usedCount || !coupon.maxUses || coupon.maxUses === 0) return 0;
    return (coupon.usedCount / coupon.maxUses) * 100;
  }

  getCustomerGrowth(): number {
    return this.dashboardStats?.customerGrowth ?? 0;
  }

  get customerGrowthSafe(): number {
    return this.dashboardStats?.customerGrowth || 0;
  }

  onSelectAllChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    console.log('🔘 Select All changé:', isChecked);
    
    if (isChecked) {
      this.selectAllApplicableProducts();
    } else {
      this.deselectAllApplicableProducts();
    }
  }

  selectAllApplicableProducts(): void {
    console.log('✅ Sélection tous les produits');
    
    if (!this.filteredApplicableProducts || this.filteredApplicableProducts.length === 0) {
      console.warn('⚠️ Aucun produit à sélectionner');
      return;
    }
    
    const allProductIds = this.filteredApplicableProducts.map(p => p.id);
    
    allProductIds.forEach(productId => {
      if (!this.selectedCouponProducts.includes(productId)) {
        this.selectedCouponProducts.push(productId);
      }
    });
    
    this.couponForm.patchValue({
      applicableProducts: [...this.selectedCouponProducts]
    });
    
    this.updateSelectedCount();
    
    console.log(`✅ ${allProductIds.length} produits sélectionnés`);
  }

  deselectAllApplicableProducts(): void {
    console.log('❌ Désélection tous les produits');
    
    if (!this.filteredApplicableProducts || this.filteredApplicableProducts.length === 0) {
      console.warn('⚠️ Aucun produit à désélectionner');
      return;
    }
    
    const filteredProductIds = this.filteredApplicableProducts.map(p => p.id);
    
    this.selectedCouponProducts = this.selectedCouponProducts.filter(id => 
      !filteredProductIds.includes(id)
    );
    
    this.couponForm.patchValue({
      applicableProducts: [...this.selectedCouponProducts]
    });
    
    this.updateSelectedCount();
    
    console.log(`❌ ${filteredProductIds.length} produits désélectionnés`);
  }

  updateSelectedCount(): void {
    console.log('📊 Mise à jour compteur:', this.selectedCouponProducts.length);
  }

  isAllFilteredProductsSelected(): boolean {
    if (!this.filteredApplicableProducts || this.filteredApplicableProducts.length === 0) {
      return false;
    }
    
    return this.filteredApplicableProducts.every(product => 
      this.selectedCouponProducts.includes(product.id)
    );
  }

  getSelectedApplicableProductsCount(): number {
    if (!Array.isArray(this.selectedCouponProducts)) {
      return 0;
    }
    
    const validCount = this.selectedCouponProducts.filter(id => 
      id !== undefined && 
      id !== null && 
      !isNaN(Number(id)) && 
      Number(id) > 0
    ).length;
    
    return validCount;
  }

  toggleApplicableProduct(productId: number, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('🔘 Toggle produit:', productId);
    
    const numericId = Number(productId);
    if (isNaN(numericId) || numericId <= 0) {
      console.error('❌ ID produit invalide:', productId);
      return;
    }
    
    if (!Array.isArray(this.selectedCouponProducts)) {
      this.selectedCouponProducts = [];
    }
    
    const index = this.selectedCouponProducts.findIndex(id => id === numericId);
    
    if (index === -1) {
      this.selectedCouponProducts.push(numericId);
      console.log('✅ Produit ajouté:', numericId);
    } else {
      this.selectedCouponProducts.splice(index, 1);
      console.log('❌ Produit retiré:', numericId);
    }
    
    this.couponForm.patchValue({
      applicableProducts: [...this.selectedCouponProducts]
    }, { emitEvent: false });
    
    console.log('📋 Produits sélectionnés:', this.selectedCouponProducts);
  }

  filterApplicableProducts(searchTerm: string): void {
    console.log('🔍 Filtrage produits applicables:', searchTerm);
    
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredApplicableProducts = [...this.availableApplicableProducts];
    } else {
      const term = searchTerm.toLowerCase().trim();
      this.filteredApplicableProducts = this.availableApplicableProducts.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.category && product.category.toLowerCase().includes(term)) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.brand && product.brand.toLowerCase().includes(term)) ||
        (product.reference && product.reference.toLowerCase().includes(term))
      );
    }
    
    this.updateSelectAllCheckbox();
    
    console.log(`🔍 ${this.filteredApplicableProducts.length} produits filtrés`);
  }

  updateSelectAllCheckbox(): void {
    const applicableProducts = this.couponForm.get('applicableProducts')?.value || [];
    const allFilteredProductIds = this.filteredApplicableProducts.map(p => p.id);
    
    const allSelected = allFilteredProductIds.length > 0 && 
      allFilteredProductIds.every(id => applicableProducts.includes(id));
    
    this.couponProductsForm.patchValue({
      selectAll: allSelected
    }, { emitEvent: false });
  }

  isProductInApplicableList(productId: number): boolean {
    const cacheKey = `product_${productId}_${this.selectedCouponProducts?.length || 0}`;
    const cachedValue = sessionStorage.getItem(cacheKey);
    
    if (cachedValue !== null) {
      return cachedValue === 'true';
    }
    
    const numericId = Number(productId);
    
    if (!Array.isArray(this.selectedCouponProducts)) {
      sessionStorage.setItem(cacheKey, 'false');
      return false;
    }
    
    const startTime = Date.now();
    const isSelected = this.selectedCouponProducts.some(id => {
      if (Date.now() - startTime > 10) {
        return false;
      }
      return id !== undefined && id !== null && Number(id) === numericId;
    });
    
    sessionStorage.setItem(cacheKey, isSelected.toString());
    setTimeout(() => sessionStorage.removeItem(cacheKey), 1000);
    
    if (Math.random() < 0.01) {
      console.log(`🔍 Vérification produit ${productId}: ${isSelected ? 'SÉLECTIONNÉ' : 'NON SÉLECTIONNÉ'}`);
    }
    
    return isSelected;
  }

  syncCustomersFromOrders(force: boolean = false): void {
    console.log('👥 Synchronisation des clients depuis les commandes...', force ? '(FORCÉ)' : '');
    
    let synchronizedCount = 0;
    let updatedCount = 0;
    
    this.orders.forEach(order => {
      const customerEmail = order.customerEmail?.toLowerCase();
      
      if (!customerEmail) {
        console.warn('⚠️ Commande sans email:', order.orderNumber);
        return;
      }
      
      const existingCustomer = this.customers.find(c => 
        c.email.toLowerCase() === customerEmail
      );
      
      if (!existingCustomer && (force || ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status))) {
        const nameParts = order.customerName?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const newCustomer: Customer = {
          id: Date.now() + Math.random() * 1000,
          firstName: firstName,
          lastName: lastName,
          email: order.customerEmail,
          phoneNumber: order.customerPhone || '',
          address: order.deliveryAddress || '',
          ordersCount: 1,
          totalSpent: order.totalAmount,
          firstOrderDate: order.orderDate,
          lastOrderDate: order.orderDate,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.customers.push(newCustomer);
        synchronizedCount++;
        console.log(`✅ Nouveau client créé: ${newCustomer.email}`);
      } else if (existingCustomer && (force || ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status))) {
        existingCustomer.ordersCount = (existingCustomer.ordersCount || 0) + 1;
        existingCustomer.totalSpent = (existingCustomer.totalSpent || 0) + order.totalAmount;
        existingCustomer.lastOrderDate = order.orderDate;
        
        if (!existingCustomer.firstOrderDate) {
          existingCustomer.firstOrderDate = order.orderDate;
        }
        
        updatedCount++;
      }
    });
    
    if (synchronizedCount > 0 || updatedCount > 0) {
      console.log(`📊 Résumé synchronisation: ${synchronizedCount} nouveaux, ${updatedCount} mis à jour`);
      this.showAlert(`${synchronizedCount} nouveaux clients synchronisés depuis les commandes`, 'success');
    }
  }

  debugCouponAssociations(coupon: Coupon): void {
    console.log('🔍 Débug coupon associations:', coupon.code);
    console.log('📋 Produits applicables du coupon:', coupon.applicableProducts);
    
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      coupon.applicableProducts.forEach(productId => {
        const product = this.products.find(p => p.id === productId);
        if (product) {
          console.log(`📦 Produit ${productId} (${product.name}):`, {
            category: product.category,
            isSavon: this.isSavonProduct(product),
            isHuilesEssentielles: this.isHuilesEssentiellesProduct(product),
            isHuileOlive: this.isHuileOliveProduct(product)
          });
        } else {
          console.warn(`⚠️ Produit ${productId} non trouvé dans la liste des produits`);
        }
      });
    } else {
      console.log('🌍 Coupon applicable à tous les produits');
    }
  }

  checkSyncStatus(): void {
    console.log('📊 État des synchronisations:');
    
    const savonCoupons = JSON.parse(localStorage.getItem('savonCoupons') || '[]');
    const huilesCoupons = JSON.parse(localStorage.getItem('huilesEssentiellesCoupons') || '[]');
    const huileOliveCoupons = JSON.parse(localStorage.getItem('huileOliveCoupons') || '[]');
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    
    console.log('📁 Coupons en localStorage:');
    console.log('- Savon:', savonCoupons.length);
    console.log('- Huiles Essentielles:', huilesCoupons.length);
    console.log('- Huile d\'Olive:', huileOliveCoupons.length);
    console.log('- Admin:', adminCoupons.length);
    
    const savonProducts = JSON.parse(localStorage.getItem('savonProducts') || '[]');
    const huilesProducts = JSON.parse(localStorage.getItem('huilesEssentiellesProducts') || '[]');
    const huileOliveProducts = JSON.parse(localStorage.getItem('huileOliveProducts') || '[]');
    
    console.log('📦 Produits en localStorage:');
    console.log('- Savon:', savonProducts.length);
    console.log('- Huiles Essentielles:', huilesProducts.length);
    console.log('- Huile d\'Olive:', huileOliveProducts.length);
    
    console.log('🎫 Détails des coupons:');
    this.coupons.forEach(coupon => {
      console.log(`- ${coupon.code}:`, {
        active: coupon.isActive && !this.isCouponExpired(coupon),
        applicableProducts: coupon.applicableProducts?.length || 0,
        discount: coupon.discountValue + (coupon.discountType === 'PERCENTAGE' ? '%' : '€')
      });
    });
  }

  // ==================== SYNC CLIENTS DEPUIS COMMANDES CONFIRMÉES ====================

  syncCustomersFromConfirmedOrders(): void {
    console.log('👥 Synchronisation des clients depuis les commandes CONFIRMÉES...');
    
    let synchronizedCount = 0;
    let updatedCount = 0;
    
    // Filtrer uniquement les commandes confirmées
    const confirmedOrders = this.orders.filter(order => 
      order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED'
    );
    
    confirmedOrders.forEach(order => {
      const customerEmail = order.customerEmail?.toLowerCase();
      
      if (!customerEmail) {
        console.warn('⚠️ Commande sans email:', order.orderNumber);
        return;
      }
      
      const existingCustomer = this.customers.find(c => 
        c.email.toLowerCase() === customerEmail
      );
      
      if (!existingCustomer) {
        const nameParts = order.customerName?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const newCustomer: Customer = {
          id: Date.now() + Math.random() * 1000,
          firstName: firstName,
          lastName: lastName,
          email: order.customerEmail,
          phoneNumber: order.customerPhone || '',
          address: order.deliveryAddress || '',
          ordersCount: 1,
          totalSpent: order.totalAmount,
          firstOrderDate: order.orderDate,
          lastOrderDate: order.orderDate,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        this.customers.push(newCustomer);
        synchronizedCount++;
        console.log(`✅ Nouveau client créé: ${newCustomer.email}`);
      } else {
        existingCustomer.ordersCount = (existingCustomer.ordersCount || 0) + 1;
        existingCustomer.totalSpent = (existingCustomer.totalSpent || 0) + order.totalAmount;
        existingCustomer.lastOrderDate = order.orderDate;
        
        if (!existingCustomer.firstOrderDate) {
          existingCustomer.firstOrderDate = order.orderDate;
        }
        
        updatedCount++;
      }
    });
    
    if (synchronizedCount > 0 || updatedCount > 0) {
      console.log(`📊 Résumé synchronisation: ${synchronizedCount} nouveaux, ${updatedCount} mis à jour`);
      this.showAlert(`${synchronizedCount} nouveaux clients synchronisés depuis les commandes confirmées`, 'success');
    } else {
      this.showAlert('Aucun nouveau client à synchroniser', 'info');
    }
  }

calculateTurnoverRateNumber(salesCount: number, stockQuantity: number): number {
  if (stockQuantity === 0) return 0;
  return (salesCount || 0) / Math.max(stockQuantity, 1);
}
generateStockOrdersReport(): void {
  console.log('📋 Génération du rapport de commandes de stock...');
  
  const lowStockProducts = this.getLowStockProducts();
  const outOfStockProducts = this.getOutOfStockProducts();
  
  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    this.showAlert('Aucun produit nécessitant une commande de stock', 'info');
    return;
  }
  
  let reportContent = `📊 RAPPORT DE COMMANDES DE STOCK\n`;
  reportContent += `Date: ${new Date().toLocaleDateString('fr-FR')}\n`;
  reportContent += `===============================\n\n`;
  
  if (outOfStockProducts.length > 0) {
    reportContent += `🚨 PRODUITS EN RUPTURE DE STOCK (${outOfStockProducts.length}):\n`;
    outOfStockProducts.forEach(product => {
      reportContent += `• ${product.name} (${product.reference || 'N/A'})\n`;
      reportContent += `  Catégorie: ${product.category}\n`;
      reportContent += `  Stock actuel: ${product.stockQuantity}\n`;
      reportContent += `  Quantité recommandée: 50\n`;
      reportContent += `  Coût estimé: ${this.formatCurrency(product.price * 50)}\n\n`;
    });
  }
  
  if (lowStockProducts.length > 0) {
    reportContent += `⚠️ PRODUITS EN STOCK FAIBLE (${lowStockProducts.length}):\n`;
    lowStockProducts.forEach(product => {
      const recommendedQuantity = Math.max(20 - product.stockQuantity, 10);
      reportContent += `• ${product.name} (${product.reference || 'N/A'})\n`;
      reportContent += `  Catégorie: ${product.category}\n`;
      reportContent += `  Stock actuel: ${product.stockQuantity}\n`;
      reportContent += `  Quantité recommandée: ${recommendedQuantity}\n`;
      reportContent += `  Coût estimé: ${this.formatCurrency(product.price * recommendedQuantity)}\n\n`;
    });
  }
  
  // Calcul du total
  const totalCost = 
    outOfStockProducts.reduce((sum, p) => sum + (p.price * 50), 0) +
    lowStockProducts.reduce((sum, p) => {
      const recommendedQuantity = Math.max(20 - p.stockQuantity, 10);
      return sum + (p.price * recommendedQuantity);
    }, 0);
  
  reportContent += `💰 RÉSUMÉ:\n`;
  reportContent += `Total produits: ${outOfStockProducts.length + lowStockProducts.length}\n`;
  reportContent += `Coût total estimé: ${this.formatCurrency(totalCost)}\n`;
  
  console.log('📄 Contenu du rapport:', reportContent);
  
  // Générer un fichier texte
  this.generateTextFile(reportContent, `rapport_commandes_stock_${new Date().toISOString().slice(0, 10)}.txt`);
  
  this.showAlert(`Rapport généré: ${outOfStockProducts.length} ruptures, ${lowStockProducts.length} stocks faibles`, 'success');
}

private generateTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
 getUpdateFormGroup(index: number): FormGroup {
  const updatesArray = this.bulkStockForm.get('updates') as FormArray;
  return updatesArray.at(index) as FormGroup;
} 
// ==================== MÉTHODES POUR LES PRODUITS SOIN ====================



syncAllToSoinPage(): void {
  console.log('🔄 Synchronisation manuelle vers la page SOIN...');
  this.loading.action = true;

  this.adminService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
    next: (response: ApiResponse<Product[]>) => {
      if (response.success && response.products) {
        const soinProducts = response.products.filter(product => 
          this.isSoinProduct(product)
        );
        
        localStorage.setItem('soinProducts', JSON.stringify(soinProducts));
        window.dispatchEvent(new Event('soinProductsUpdated'));
        
        this.showAlert(`${soinProducts.length} produits soin synchronisés`, 'success');
      } else {
        this.showAlert('Erreur lors de la synchronisation soin', 'error');
      }
      this.loading.action = false;
    },
    error: (error: any) => {
      console.error('❌ Erreur synchronisation soin:', error);
      this.showAlert('Erreur lors de la synchronisation soin', 'error');
      this.loading.action = false;
    }
  });
}

getSoinProductsCount(): number {
  return this.products.filter(product => this.isSoinProduct(product)).length;
}

autoSyncSoin(): void {
  console.log('🔄 Synchronisation automatique soin...');
  
  const soinProducts = this.products.filter(product => 
    this.isSoinProduct(product)
  );

  if (soinProducts.length > 0) {
    localStorage.setItem('soinProducts', JSON.stringify(soinProducts));
    window.dispatchEvent(new Event('soinProductsUpdated'));
    console.log(`✅ ${soinProducts.length} produits soin synchronisés automatiquement`);
  }
}

syncSingleProductToSoin(product: any): void {
  console.log('🔄 Synchronisation produit soin:', product.name);
  
  let soinProducts: Product[] = [];
  try {
    const storedProducts = localStorage.getItem('soinProducts');
    if (storedProducts) {
      soinProducts = JSON.parse(storedProducts);
    }
  } catch (error) {
    console.error('❌ Erreur chargement produits soin:', error);
  }
  
  const existingIndex = soinProducts.findIndex(p => p.id === product.id);
  
  if (existingIndex !== -1) {
    soinProducts[existingIndex] = { ...soinProducts[existingIndex], ...product };
    console.log('✅ Produit soin mis à jour dans le stockage local');
  } else {
    soinProducts.push(product);
    console.log('✅ Nouveau produit soin ajouté au stockage local');
  }
  
  localStorage.setItem('soinProducts', JSON.stringify(soinProducts));
  window.dispatchEvent(new Event('soinProductsUpdated'));
  
  const message = existingIndex !== -1 ? 
    'Produit soin mis à jour avec succès' : 
    'Nouveau produit soin ajouté avec succès';
  
  this.showAlert(message, 'success');
}

loadSoinProducts(): void {
  console.log('🧴 Chargement des produits soin...');
  this.loading.products = true;
  this.adminService.getSoinProductsOnly().pipe(takeUntil(this.destroy$)).subscribe({
    next: (response: ApiResponse<Product[]>) => {
      if (response.success && response.products) {
        this.products = response.products;
        console.log(`✅ ${this.products.length} produits soin chargés`);
      } else {
        console.error('❌ Erreur produits soin:', response.message);
      }
      this.loading.products = false;
    },
    error: (error: any) => {
      console.error('❌ Erreur API produits soin:', error);
      this.loading.products = false;
    }
  });
}
forceSyncAfterProductSave(product: any): void {
  console.log('🔄 Synchronisation forcée après sauvegarde du produit:', product.name);
  
  if (this.isSavonProduct(product)) {
    console.log('🧼 Produit identifié comme SAVON - synchronisation...');
    this.syncSingleProductToSavon(product);
  }
  
  if (this.isHuilesEssentiellesProduct(product)) {
    console.log('🌿 Produit identifié comme HUILES ESSENTIELLES - synchronisation...');
    this.syncSingleProductToHuilesEssentielles(product);
  }
  
  if (this.isHuileOliveProduct(product)) {
    console.log('🫒 Produit identifié comme HUILE D\'OLIVE - synchronisation...');
    this.syncSingleProductToHuileOlive(product);
  }
  
  // AJOUTER CETTE PARTIE
  if (this.isSoinProduct(product)) {
    console.log('🧴 Produit identifié comme SOIN - synchronisation...');
    this.syncSingleProductToSoin(product);
  }
  
  this.autoSyncProducts();
  this.autoSyncHuilesEssentielles();
  this.autoSyncHuileOlive();
  this.autoSyncSoin(); // AJOUTER CETTE LIGNE
  
  this.updateProductCouponAssociations();
}
loadProducts() {
  console.log('🛍️ Chargement produits...');
  this.loading.products = true;
  this.adminService.getAllProducts().pipe(takeUntil(this.destroy$)).subscribe({
    next: (response: ApiResponse<Product[]>) => {
      console.log('🛍️ Products response:', response);
      if (response.success && response.products) {
        this.products = response.products;
        console.log(`✅ ${this.products.length} produits chargés`);
        
        // Mettre à jour l'affichage des réductions
        this.updateProductDiscountDisplay();
        
        // Synchroniser automatiquement après le chargement
        this.autoSyncProducts();
        this.autoSyncHuilesEssentielles();
        this.autoSyncHuileOlive();
        this.autoSyncSoin(); // AJOUTER CETTE LIGNE
      } else {
        console.error('❌ Erreur produits:', response.message);
        this.showAlert('Erreur lors du chargement des produits', 'error');
      }
      this.loading.products = false;
    },
    error: (error: any) => {
      console.error('❌ Erreur API produits:', error);
      this.showAlert('Erreur lors du chargement des produits', 'error');
      this.loading.products = false;
    }
  });
}

// ==================== MÉTHODES POUR LES PRODUITS SOIN ====================


  handleError<T>(arg0: string): (err: any, caught: Observable<ApiResponse<Product[]>>) => import("rxjs").ObservableInput<any> {
    throw new Error('Method not implemented.');
  }








// ==================== MÉTHODES POUR LES PRODUITS SOIN ====================

/**
 * Récupère UNIQUEMENT les produits de soin
 */
getSoinProductsOnly(): Observable<ApiResponse<Product[]>> {
  return this.http.get<ApiResponse<Product[]>>(`${this.apiUrl}/products`)
    .pipe(
      map(response => {
        if (response.success && response.products) {
          const soinProducts = response.products.filter(product => 
            this.isSoinProduct(product)
          );
          return {
            ...response,
            products: soinProducts
          };
        }
        return response;
      }),
      catchError(this.handleError<ApiResponse<Product[]>>('getSoinProductsOnly'))
    );
}

/**
 * Sauvegarde les produits soin dans le localStorage
 */
saveSoinProducts(products: Product[]): Observable<ApiResponse<any>> {
  return new Observable(observer => {
    try {
      localStorage.setItem('soinProducts', JSON.stringify(products));
      
      observer.next({
        success: true,
        message: `${products.length} produits soin sauvegardés avec succès`,
        data: products
      });
      observer.complete();
    } catch (error) {
      console.error('❌ Erreur sauvegarde produits soin:', error);
      observer.error(error);
    }
  });
}

/**
 * Récupère les produits soin depuis le localStorage
 */
getSoinProducts(): Observable<ApiResponse<Product[]>> {
  return new Observable(observer => {
    try {
      const products = JSON.parse(localStorage.getItem('soinProducts') || '[]');
      observer.next({
        success: true,
        products: products
      });
      observer.complete();
    } catch (error) {
      console.error('❌ Erreur récupération produits soin:', error);
      observer.error(error);
    }
  });
}

/**
 * Synchronise les produits soin depuis l'admin vers le stockage local
 */
syncAdminToSoin(): Observable<ApiResponse<any>> {
  return new Observable(observer => {
    try {
      this.getSoinProductsOnly().subscribe({
        next: (response: ApiResponse<Product[]>) => {
          if (response.success && response.products) {
            const soinProducts = response.products;
            localStorage.setItem('soinProducts', JSON.stringify(soinProducts));
            
            window.dispatchEvent(new Event('soinProductsUpdated'));
            
            observer.next({
              success: true,
              message: `${soinProducts.length} produits soin synchronisés`,
              data: soinProducts
            });
            observer.complete();
          } else {
            observer.error(new Error('Erreur lors du chargement des produits'));
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    } catch (error) {
      console.error('❌ Erreur synchronisation soin:', error);
      observer.error(error);
    }
  });
}

/**
 * Vérifie si un produit est un produit de soin
 */
isSoinProduct(product: any): boolean {
  if (!product) return false;
  
  const category = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const subCategory = (product.subCategory || '').toLowerCase();
  
  const isSoinProduct = 
    // Catégorie exacte "soin" ou contient "soin"
    category.includes('soin') ||
    category === 'care' ||
    category === 'bodycare' ||
    category === 'skincare' ||
    category === 'haircare' ||
    category === 'body' ||
    category === 'skin' ||
    category === 'hair' ||
    
    // Sous-catégorie soin
    subCategory.includes('soin') ||
    subCategory === 'care' ||
    
    // Nom contient des mots-clés soin
    name.includes('soin') ||
    name.includes('crème') ||
    name.includes('huile') ||
    name.includes('masque') ||
    name.includes('baume') ||
    name.includes('shampoing') ||
    name.includes('gommage') ||
    name.includes('exfoliant') ||
    name.includes('hydratant') ||
    name.includes('nourrissant') ||
    name.includes('lotion') ||
    name.includes('sérum') ||
    name.includes('gel') ||
    
    // Description contient des mots-clés soin
    description.includes('soin') ||
    description.includes('hydratant') ||
    description.includes('nourrissant') ||
    description.includes('peau') ||
    description.includes('corps') ||
    description.includes('cheveux') ||
    description.includes('mains') ||
    description.includes('pieds') ||
    description.includes('lèvres') ||
    description.includes('lèvre') ||
    description.includes('visage');
    
  // EXCLURE les produits qui ne sont PAS des soins
  const isExcluded = 
    category.includes('parfum') ||
    category.includes('perfume') ||
    category.includes('maquillage') ||
    category.includes('makeup') ||
    category.includes('accessoire') ||
    category.includes('accessory') ||
    category.includes('savon') ||
    category.includes('soap') ||
    category.includes('huile essentielle') ||
    category.includes('olive') ||
    category.includes('huile d\'olive') ||
    name.includes('parfum') ||
    name.includes('perfume') ||
    name.includes('maquillage') ||
    name.includes('makeup') ||
    name.includes('accessoire') ||
    description.includes('parfum') ||
    description.includes('parfumerie');
  
  const isActive = product.isActive === undefined ? true : product.isActive;
  
  return isSoinProduct && !isExcluded && isActive;
}
// ==================== DANS LE COMPOSANT ADMIN ====================

// Ajoutez ces méthodes au composant AdminComponent :

/**
 * Récupérer les commandes soin depuis le localStorage
 */
getSoinOrdersFromLocalStorage(): CustomerOrder[] {
  try {
    const soinOrders = localStorage.getItem('admin_soin_orders') || '[]';
    return JSON.parse(soinOrders);
  } catch (error) {
    console.error('❌ Erreur récupération commandes soin:', error);
    return [];
  }
}

/**
 * Récupérer toutes les commandes (toutes pages)
 */
getAllOrdersFromLocalStorage(): CustomerOrder[] {
  try {
    const allOrders = localStorage.getItem('admin_all_orders') || '[]';
    return JSON.parse(allOrders);
  } catch (error) {
    console.error('❌ Erreur récupération toutes commandes:', error);
    return [];
  }
}

/**
 * Synchroniser les commandes soin avec la liste des commandes de l'admin
 */
syncSoinOrdersToAdminOrders(): void {
  console.log('🔄 Synchronisation des commandes soin vers admin...');
  
  try {
    // Récupérer les commandes soin
    const soinOrders = this.getSoinOrdersFromLocalStorage();
    
    if (soinOrders.length === 0) {
      console.log('ℹ️ Aucune commande soin à synchroniser');
      return;
    }
    
    // Récupérer toutes les commandes existantes
    let allOrders = this.getAllOrdersFromLocalStorage();
    
    let newOrdersCount = 0;
    let updatedOrdersCount = 0;
    
    // Fusionner les commandes
    soinOrders.forEach(soinOrder => {
      const existingIndex = allOrders.findIndex((order: CustomerOrder) => 
        order.orderNumber === soinOrder.orderNumber
      );
      
      if (existingIndex === -1) {
        // Ajouter comme nouvelle commande
        allOrders.unshift({
          ...soinOrder,
          source: 'soin',
          synchronizedAt: new Date().toISOString()
        });
        newOrdersCount++;
        console.log(`✅ Nouvelle commande soin ajoutée: ${soinOrder.orderNumber}`);
      } else {
        // Mettre à jour la commande existante
        allOrders[existingIndex] = {
          ...allOrders[existingIndex],
          ...soinOrder,
          lastUpdate: new Date().toISOString()
        };
        updatedOrdersCount++;
        console.log(`✅ Commande soin mise à jour: ${soinOrder.orderNumber}`);
      }
    });
    
    // Sauvegarder dans localStorage
    localStorage.setItem('admin_all_orders', JSON.stringify(allOrders));
    
    // Mettre à jour les commandes dans l'admin
    this.orders = [...allOrders];
    
    // Mettre à jour les statistiques
    this.updateDashboardStatsWithNewOrders();
    
    // Afficher notification
    if (newOrdersCount > 0 || updatedOrdersCount > 0) {
      const message = newOrdersCount > 0 
        ? `${newOrdersCount} nouvelle(s) commande(s) soin synchronisée(s)` 
        : `${updatedOrdersCount} commande(s) soin mise(s) à jour`;
      
      this.showAlert(message, 'success');
      console.log(`📊 Synchronisation terminée: ${newOrdersCount} nouvelles, ${updatedOrdersCount} mises à jour`);
    }
    
  } catch (error) {
    console.error('❌ Erreur synchronisation commandes soin:', error);
    this.showAlert('Erreur lors de la synchronisation des commandes soin', 'error');
  }
}

/**
 * Mettre à jour les statistiques avec les nouvelles commandes
 */
updateDashboardStatsWithNewOrders(): void {
  // Compter les commandes par statut
  const pendingCount = this.orders.filter(o => o.status === 'PENDING' || o.status === 'EN ATTENTE').length;
  const confirmedCount = this.orders.filter(o => o.status === 'CONFIRMED' || o.status === 'CONFIRMÉE').length;
  const shippedCount = this.orders.filter(o => o.status === 'SHIPPED' || o.status === 'EXPÉDIÉE').length;
  const deliveredCount = this.orders.filter(o => o.status === 'DELIVERED' || o.status === 'LIVRÉE').length;
  const cancelledCount = this.orders.filter(o => o.status === 'CANCELLED' || o.status === 'ANNULÉE').length;
  
  // Calculer le revenu total
  const totalRevenue = this.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Calculer le revenu du mois en cours
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const revenueThisMonth = this.orders.reduce((sum, order) => {
    const orderDate = new Date(order.orderDate);
    if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
      return sum + (order.totalAmount || 0);
    }
    return sum;
  }, 0);
  
  // Calculer le panier moyen
  const averageOrderValue = this.orders.length > 0 
    ? totalRevenue / this.orders.length 
    : 0;
  
  // Mettre à jour les statistiques
  this.dashboardStats = {
    ...this.dashboardStats,
    totalOrders: this.orders.length,
    totalRevenue: totalRevenue,
    pendingOrders: pendingCount,
    confirmedOrders: confirmedCount,
    shippedOrders: shippedCount,
    deliveredOrders: deliveredCount,
    cancelledOrders: cancelledCount,
    revenueThisMonth: revenueThisMonth,
    averageOrderValue: averageOrderValue
  };
  
  console.log('📊 Statistiques mises à jour:', this.dashboardStats);
}

/**
 * Écouter les nouvelles commandes soin en temps réel
 */
setupSoinOrderListener(): void {
  // Écouter l'événement des nouvelles commandes soin
  window.addEventListener('newSoinOrder', (event: any) => {
    console.log('🔔 Nouvelle commande soin détectée:', event.detail);
    
    if (event.detail && event.detail.order) {
      this.processNewSoinOrder(event.detail.order);
    }
  });
  
  // Vérifier périodiquement les nouvelles commandes
  setInterval(() => {
    this.checkForNewSoinOrders();
  }, 10000); // Toutes les 10 secondes
  
  // Synchroniser au démarrage
  setTimeout(() => {
    this.syncSoinOrdersToAdminOrders();
  }, 2000);
}

/**
 * Traiter une nouvelle commande soin
 */


/**
 * Vérifier les nouvelles commandes soin
 */
checkForNewSoinOrders(): void {
  // Récupérer les commandes soin
  const soinOrders = this.getSoinOrdersFromLocalStorage();
  
  if (soinOrders.length === 0) {
    return;
  }
  
  // Récupérer les commandes admin
  const adminOrders = this.getAllOrdersFromLocalStorage();
  
  // Trouver les commandes soin qui ne sont pas encore dans l'admin
  const newOrders = soinOrders.filter(soinOrder => 
    !adminOrders.some(adminOrder => adminOrder.orderNumber === soinOrder.orderNumber)
  );
  
  if (newOrders.length > 0) {
    console.log(`📥 ${newOrders.length} nouvelle(s) commande(s) soin détectée(s)`);
    
    // Ajouter les nouvelles commandes
    newOrders.forEach(order => {
      this.processNewSoinOrder(order);
    });
  }
}

/**
 * Forcer la synchronisation des commandes soin
 */
forceSyncSoinOrders(): void {
  console.log('🔄 Synchronisation forcée des commandes soin...');
  
  // Vider le cache pour forcer une re-synchronisation complète
  localStorage.removeItem('admin_all_orders_temp');
  
  // Synchroniser
  this.syncSoinOrdersToAdminOrders();
  
  // Recharger les commandes
  this.loadOrders();
  
  this.showAlert('Synchronisation forcée des commandes soin effectuée', 'success');
}

// ==================== DANS ngOnInit() ====================



// ==================== DANS loadInitialData() ====================

loadInitialData() {
  if (!this.isLoggedIn) return;
  
  console.log('📦 Chargement des données initiales...');
  this.loadDashboard();
  
  // AJOUTER CETTE LIGNE - Synchroniser les commandes soin au démarrage
  setTimeout(() => {
    this.syncSoinOrdersToAdminOrders();
  }, 3000);
  
  setTimeout(() => {
    this.loadMessages();
    this.loadOrders();
    this.loadProducts();
    this.loadCustomers();
    this.loadCategories();
    this.loadCoupons();
    this.loadOrderItems();
    this.loadStockMovements();
    this.loadStockAlerts();
  }, 500);
}

// ==================== AJOUTER UN BOUTON DANS LE TEMPLATE HTML ====================

/**
 * Ajoutez ce bouton dans votre template admin (admin.html) :
 * 
 * <div class="admin-toolbar" *ngIf="activeSection === 'orders'">
 *   <button class="btn btn-sm btn-info" (click)="forceSyncSoinOrders()">
 *     <i class="fas fa-sync-alt"></i> Sync Commandes Soin
 *   </button>
 * </div>
 * 
 * <div class="admin-toolbar" *ngIf="activeSection === 'dashboard'">
 *   <button class="btn btn-sm btn-info" (click)="syncSoinOrdersToAdminOrders()">
 *     <i class="fas fa-heartbeat"></i> Check Commandes Soin
 *   </button>
 * </div>
 */

// ==================== AJOUTER UNE SECTION DANS LE TEMPLATE POUR AFFICHER LES COMMANDES SOIN ====================

/**
 * Dans la section orders du template, ajoutez :
 * 
 * <div class="card mb-4" *ngIf="orders && orders.length > 0">
 *   <div class="card-header d-flex justify-content-between align-items-center">
 *     <h5 class="mb-0">Commandes Soin Récentes</h5>
 *     <button class="btn btn-sm btn-info" (click)="forceSyncSoinOrders()">
 *       <i class="fas fa-sync-alt"></i> Actualiser
 *     </button>
 *   </div>
 *   <div class="card-body">
 *     <div class="table-responsive">
 *       <table class="table table-hover">
 *         <thead>
 *           <tr>
 *             <th>Numéro</th>
 *             <th>Client</th>
 *             <th>Date</th>
 *             <th>Total</th>
 *             <th>Statut</th>
 *             <th>Source</th>
 *             <th>Actions</th>
 *           </tr>
 *         </thead>
 *         <tbody>
 *           <tr *ngFor="let order of orders | filterBySource:'soin' | slice:0:5">
 *             <td>{{ order.orderNumber }}</td>
 *             <td>{{ order.customerName }}</td>
 *             <td>{{ formatDate(order.orderDate) }}</td>
 *             <td>{{ formatCurrency(order.totalAmount) }}</td>
 *             <td>
 *               <span [class]="getStatusBadgeClass(order.status)">
 *                 {{ getStatusText(order.status) }}
 *               </span>
 *             </td>
 *             <td>
 *               <span class="badge bg-info" *ngIf="order.source === 'soin'">
 *                 Soin
 *               </span>
 *             </td>
 *             <td>
 *               <button class="btn btn-sm btn-primary" 
 *                       (click)="openOrderDetail(order)">
 *                 <i class="fas fa-eye"></i>
 *               </button>
 *             </td>
 *           </tr>
 *         </tbody>
 *       </table>
 *     </div>
 *   </div>
 * </div>
 */

// ==================== AJOUTER UN FILTRE PIPE ====================

/**
 * Ajoutez ce pipe pour filtrer les commandes par source :
 * 
 * // Créez un fichier filter-by-source.pipe.ts
 * 
 * import { Pipe, PipeTransform } from '@angular/core';
 * 
 * @Pipe({
 *   name: 'filterBySource',
 *   standalone: true
 * })
 * export class FilterBySourcePipe implements PipeTransform {
 *   transform(orders: any[], source: string): any[] {
 *     if (!orders || !source) return orders;
 *     return orders.filter(order => order.source === source);
 *   }
 * }
 * 
 * // Ajoutez-le aux imports de votre composant Admin
 */

// ==================== MÉTHODES UTILITAIRES SUPPLEMENTAIRES ====================

/**
 * Obtenir le nombre de commandes soin
 */
getSoinOrdersCount(): number {
  return this.orders.filter(order => order.source === 'soin').length;
}

/**
 * Obtenir le revenu total des commandes soin
 */
getSoinOrdersRevenue(): number {
  return this.orders
    .filter(order => order.source === 'soin')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
}

/**
 * Obtenir les commandes soin récentes (5 dernières)
 */
getRecentSoinOrders(): CustomerOrder[] {
  return this.orders
    .filter(order => order.source === 'soin')
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);
}

// ==================== AJOUTER AU TABLEAU DE BORD ====================

/**
 * Dans votre dashboard, ajoutez une carte pour les commandes soin :
 * 
 * <div class="col-md-3">
 *   <div class="card card-stats">
 *     <div class="card-body">
 *       <div class="row">
 *         <div class="col-5">
 *           <div class="icon-big text-center">
 *             <i class="fas fa-heartbeat text-info"></i>
 *           </div>
 *         </div>
 *         <div class="col-7 d-flex align-items-center">
 *           <div class="numbers">
 *             <p class="card-category">Commandes Soin</p>
 *             <h4 class="card-title">{{ getSoinOrdersCount() }}</h4>
 *             <p class="mb-0">
 *               {{ formatCurrency(getSoinOrdersRevenue()) }}
 *             </p>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *     <div class="card-footer">
 *       <div class="stats">
 *         <i class="fas fa-sync-alt"></i>
 *         <a (click)="forceSyncSoinOrders()">Actualiser maintenant</a>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 */

// ==================== METTRE À JOUR loadOrders() ====================


// ==================== MÉTHODE POUR RÉCEPTION DIRECTE ====================

/**
 * Méthode pour recevoir directement une commande soin
 * (Appelée depuis la page soin via postMessage)
 */
@HostListener('window:message', ['$event'])
onMessage(event: MessageEvent) {
  console.log('📨 Message reçu:', event);
  
  // Vérifier l'origine du message (optionnel)
  // if (event.origin !== 'http://localhost:4200') return;
  
  if (event.data && event.data.type === 'NEW_SOIN_ORDER') {
    console.log('🎯 Nouvelle commande soin reçue:', event.data.order);
    
    // Traiter la commande
    this.processNewSoinOrder(event.data.order);
    
    // Répondre à l'envoyeur
    event.source?.postMessage({
      type: 'ORDER_RECEIVED',
      success: true,
      orderNumber: event.data.order.orderNumber
    }, event.origin as any);
  }
}

// ==================== GESTION DES NOTIFICATIONS ====================

/**
 * Ajouter une notification pour une nouvelle commande soin
 */
addSoinOrderNotification(order: any): void {
  try {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    
    const notification = {
      id: 'notif-' + Date.now(),
      type: 'new_soin_order',
      title: 'Nouvelle commande Soin',
      message: `Commande #${order.orderNumber} - ${order.customerFirstName} ${order.customerLastName}`,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      customer: `${order.customerFirstName} ${order.customerLastName}`,
      timestamp: new Date().toISOString(),
      read: false,
      source: 'soin',
      priority: 'high',
      actions: [
        {
          label: 'Voir',
          action: 'viewOrder',
          orderId: order.orderNumber
        },
        {
          label: 'Confirmer',
          action: 'confirmOrder',
          orderId: order.orderNumber
        }
      ]
    };
    
    notifications.unshift(notification);
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    
    console.log(`🔔 Notification commande soin créée pour ${order.orderNumber}`);
    
    // Émettre un événement pour mettre à jour l'interface
    window.dispatchEvent(new CustomEvent('adminNotificationAdded', {
      detail: notification
    }));
    
  } catch (error) {
    console.error('❌ Erreur création notification soin:', error);
  }
}

// ==================== METTRE À JOUR processNewSoinOrder ====================



/**
 * Sauvegarder aussi dans la liste spécifique des commandes soin
 */
saveToSoinOrdersList(order: any): void {
  try {
    const soinOrders = JSON.parse(localStorage.getItem('admin_soin_orders') || '[]');
    
    // Vérifier si existe déjà
    const existingIndex = soinOrders.findIndex((o: { orderNumber: any; }) => o.orderNumber === order.orderNumber);
    
    if (existingIndex === -1) {
      soinOrders.unshift(order);
      localStorage.setItem('admin_soin_orders', JSON.stringify(soinOrders));
      console.log(`✅ Commande ${order.orderNumber} ajoutée à la liste soin`);
    }
  } catch (error) {
    console.error('❌ Erreur sauvegarde liste soin:', error);
  }
}

// ==================== CORRECTION FINALE DU PROBLÈME ====================

/**
 * La solution complète pour que les commandes soin arrivent dans l'admin :
 * 
 * 1. La page soin stocke les commandes dans localStorage ('admin_soin_orders')
 * 2. L'admin écoute les événements 'newSoinOrder'
 * 3. L'admin vérifie périodiquement le localStorage
 * 4. L'admin fusionne les commandes dans sa liste principale
 * 5. Les statistiques sont mises à jour automatiquement
 * 
 * Pour tester :
 * 1. Passer une commande sur la page soin
 * 2. Ouvrir l'admin
 * 3. Vérifier la section commandes
 * 4. Vérifier les notifications
 */

// ==================== BONUS : ÉTAT DES SYNCHRONISATIONS ====================

getSyncStatus(): any {
  const soinOrders = this.getSoinOrdersFromLocalStorage();
  const allOrders = this.getAllOrdersFromLocalStorage();
  
  const synchronizedOrders = allOrders.filter(order => order.source === 'soin');
  const pendingSync = soinOrders.filter(soinOrder => 
    !allOrders.some(adminOrder => adminOrder.orderNumber === soinOrder.orderNumber)
  );
  
  return {
    totalSoinOrders: soinOrders.length,
    totalAdminOrders: allOrders.length,
    synchronizedCount: synchronizedOrders.length,
    pendingSyncCount: pendingSync.length,
    syncRate: soinOrders.length > 0 ? 
      (synchronizedOrders.length / soinOrders.length) * 100 : 0,
    lastSync: localStorage.getItem('last_sync_time') || 'Jamais'
  };
}

/**
 * Afficher l'état de la synchronisation
 */
showSyncStatus(): void {
  const status = this.getSyncStatus();
  
  let message = `📊 **État synchronisation commandes soin**\n\n`;
  message += `Commandes soin: ${status.totalSoinOrders}\n`;
  message += `Commandes admin: ${status.totalAdminOrders}\n`;
  message += `Synchronisées: ${status.synchronizedCount}\n`;
  message += `En attente: ${status.pendingSyncCount}\n`;
  message += `Taux sync: ${status.syncRate.toFixed(1)}%\n`;
  message += `Dernière sync: ${status.lastSync}`;
  
  this.showAlert(message, 'info');
}

// In the processNewSoinOrder method, check if the order exists
processNewSoinOrder(order: any): void {
  if (!order) {
    console.error('❌ Order is null or undefined');
    return;
  }
  
  // ... rest of the code
}

// Add null checks in this method
private formatDateForInput(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '';
  try {
    if (dateString.includes('T')) {
      return dateString.substring(0, 10);
    }
    return dateString;
  } catch (e) {
    console.error('Erreur formatage date:', e);
    return '';
  }
}

// Update the openCouponModal method to handle null coupon
openCouponModal(coupon?: Coupon) {
  console.log('🎫 Ouverture modal coupon...');
  
  this.couponForm.reset({
    discountValue: 10,
    discountType: 'PERCENTAGE',
    discountExtra: 0,
    maxUses: 100,
    minOrderAmount: 0,
    isActive: true,
    freeShipping: false,
    applicableProducts: []
  });

  this.couponProductsForm.reset({
    searchTerm: '',
    selectAll: false
  });

  this.selectedCouponProducts = [];

  if (coupon) {
    this.selectedCoupon = coupon;
    
    // ADD NULL CHECK HERE
    const formatDateForInput = (dateString: string | undefined): string => {
      if (!dateString || dateString.trim() === '') return '';
      try {
        if (dateString.includes('T')) {
          return dateString.substring(0, 10);
        }
        return dateString;
      } catch (e) {
        console.error('Erreur formatage date:', e);
        return '';
      }
    };

    if (coupon.applicableProducts && Array.isArray(coupon.applicableProducts)) {
      this.selectedCouponProducts = coupon.applicableProducts
        .map(id => Number(id))
        .filter(id => !isNaN(id) && id > 0);
      
      console.log('📋 Produits applicables chargés:', this.selectedCouponProducts);
    } else {
      this.selectedCouponProducts = [];
    }
    
    this.couponForm.patchValue({
      code: coupon.code,
      discountValue: coupon.discountValue,
      discountType: coupon.discountType,
      discountExtra: coupon.discountExtra || 0,
      expiryDate: formatDateForInput(coupon.expiryDate),
      startDate: coupon.startDate ? formatDateForInput(coupon.startDate) : '',
      description: coupon.description || '',
      maxUses: coupon.maxUses || 100,
      minOrderAmount: coupon.minOrderAmount || 0,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      freeShipping: coupon.freeShipping || false,
      applicableProducts: [...this.selectedCouponProducts]
    });
    
  } else {
    this.selectedCoupon = null;
    this.generateCouponCode();
  }
  
  this.loadApplicableProducts();
  
  this.modals.coupon = true;
}


  syncOrderToBackend(order: CustomerOrder) {
    throw new Error('Method not implemented.');
  }


saveOrderLocally(order: CustomerOrder): void {
  try {
    // Sauvegarder dans localStorage
    const orders = JSON.parse(localStorage.getItem('admin_orders_local') || '[]');
    
    // Chercher si la commande existe déjà
    const existingIndex = orders.findIndex((o: any) => o.orderNumber === order.orderNumber);
    
    if (existingIndex !== -1) {
      orders[existingIndex] = order;
    } else {
      orders.push(order);
    }
    
    localStorage.setItem('admin_orders_local', JSON.stringify(orders));
    
    // Mettre à jour la liste affichée
    const index = this.orders.findIndex(o => o.orderNumber === order.orderNumber);
    if (index !== -1) {
      this.orders[index] = order;
    }
    
    console.log('✅ Commande sauvegardée localement:', order.orderNumber);
  } catch (error) {
    console.error('❌ Erreur sauvegarde locale:', error);
  }
}
loadOrderItems() {
  if (!this.isLoggedIn) return;
  
  console.log('📋 Chargement order items...');
  
  // D'abord essayer de charger depuis localStorage
  try {
    const localItems = localStorage.getItem('admin_order_items');
    if (localItems) {
      this.orderItems = JSON.parse(localItems);
      console.log(`✅ ${this.orderItems.length} order items chargés depuis localStorage`);
      return;
    }
  } catch (error) {
    console.error('❌ Erreur chargement local:', error);
  }
  
  // Fallback à l'API
  this.adminService.getAllOrderItems().pipe(takeUntil(this.destroy$)).subscribe({
    next: (response: ApiResponse<OrderItem[]>) => {
      console.log('📋 Order items response:', response);
      if (response.success && response.orderItems) {
        this.orderItems = response.orderItems;
        console.log(`✅ ${this.orderItems.length} order items chargés`);
        
        // Sauvegarder dans localStorage pour cache
        try {
          localStorage.setItem('admin_order_items', JSON.stringify(this.orderItems));
        } catch (error) {
          console.error('❌ Erreur sauvegarde cache:', error);
        }
      } else {
        console.warn('⚠️ Pas de détail de commande disponible:', response.message);
        this.orderItems = [];
      }
    },
    error: (error: any) => {
      console.error('❌ Erreur API order items:', error);
      
      // Gestion spécifique de l'erreur proxy Hibernate
      if (error.status === 500 && error.error && 
          (error.error.includes('could not initialize proxy') || 
           error.error.includes('no Session'))) {
        console.log('⚠️ Erreur proxy Hibernate - Utilisation de données locales');
        this.showAlert('Utilisation des données en cache (erreur technique serveur)', 'warning');
        this.orderItems = [];
      } else {
        this.orderItems = [];
        this.showAlert('Erreur lors du chargement des détails de commande', 'error');
      }
    }
  });
}



// Méthode pour générer un ID temporaire
private generateTempOrderId(): number {
  return Date.now() * -1; // ID négatif pour les temporaires
}

// Méthode pour extraire ou générer un ID

loadOrders() {
  if (!this.isLoggedIn) return;
  
  console.log('📦 Chargement commandes...');
  this.loading.orders = true;
  
  this.adminService.getAllOrders().pipe(takeUntil(this.destroy$)).subscribe({
    next: (response: ApiResponse<CustomerOrder[]>) => {
      console.log('📦 Orders response:', response);
      if (response.success && response.orders) {
        this.orders = response.orders;
        console.log(`✅ ${this.orders.length} commandes chargées`);
        
        // Sauvegarder dans localStorage pour cache
        try {
          localStorage.setItem('admin_all_orders', JSON.stringify(this.orders));
        } catch (error) {
          console.error('❌ Erreur sauvegarde cache:', error);
        }
      } else {
        console.error('❌ Erreur commandes:', response.message);
        this.showAlert('Erreur lors du chargement des commandes', 'error');
      }
      this.loading.orders = false;
    },
    error: (error: any) => {
      console.error('❌ Erreur API commandes:', error);
      this.showAlert('Erreur lors du chargement des commandes', 'error');
      this.loading.orders = false;
    }
  });
  
  // Charger aussi les commandes soin après le chargement principal
  setTimeout(() => {
    this.syncSoinOrdersToAdminOrders();
  }, 1000);
}


private confirmOrderViaApi(orderId: number, originalOrder: CustomerOrder) {
  console.log('📤 Confirmation via API pour ID:', orderId);
  
  this.loading.action = true;
  
  this.adminService.confirmOrder(orderId).pipe(takeUntil(this.destroy$)).subscribe({
    next: (response: ApiResponse<CustomerOrder>) => {
      this.loading.action = false;
      
      if (response.success && response.data) {
        // Mettre à jour la commande avec la réponse du serveur
        const confirmedOrder = response.data;
        
        // Trouver et mettre à jour la commande dans la liste
        const index = this.orders.findIndex(o => 
          o.id === orderId || o.orderNumber === originalOrder.orderNumber
        );
        
        if (index !== -1) {
          this.orders[index] = { ...this.orders[index], ...confirmedOrder };
        }
        
        // Si la commande est dans selectedOrder, la mettre à jour
        if (this.selectedOrder && 
            (this.selectedOrder.id === orderId || this.selectedOrder.orderNumber === originalOrder.orderNumber)) {
          this.selectedOrder = { ...this.selectedOrder, ...confirmedOrder };
        }
        
        // Envoyer l'email de confirmation
        this.sendOrderConfirmationEmail(confirmedOrder);
        
        // Synchroniser le client
        this.syncCustomerFromOrder(confirmedOrder);
        
        this.showAlert('Commande confirmée avec succès', 'success');
        
        // Recharger les commandes pour s'assurer que tout est à jour
        this.loadOrders();
        
      } else {
        this.showAlert(response.message || 'Erreur lors de la confirmation', 'error');
      }
    },
    error: (error: any) => {
      this.loading.action = false;
      console.error('❌ Erreur API confirmation commande:', error);
      
      // Gestion d'erreur améliorée
      let errorMessage = 'Erreur lors de la confirmation';
      
      if (error.status === 404) {
        errorMessage = 'Commande non trouvée sur le serveur';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur lors de la confirmation';
        
        // Tentative de sauvegarde locale SEULEMENT si l'API échoue
        console.log('⚠️ API échouée, sauvegarde locale en backup');
        this.fallbackLocalConfirmation(originalOrder);
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      
      this.showAlert(errorMessage, 'error');
    }
  });
}

private fallbackLocalConfirmation(order: CustomerOrder) {
  // Cette méthode est appelée SEULEMENT si l'API échoue
  console.log('🔄 Fallback: confirmation locale pour:', order.orderNumber);
  
  order.status = 'CONFIRMED';
  order.updatedAt = new Date().toISOString();
  
  // Sauvegarder localement comme backup
  try {
    const localOrders = JSON.parse(localStorage.getItem('admin_orders_backup') || '[]');
    const existingIndex = localOrders.findIndex((o: any) => o.orderNumber === order.orderNumber);
    
    if (existingIndex !== -1) {
      localOrders[existingIndex] = order;
    } else {
      localOrders.push(order);
    }
    
    localStorage.setItem('admin_orders_backup', JSON.stringify(localOrders));
    
    // Mettre à jour l'affichage
    const index = this.orders.findIndex(o => o.orderNumber === order.orderNumber);
    if (index !== -1) {
      this.orders[index] = { ...order };
    }
    
    this.showAlert('Commande confirmée localement (backup - serveur inaccessible)', 'warning');
  } catch (error) {
    console.error('❌ Erreur sauvegarde backup:', error);
  }
}
// ==================== MÉTHODES POUR LA CONFIRMATION DE COMMANDE ====================

/**
 * Confirmer une commande - VERSION UNIFIÉE
 * Cette méthode gère TOUS les types de commandes (soin, savon, huiles, etc.)
 */

/**
 * Corriger l'ID d'une commande
 */
private fixOrderId(order: CustomerOrder): void {
  console.log('🔧 Fixation ID pour:', order.orderNumber);
  
  // Stratégie 1: Extraire de l'orderNumber
  const numericMatch = order.orderNumber.match(/\d+/g);
  if (numericMatch && numericMatch.length > 0) {
    const extractedId = parseInt(numericMatch.join(''), 10);
    if (!isNaN(extractedId) && extractedId > 0) {
      order.id = extractedId;
      console.log(`✅ ID extrait du numéro: ${order.id}`);
      return;
    }
  }
  
  // Stratégie 2: Générer basé sur le timestamp
  const timestampId = Date.now() + Math.floor(Math.random() * 1000);
  order.id = timestampId;
  
  // Stratégie 3: Si c'est une commande soin, ajouter un préfixe
  if (order.source === 'soin') {
    order.id = parseInt('7' + timestampId.toString().slice(-8));
  }
  
  console.log(`✅ ID généré: ${order.id}`);
  
  // Mettre à jour dans la liste
  const index = this.orders.findIndex(o => o.orderNumber === order.orderNumber);
  if (index !== -1) {
    this.orders[index] = { ...order };
  }
}

/**
 * Traiter la confirmation de commande
 */

  updateDashboardStats() {
    throw new Error('Method not implemented.');
  }

/**
 * Mettre à jour une commande dans le stockage
 */


/**
 * Mettre à jour la commande dans la liste affichée
 */


/**
 * Tenter la synchronisation avec l'API
 */


/**
 * Expédier une commande - VERSION UNIFIÉE
 */


/**
 * Livrer une commande
 */
deliverOrder(order: CustomerOrder): void {
  console.log('📦 Livraison commande:', order.orderNumber);
  
  if (!(order.status === 'SHIPPED' || order.status === 'EXPÉDIÉE')) {
    this.showAlert('La commande doit être expédiée avant d\'être livrée', 'warning');
    return;
  }
  
  order.status = 'DELIVERED';
  order.updatedAt = new Date().toISOString();
  
  this.updateOrderInStorage(order);
  this.updateOrderInList(order);
  
  this.showAlert(`Commande #${order.orderNumber} marquée comme livrée!`, 'success');
  
  if (order.id && order.id > 0) {
    this.adminService.deliverOrder(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('✅ Livraison API'),
        error: () => console.log('ℹ️ API non disponible')
      });
  }
}

/**
 * Annuler une commande
 */
cancelOrder(order: CustomerOrder): void {
  console.log('❌ Annulation commande:', order.orderNumber);
  
  if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
    return;
  }
  
  order.status = 'CANCELLED';
  order.updatedAt = new Date().toISOString();
  
  this.updateOrderInStorage(order);
  this.updateOrderInList(order);
  
  this.showAlert(`Commande #${order.orderNumber} annulée`, 'success');
  
  if (order.id && order.id > 0) {
    this.adminService.cancelOrder(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('✅ Annulation API'),
        error: () => console.log('ℹ️ API non disponible')
      });
  }
}
/**
 * Confirmer une commande - VERSION CORRIGÉE


/**
 * Trouver une commande par son numéro - RETOURNE CustomerOrder | undefined
 */
private findOrderByNumber(orderNumber: string): CustomerOrder | undefined {
  return this.orders.find(o => o.orderNumber === orderNumber);
}

/**
 * Transformer un objet en CustomerOrder
 */
private transformToCustomerOrder(data: any): CustomerOrder {
  return {
    id: data.id || this.generateOrderId(data.orderNumber),
    orderNumber: data.orderNumber,
    customerName: data.customerName || data.customerFirstName + ' ' + data.customerLastName,
    customerEmail: data.customerEmail || '',
    status: data.status || 'PENDING',
    orderDate: data.orderDate || new Date().toISOString(),
    subtotal: data.subtotal || 0,
    shippingCost: data.shippingCost || 0,
    totalAmount: data.totalAmount || 0,
    orderItems: data.orderItems || [],
    paymentStatus: data.paymentStatus,
    paymentMethod: data.paymentMethod,
    trackingNumber: data.trackingNumber,
    notes: data.notes,
    source: data.source || 'unknown',
    customerPhone: data.customerPhone,
    deliveryAddress: data.deliveryAddress,
    governorate: data.governorate,
    city: data.city,
    synchronizedAt: data.synchronizedAt,
    lastUpdate: data.lastUpdate,
    receivedAt: data.receivedAt,
    isTemporary: data.isTemporary
  };
}

/**
 * Générer un ID pour une commande
 */
private generateOrderId(orderNumber: string): number {
  const numericPart = orderNumber.replace(/[^\d]/g, '');
  const extractedId = parseInt(numericPart, 10);
  
  if (!isNaN(extractedId) && extractedId > 0) {
    return extractedId;
  }
  
  // Générer un ID basé sur le timestamp
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Traiter la confirmation de commande - ACCEPTE CustomerOrder
 */
/**
 * Mettre à jour une commande dans le stockage
 */


/**
 * Tenter la synchronisation avec l'API
 */
private trySyncToApi(order: CustomerOrder): void {
  // Uniquement si on a un ID valide
  if (!order.id || order.id <= 0) {
    console.log('⚠️ Pas d\'ID pour synchronisation API');
    return;
  }
  
  console.log('📤 Tentative synchronisation API pour:', order.orderNumber);
  
  this.adminService.confirmOrder(order.id)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Synchronisation API réussie');
          
          // Mettre à jour avec les données du serveur si disponibles
          if (response.data) {
            Object.assign(order, response.data);
            this.updateOrderInStorage(order);
            this.updateOrderInList(order);
          }
        }
      },
      error: (error) => {
        console.log('ℹ️ Synchronisation API non disponible, continuation locale');
        // Ce n'est pas une erreur grave, on continue avec la version locale
      }
    });
}




/**
 * Méthode utilitaire pour garantir un CustomerOrder valide
 */
private ensureCustomerOrder(data: any): CustomerOrder {
  // Si c'est déjà un CustomerOrder, le retourner
  if (data.orderNumber && data.customerName !== undefined) {
    return data as CustomerOrder;
  }
  
  // Sinon le transformer
  return this.transformToCustomerOrder(data);
}
/**
 * Associer automatiquement un coupon à des produits par catégorie
 */
autoApplyCouponToProducts(coupon: Coupon, category?: string, productIds?: number[]): void {
  console.log('🤖 Application automatique du coupon:', coupon.code);
  
  if (productIds && productIds.length > 0) {
    // Si des IDs de produits sont fournis, les utiliser directement
    this.applyCouponToSpecificProducts(coupon, productIds);
    return;
  }
  
  let productsToApply: Product[] = [];
  
  if (category) {
    // Appliquer aux produits d'une catégorie spécifique
    productsToApply = this.products.filter(product => 
      product.category === category && product.isActive
    );
    console.log(`📁 Filtrage par catégorie "${category}": ${productsToApply.length} produits`);
  } else {
    // Appliquer à tous les produits actifs
    productsToApply = this.products.filter(product => product.isActive);
    console.log(`🌍 Tous les produits actifs: ${productsToApply.length} produits`);
  }
  
  if (productsToApply.length === 0) {
    this.showAlert('Aucun produit trouvé pour l\'application du coupon', 'warning');
    return;
  }
  
  // Préparer les IDs de produits
  const productIdsToApply = productsToApply.map(p => p.id);
  
  // Mettre à jour le coupon
  coupon.applicableProducts = [
    ...(coupon.applicableProducts || []),
    ...productIdsToApply.filter(id => 
      !coupon.applicableProducts?.includes(id)
    )
  ];
  
  // Sauvegarder le coupon
  this.adminService.updateCoupon(coupon.id, {
    applicableProducts: coupon.applicableProducts
  }).pipe(takeUntil(this.destroy$)).subscribe({
    next: (response: ApiResponse<Coupon>) => {
      if (response.success) {
        const count = productIdsToApply.length;
        this.showAlert(
          `Coupon "${coupon.code}" appliqué à ${count} produit(s) ${category ? `de la catégorie "${category}"` : ''}`,
          'success'
        );
        
        // Mettre à jour l'affichage
        this.updateProductCouponAssociations();
        this.syncCouponsToPages();
      }
    },
    error: (error) => {
      console.error('❌ Erreur application automatique:', error);
    }
  });
}

/**
 * Appliquer un coupon à des produits spécifiques
 */
private applyCouponToSpecificProducts(coupon: Coupon, productIds: number[]): void {
  console.log(`🎯 Application à ${productIds.length} produits spécifiques`);
  
  coupon.applicableProducts = [
    ...(coupon.applicableProducts || []),
    ...productIds.filter(id => 
      !coupon.applicableProducts?.includes(id)
    )
  ];
  
  this.adminService.updateCoupon(coupon.id, {
    applicableProducts: coupon.applicableProducts
  }).pipe(takeUntil(this.destroy$)).subscribe({
    next: (response: ApiResponse<Coupon>) => {
      if (response.success) {
        this.showAlert(
          `Coupon "${coupon.code}" appliqué à ${productIds.length} produit(s) spécifique(s)`,
          'success'
        );
        this.updateProductCouponAssociations();
        this.syncCouponsToPages();
      }
    }
  });
}
/**
 * Appliquer un coupon par type de produit (savon, huiles, soin, etc.)
 */
applyCouponByProductType(coupon: Coupon, productType: 'savon' | 'huiles' | 'soin' | 'olive'): void {
  console.log(`🏷️ Application par type: ${productType}`);
  
  let productsToApply: Product[] = [];
  
  switch (productType) {
    case 'savon':
      productsToApply = this.products.filter(product => 
        this.isSavonProduct(product) && product.isActive
      );
      break;
    case 'huiles':
      productsToApply = this.products.filter(product => 
        this.isHuilesEssentiellesProduct(product) && product.isActive
      );
      break;
    case 'soin':
      productsToApply = this.products.filter(product => 
        this.isSoinProduct(product) && product.isActive
      );
      break;
    case 'olive':
      productsToApply = this.products.filter(product => 
        this.isHuileOliveProduct(product) && product.isActive
      );
      break;
  }
  
  if (productsToApply.length === 0) {
    this.showAlert(`Aucun produit de type "${productType}" trouvé`, 'warning');
    return;
  }
  
  const productIds = productsToApply.map(p => p.id);
  this.autoApplyCouponToProducts(coupon, undefined, productIds);
}
/**
 * Appliquer un coupon aux produits en faible stock
 */
applyCouponToLowStockProducts(coupon: Coupon, maxStock: number = 10): void {
  console.log(`📊 Application aux produits en faible stock (< ${maxStock})`);
  
  const lowStockProducts = this.products.filter(product => 
    product.stockQuantity <= maxStock && 
    product.stockQuantity > 0 &&
    product.isActive
  );
  
  if (lowStockProducts.length === 0) {
    this.showAlert(`Aucun produit avec stock inférieur à ${maxStock}`, 'info');
    return;
  }
  
  const productIds = lowStockProducts.map(p => p.id);
  this.autoApplyCouponToProducts(coupon, undefined, productIds);
}

/**
 * Appliquer un coupon aux produits sans vente récente
 */
applyCouponToSlowMovingProducts(coupon: Coupon, daysThreshold: number = 30): void {
  console.log(`⏰ Application aux produits sans vente (${daysThreshold} jours)`);
  
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
  
  const slowProducts = this.products.filter(product => {
    if (!product.lastSaleDate || !product.isActive) return false;
    
    const lastSale = new Date(product.lastSaleDate);
    return lastSale < thresholdDate;
  });
  
  if (slowProducts.length === 0) {
    this.showAlert(`Tous les produits ont eu des ventes récentes`, 'info');
    return;
  }
  
  const productIds = slowProducts.map(p => p.id);
  this.autoApplyCouponToProducts(coupon, undefined, productIds);
}

forceSyncSoinCoupons(): void {
  console.log('🎯 Synchronisation FORCÉE pour la page soin...');
  
  // Récupérer tous les coupons actifs
  const activeCoupons = this.coupons.filter(coupon => 
    coupon.isActive && !this.isCouponExpired(coupon)
  );
  
  const soinCoupons: Coupon[] = [];
  
  activeCoupons.forEach(coupon => {
    // Vérifier si le coupon est applicable aux produits soin
    if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
      // Coupon universel - toujours inclure
      soinCoupons.push(coupon);
      console.log(`🌍 ${coupon.code} (${coupon.discountValue}%) → Soin (universel)`);
    } else {
      // Vérifier s'il a des produits soin
      let soinCount = 0;
      coupon.applicableProducts.forEach(productId => {
        const product = this.products.find(p => p.id === productId);
        if (product && this.isSoinProduct(product)) {
          soinCount++;
        }
      });
      
      if (soinCount > 0) {
        soinCoupons.push(coupon);
        console.log(`✅ ${coupon.code} → Soin (${soinCount} produits)`);
      }
    }
  });
  
  // Sauvegarder spécifiquement pour soin
  localStorage.setItem('soinCoupons', JSON.stringify(soinCoupons));
  
  // Synchroniser les produits soin avec les coupons
  this.syncSoinProductsWithCoupons();
  
  this.showAlert(`${soinCoupons.length} coupons synchronisés vers la page soin`, 'success');
}

syncSoinProductsWithCoupons(): void {
  console.log('🔄 Application des coupons aux produits soin...');
  
  // Récupérer les produits soin
  const soinProducts = this.products.filter(product => 
    this.isSoinProduct(product)
  );
  
  // Récupérer les coupons soin
  const soinCoupons = JSON.parse(localStorage.getItem('soinCoupons') || '[]');
  
  // Appliquer les coupons aux produits
  soinProducts.forEach(product => {
    const productCoupons = soinCoupons.filter((coupon: Coupon) => 
      !coupon.applicableProducts || 
      coupon.applicableProducts.length === 0 || 
      coupon.applicableProducts.includes(product.id)
    );
    
    if (productCoupons.length > 0) {
      // Trouver le meilleur coupon
      const bestCoupon = this.getBestProductCouponFromList(product, productCoupons);
      this.applyCouponToProduct(product, bestCoupon);
      
      console.log(`🎯 Produit "${product.name}" -> ${bestCoupon?.code || 'Aucun'}`);
    }
  });
  
  // Sauvegarder les produits soin mis à jour
  localStorage.setItem('soinProducts', JSON.stringify(soinProducts));
  
  window.dispatchEvent(new Event('soinProductsUpdated'));
}
// Dans AdminComponent, remplacer la méthode syncCouponsToPages()



 
forceFullSyncAfterCouponSave(): void {
  console.log('🔄 SYNCHRONISATION COMPLÈTE FORCÉE APRÈS SAUVEGARDE...');
  
  // 1. Mettre à jour les associations produits-coupons
  this.updateProductCouponAssociations();
  
  // 2. Mettre à jour l'affichage des produits
  this.updateProductDiscountDisplay();
  
  // 3. Sauvegarder dans localStorage (admin)
  this.saveAllToLocalStorage();
  
  // 4. Synchroniser les coupons vers les pages
  this.syncCouponsToPages();
  
  // 5. Synchroniser les produits avec coupons pour chaque page
  this.syncAllProductsWithCouponsToPages();
  
  // 6. Émettre des événements pour toutes les pages
  this.emitEventsToAllPages();
  
  console.log('✅ SYNCHRONISATION COMPLÈTE TERMINÉE');
  this.showAlert('Coupon synchronisé automatiquement vers toutes les pages', 'success');
}

/**
 * Sauvegarder toutes les données dans localStorage
 */
saveAllToLocalStorage(): void {
  try {
    // Sauvegarder les produits admin
    localStorage.setItem('adminProducts', JSON.stringify(this.products));
    
    // Sauvegarder les coupons admin
    localStorage.setItem('adminCoupons', JSON.stringify(this.coupons));
    
    // Sauvegarder les associations produits-coupons
    const productCoupons: { [key: number]: number[] } = {};
    this.products.forEach(product => {
      if (product.couponIds && product.couponIds.length > 0) {
        productCoupons[product.id] = product.couponIds;
      }
    });
    localStorage.setItem('productCoupons', JSON.stringify(productCoupons));
    
    console.log('✅ Toutes les données sauvegardées dans localStorage');
  } catch (error) {
    console.error('❌ Erreur sauvegarde localStorage:', error);
  }
}

/**
 * Synchroniser tous les produits avec coupons vers les pages
 */
syncAllProductsWithCouponsToPages(): void {
  console.log('🔄 Synchronisation des produits avec coupons vers les pages...');
  
  // Récupérer tous les produits
  const allProducts = [...this.products];
  
  // Filtrer par type
  const savonProducts = allProducts.filter(p => this.isSavonProduct(p));
  const huilesProducts = allProducts.filter(p => this.isHuilesEssentiellesProduct(p));
  const oliveProducts = allProducts.filter(p => this.isHuileOliveProduct(p));
  const soinProducts = allProducts.filter(p => this.isSoinProduct(p));
  
  // Récupérer les coupons par page
  const savonCoupons = JSON.parse(localStorage.getItem('savonCoupons') || '[]');
  const huilesCoupons = JSON.parse(localStorage.getItem('huilesEssentiellesCoupons') || '[]');
  const oliveCoupons = JSON.parse(localStorage.getItem('huileOliveCoupons') || '[]');
  const soinCoupons = JSON.parse(localStorage.getItem('soinCoupons') || '[]');
  
  // Appliquer les coupons aux produits de chaque page
  this.applyCouponsToProductsForPage(savonProducts, savonCoupons, 'savon');
  this.applyCouponsToProductsForPage(huilesProducts, huilesCoupons, 'huiles');
  this.applyCouponsToProductsForPage(oliveProducts, oliveCoupons, 'olive');
  this.applyCouponsToProductsForPage(soinProducts, soinCoupons, 'soin');
  
  // Sauvegarder dans localStorage
  localStorage.setItem('savonProducts', JSON.stringify(savonProducts));
  localStorage.setItem('huilesEssentiellesProducts', JSON.stringify(huilesProducts));
  localStorage.setItem('huileOliveProducts', JSON.stringify(oliveProducts));
  localStorage.setItem('soinProducts', JSON.stringify(soinProducts));
}

/**
 * Appliquer les coupons aux produits d'une page spécifique
 */
applyCouponsToProductsForPage(products: Product[], coupons: Coupon[], pageName: string): void {
  console.log(`🔄 Application coupons à la page ${pageName} (${products.length} produits, ${coupons.length} coupons)`);
  
  products.forEach(product => {
    // Trouver les coupons applicables à ce produit
    const applicableCoupons = coupons.filter(coupon => 
      !coupon.applicableProducts || 
      coupon.applicableProducts.length === 0 || 
      coupon.applicableProducts.includes(product.id)
    );
    
    if (applicableCoupons.length > 0) {
      // Trouver le meilleur coupon
      const bestCoupon = this.getBestProductCouponFromList(product, applicableCoupons);
      if (bestCoupon) {
        product.hasDiscount = true;
        product.discountedPrice = this.calculateDiscountedPrice(product.price, bestCoupon);
        product.discountPercentage = Math.round((1 - (product.discountedPrice! / product.price)) * 100);
        product.originalPrice = product.price;
        product.couponIds = applicableCoupons.map(c => c.id);
      }
    } else {
      // Pas de coupon applicable
      product.hasDiscount = false;
      product.discountedPrice = undefined;
      product.discountPercentage = undefined;
      product.originalPrice = undefined;
      product.couponIds = [];
    }
  });
}

/**
 * Émettre des événements pour toutes les pages
 */
emitEventsToAllPages(): void {
  window.dispatchEvent(new Event('savonProductsUpdated'));
  window.dispatchEvent(new Event('huilesEssentiellesProductsUpdated'));
  window.dispatchEvent(new Event('huileOliveProductsUpdated'));
  window.dispatchEvent(new Event('soinProductsUpdated'));
  
  window.dispatchEvent(new Event('savonCouponsUpdated'));
  window.dispatchEvent(new Event('huilesEssentiellesCouponsUpdated'));
  window.dispatchEvent(new Event('huileOliveCouponsUpdated'));
  window.dispatchEvent(new Event('soinCouponsUpdated'));
  
  // Événement général
  window.dispatchEvent(new CustomEvent('adminCouponsUpdated', {
    detail: {
      coupons: this.coupons,
      timestamp: new Date().toISOString()
    }
  }));
}
/**
 * Utiliser un coupon (appelé depuis le panier/commande)
 */

/**
 * Écouter les événements d'utilisation de coupons
 */

/**
 * Incrémenter le compteur d'utilisations d'un coupon
 */


/**
 * Sauvegarder les coupons dans localStorage
 */
saveCouponsToLocalStorage(): void {
  try {
    localStorage.setItem('adminCoupons', JSON.stringify(this.coupons));
    console.log('💾 Coupons sauvegardés dans localStorage');
  } catch (error) {
    console.error('❌ Erreur sauvegarde coupons:', error);
  }
}

/**
 * Sauvegarder une utilisation de coupon
 */
saveCouponUsage(usageData: any): void {
  try {
    const usages = JSON.parse(localStorage.getItem('couponUsages') || '[]');
    
    const usage = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      couponCode: usageData.couponCode,
      orderNumber: usageData.orderNumber,
      customerName: usageData.customerName,
      customerEmail: usageData.customerEmail,
      discountAmount: usageData.discountAmount || 0,
      originalAmount: usageData.originalAmount || 0,
      finalAmount: usageData.finalAmount || 0,
      usedAt: new Date().toISOString()
    };
    
    usages.unshift(usage);
    localStorage.setItem('couponUsages', JSON.stringify(usages));
    
    console.log('💾 Utilisation sauvegardée:', usage);
  } catch (error) {
    console.error('❌ Erreur sauvegarde utilisation:', error);
  }
}

/**
 * Vérifier les nouvelles utilisations
 */
checkForNewCouponUsages(): void {
  try {
    const pendingUsages = JSON.parse(localStorage.getItem('pendingCouponUsages') || '[]');
    
    if (pendingUsages.length > 0) {
      console.log(`📦 ${pendingUsages.length} utilisation(s) en attente détectée(s)`);
      
      pendingUsages.forEach((usage: any) => {
        this.incrementCouponUsage(usage.couponCode, usage);
      });
      
      // Vider la file d'attente
      localStorage.removeItem('pendingCouponUsages');
    }
  } catch (error) {
    console.error('❌ Erreur vérification utilisations:', error);
  }
}

/**
 * Mettre à jour l'affichage d'un coupon
 */
updateCouponDisplay(coupon: Coupon): void {
  // Mettre à jour dans le tableau
  const index = this.coupons.findIndex(c => c.id === coupon.id);
  if (index !== -1) {
    this.coupons[index] = { ...coupon };
  }
}

/**
 * ✅ Incrémente le compteur d'utilisations d'un coupon
 * @param couponCode Code du coupon à incrémenter
 * @param reservationId ID de la réservation (optionnel pour logging)
 */


/**
 * ✅ Sauvegarde l'utilisation du coupon dans localStorage
 */
private saveCouponUsageToLocalStorage(couponCode: string, newCount: number, reservationId?: number): void {
  try {
    const couponCounters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    couponCounters[couponCode] = newCount;
    localStorage.setItem('coupon_counters', JSON.stringify(couponCounters));
    
    // Enregistrer l'historique d'utilisation
    const usageHistory = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    usageHistory.push({
      couponCode: couponCode,
      newCount: newCount,
      timestamp: new Date().toISOString(),
      reservationId: reservationId || null
    });
    localStorage.setItem('coupon_usage_history', JSON.stringify(usageHistory));
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde compteur coupon:', error);
  }
}

/**
 * ✅ Affiche une notification pour le coupon
 */
private showCouponNotification(message: string): void {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 9999;
    font-size: 14px;
    animation: slideIn 0.3s ease;
    border-left: 4px solid #ffd700;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center;">
      <span style="font-size: 20px; margin-right: 10px;">🎟️</span>
      <div>
        <strong style="display: block; margin-bottom: 4px;">Mise à jour coupon</strong>
        <span>${message}</span>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * ✅ Synchronise les compteurs avec l'API
 */
syncCouponCountersWithAPI(): void {
  console.log('🔄 Synchronisation des compteurs coupons avec API...');
  
  const couponsToSync = this.coupons.filter(c => c.usedCount > 0);
  
  couponsToSync.forEach(coupon => {
    this.adminService.updateCoupon(coupon.id, { usedCount: coupon.usedCount })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log(`✅ Coupon ${coupon.code} synchronisé: ${coupon.usedCount} utilisations`);
          }
        },
        error: (error) => {
          console.error(`❌ Erreur synchronisation coupon ${coupon.code}:`, error);
        }
      });
  });
}
// ==================== MÉTHODE useCoupon CORRIGÉE ====================


/**
 * Incrémente le compteur local d'un coupon
 */


/**
 * Récupère l'utilisation locale d'un coupon
 */
private getLocalCouponUsage(couponCode: string): number {
  try {
    const coupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    const coupon = coupons.find((c: any) => c.code === couponCode);
    return coupon?.usedCount || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * Met à jour les coupons dans le composant Admin
 */
private updateCouponsInComponent(couponCode: string, newCount: number): void {
  // Si le composant Admin est accessible via un service global
  if (window && (window as any).adminComponent) {
    (window as any).adminComponent.updateCouponCount(couponCode, newCount);
  }
}

/**
 * Émet un événement pour mettre à jour tous les composants
 */
private emitCouponUsageEvent(couponCode: string, usedCount: number): void {
  const event = new CustomEvent('couponUsageUpdated', {
    detail: {
      couponCode: couponCode,
      usedCount: usedCount,
      timestamp: new Date().toISOString()
    }
  });
  window.dispatchEvent(event);
  console.log(`📢 Événement émis pour ${couponCode}: ${usedCount} utilisations`);
}
// À AJOUTER DANS AdminComponent

/**
 * Écouteur pour les événements d'utilisation de coupons
 */

/**
 * Incrémente le compteur d'un coupon à partir d'un événement
 */

/**
 * Sauvegarde les compteurs de coupons dans localStorage
 */

/**
 * Récupère l'historique des utilisations
 */

/**
 * Charge les compteurs depuis localStorage
 */
private loadCouponCountersFromStorage(): void {
  try {
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    
    // Compter les utilisations depuis l'historique
    const usageCounts: { [key: string]: number } = {};
    history.forEach((h: any) => {
      usageCounts[h.couponCode] = (usageCounts[h.couponCode] || 0) + 1;
    });
    
    // Mettre à jour les coupons
    this.coupons.forEach(coupon => {
      // Priorité à l'historique (plus fiable)
      if (usageCounts[coupon.code] !== undefined) {
        coupon.usedCount = usageCounts[coupon.code];
      } 
      // Sinon utiliser les compteurs
      else if (counters[coupon.code] !== undefined) {
        coupon.usedCount = counters[coupon.code];
      }
      // Sinon garder la valeur de l'API
      else {
        coupon.usedCount = coupon.usedCount || 0;
      }
    });
    
    console.log('📊 Compteurs coupons chargés depuis localStorage');
  } catch (error) {
    console.error('❌ Erreur chargement compteurs:', error);
  }
}
/**
 * DIAGNOSTIC COMPLET : Analyse le parcours des coupons
 * de la commande jusqu'à l'affichage dans l'admin
 */


/**
 * DIAGNOSTIC 1 : Vérifier les coupons dans l'admin
 */
private diagnosticCouponsAdmin(): void {
  console.log('\n📋 1. COUPONS DANS L\'ADMIN');
  console.log('-'.repeat(40));
  
  console.log(`Total coupons dans le composant: ${this.coupons.length}`);
  
  if (this.coupons.length === 0) {
    console.error('❌ Aucun coupon dans le composant admin!');
    return;
  }
  
  // Afficher chaque coupon avec ses détails
  this.coupons.forEach((coupon, index) => {
    console.log(`\n🎫 Coupon #${index + 1}: ${coupon.code}`);
    console.log(`   ID: ${coupon.id}`);
    console.log(`   Type: ${coupon.discountType} - Valeur: ${coupon.discountValue}`);
    console.log(`   Utilisations (composant): ${coupon.usedCount || 0}`);
    console.log(`   Max utilisations: ${coupon.maxUses || 'Illimité'}`);
    console.log(`   Actif: ${coupon.isActive ? '✅' : '❌'}`);
    console.log(`   Expire: ${coupon.expiryDate || 'N/A'}`);
    console.log(`   Produits applicables: ${coupon.applicableProducts?.length || 0}`);
    
    // Vérifier si le coupon est expiré
    if (coupon.expiryDate) {
      const now = new Date();
      const expiry = new Date(coupon.expiryDate);
      if (expiry < now) {
        console.warn(`   ⚠️ Coupon EXPIRÉ depuis ${this.getDaysDifference(coupon.expiryDate)} jours`);
      }
    }
  });
}

/**
 * DIAGNOSTIC 2 : Vérifier les coupons dans le localStorage
 */
private diagnosticLocalStorageCoupons(): void {
  console.log('\n📦 2. COUPONS DANS LOCALSTORAGE');
  console.log('-'.repeat(40));
  
  const sources = [
    'adminCoupons',
    'savonCoupons',
    'huilesEssentiellesCoupons',
    'huileOliveCoupons',
    'soinCoupons',
    'coupon_counters',
    'coupon_usage_history'
  ];
  
  sources.forEach(source => {
    try {
      const data = localStorage.getItem(source);
      if (data) {
        const parsed = JSON.parse(data);
        console.log(`\n📁 ${source}:`);
        
        if (Array.isArray(parsed)) {
          console.log(`   Nombre: ${parsed.length}`);
          
          // Afficher les coupons avec leurs compteurs
          parsed.forEach((item: any, i: number) => {
            if (item.code) {
              console.log(`   ${i+1}. ${item.code} - utilisations: ${item.usedCount || 0}`);
            }
          });
          
          // Vérifier si les compteurs sont cohérents
          parsed.forEach((item: any) => {
            if (item.code) {
              const adminCoupon = this.coupons.find(c => c.code === item.code);
              if (adminCoupon && adminCoupon.usedCount !== item.usedCount) {
                console.warn(`   ⚠️ INCOHÉRENCE: ${item.code} - Admin:${adminCoupon.usedCount} vs Storage:${item.usedCount}`);
              }
            }
          });
        } else {
          console.log(`   Contenu:`, parsed);
        }
      } else {
        console.log(`\n📁 ${source}: ❌ NON TROUVÉ`);
      }
    } catch (error) {
      console.error(`   ❌ Erreur parsing ${source}:`, error);
    }
  });
}

/**
 * DIAGNOSTIC 3 : Vérifier les événements
 */

/**
 * DIAGNOSTIC 4 : Vérifier les compteurs et l'historique
 */
private diagnosticCompteurs(): void {
  console.log('\n📊 4. COMPTEURS ET HISTORIQUE');
  console.log('-'.repeat(40));
  
  try {
    // Vérifier les compteurs
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    console.log('\n🔢 Compteurs:');
    Object.keys(counters).forEach(code => {
      console.log(`   ${code}: ${counters[code]} utilisations`);
      
      // Vérifier avec le coupon dans l'admin
      const adminCoupon = this.coupons.find(c => c.code === code);
      if (adminCoupon) {
        if (adminCoupon.usedCount !== counters[code]) {
          console.warn(`   ⚠️ Admin:${adminCoupon.usedCount} vs Compteur:${counters[code]}`);
        }
      }
    });
    
    // Vérifier l'historique
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    console.log(`\n📜 Historique (${history.length} entrées):`);
    
    if (history.length > 0) {
      // Afficher les 5 dernières entrées
      history.slice(-5).forEach((h: any, i: number) => {
        console.log(`   ${i+1}. ${h.couponCode} - ${h.orderNumber} - ${new Date(h.usedAt).toLocaleString()}`);
      });
      
      // Grouper par coupon
      const grouped: any = {};
      history.forEach((h: any) => {
        grouped[h.couponCode] = (grouped[h.couponCode] || 0) + 1;
      });
      
      console.log('\n   Résumé par coupon:');
      Object.keys(grouped).forEach(code => {
        console.log(`   • ${code}: ${grouped[code]} utilisations`);
      });
    }
    
    // Vérifier les utilisations en attente
    const pending = JSON.parse(localStorage.getItem('pending_coupon_usages') || '[]');
    if (pending.length > 0) {
      console.warn(`\n⏳ Utilisations en attente: ${pending.length}`);
      pending.forEach((p: any, i: number) => {
        console.warn(`   ${i+1}. ${p.couponCode} - en attente depuis ${new Date(p.timestamp).toLocaleString()}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur analyse compteurs:', error);
  }
}

/**
 * DIAGNOSTIC 5 : Vérifier les pages spécifiques
 */
private diagnosticPagesSpecifiques(): void {
  console.log('\n🌐 5. PAGES SPÉCIFIQUES');
  console.log('-'.repeat(40));
  
  const pages = [
    { name: 'Savon', key: 'savonCoupons', productsKey: 'savonProducts' },
    { name: 'Huiles Essentielles', key: 'huilesEssentiellesCoupons', productsKey: 'huilesEssentiellesProducts' },
    { name: 'Huile Olive', key: 'huileOliveCoupons', productsKey: 'huileOliveProducts' },
    { name: 'Soin', key: 'soinCoupons', productsKey: 'soinProducts' }
  ];
  
  pages.forEach(page => {
    console.log(`\n📄 ${page.name}:`);
    
    try {
      const coupons = JSON.parse(localStorage.getItem(page.key) || '[]');
      const products = JSON.parse(localStorage.getItem(page.productsKey) || '[]');
      
      console.log(`   Coupons: ${coupons.length}`);
      console.log(`   Produits: ${products.length}`);
      
      if (coupons.length > 0) {
        coupons.forEach((c: any) => {
          console.log(`   • ${c.code} - utilisations: ${c.usedCount || 0}`);
        });
      }
      
      // Vérifier la cohérence avec l'admin
      coupons.forEach((pageCoupon: any) => {
        const adminCoupon = this.coupons.find(c => c.code === pageCoupon.code);
        if (adminCoupon && adminCoupon.usedCount !== pageCoupon.usedCount) {
          console.warn(`   ⚠️ INCOHÉRENCE: ${pageCoupon.code} - Admin:${adminCoupon.usedCount} vs Page:${pageCoupon.usedCount}`);
        }
      });
      
    } catch (error) {
      console.error(`   ❌ Erreur lecture ${page.name}:`, error);
    }
  });
}

/**
 * DIAGNOSTIC 6 : Vérifier la communication entre pages
 */
private diagnosticCommunication(): void {
  console.log('\n🔄 6. COMMUNICATION ENTRE PAGES');
  console.log('-'.repeat(40));
  
  // Vérifier si les événements sont propagés
  console.log('Test de propagation des événements:');
  
  // Écouter les réponses
  const responseHandler = (event: any) => {
    console.log(`   ✅ Réponse reçue de ${event.detail.source}:`, event.detail);
  };
  
  window.addEventListener('diagnosticResponse', responseHandler);
  
  // Envoyer un diagnostic à toutes les pages
  const diagnosticEvent = new CustomEvent('requestDiagnostic', {
    detail: {
      source: 'admin',
      timestamp: new Date().toISOString(),
      requestId: 'diag-' + Date.now()
    }
  });
  
  window.dispatchEvent(diagnosticEvent);
  console.log('   📤 Demande de diagnostic envoyée à toutes les pages');
  
  // Attendre les réponses
  setTimeout(() => {
    window.removeEventListener('diagnosticResponse', responseHandler);
    console.log('   ⏱️  Fin d\'attente des réponses');
  }, 2000);
}

/**
 * DIAGNOSTIC 7 : Afficher le résumé
 */
private afficherResumeDiagnostic(): void {
  console.log('\n📋 RÉSUMÉ DU DIAGNOSTIC');
  console.log('='.repeat(80));
  
  // 1. Vérifier les incohérences
  let incoherences = 0;
  let problemes = [];
  
  try {
    // Vérifier les compteurs vs historique
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    
    // Compter dans l'historique
    const historyCounts: any = {};
    history.forEach((h: any) => {
      historyCounts[h.couponCode] = (historyCounts[h.couponCode] || 0) + 1;
    });
    
    Object.keys(counters).forEach(code => {
      if (historyCounts[code] !== counters[code]) {
        incoherences++;
        problemes.push(`Compteur ${code}: ${counters[code]} vs Historique: ${historyCounts[code] || 0}`);
      }
    });
    
    // Vérifier les coupons admin vs localStorage
    this.coupons.forEach(coupon => {
      const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
      const storageCoupon = adminCoupons.find((c: any) => c.code === coupon.code);
      
      if (storageCoupon && storageCoupon.usedCount !== coupon.usedCount) {
        incoherences++;
        problemes.push(`Admin ${coupon.code}: Composant:${coupon.usedCount} vs Storage:${storageCoupon.usedCount}`);
      }
    });
    
    // Vérifier les utilisations en attente
    const pending = JSON.parse(localStorage.getItem('pending_coupon_usages') || '[]');
    if (pending.length > 0) {
      problemes.push(`${pending.length} utilisation(s) en attente`);
    }
    
  } catch (error) {
    console.error('Erreur analyse résumé:', error);
  }
  
  if (incoherences === 0 && problemes.length === 0) {
    console.log('%c✅ TOUT EST COHÉRENT!', 'background: #10b981; color: white; padding: 5px;');
  } else {
    console.log(`%c⚠️ ${incoherences} incohérence(s) détectée(s)`, 'background: #f59e0b; color: white; padding: 5px;');
    console.log('\nProblèmes détectés:');
    problemes.forEach(p => console.log(`   • ${p}`));
  }
  
  console.log('\n📌 RECOMMANDATIONS:');
  if (incoherences > 0) {
    console.log('   1. Exécutez resynchroniserTousLesCompteurs() pour corriger les incohérences');
  }
  if (JSON.parse(localStorage.getItem('pending_coupon_usages') || '[]').length > 0) {
    console.log('   2. Exécutez traiterUtilisationsEnAttente() pour traiter les utilisations en attente');
  }
  
  console.log('\n' + '='.repeat(80));
}

/**
 * RESSYNCHRONISER tous les compteurs
 */

/**
 * Mettre à jour les compteurs des pages à partir de l'historique
 */
private updatePageCouponCountersFromHistory(counts: any): void {
  const pages = ['savonCoupons', 'huilesEssentiellesCoupons', 'huileOliveCoupons', 'soinCoupons'];
  
  pages.forEach(pageKey => {
    try {
      const coupons = JSON.parse(localStorage.getItem(pageKey) || '[]');
      coupons.forEach((coupon: any) => {
        if (counts[coupon.code] !== undefined) {
          coupon.usedCount = counts[coupon.code];
        }
      });
      localStorage.setItem(pageKey, JSON.stringify(coupons));
    } catch (error) {
      console.error(`Erreur mise à jour ${pageKey}:`, error);
    }
  });
}

/**
 * Traiter les utilisations en attente
 */
traiterUtilisationsEnAttente(): void {
  try {
    const pending = JSON.parse(localStorage.getItem('pending_coupon_usages') || '[]');
    
    if (pending.length === 0) {
      this.showAlert('Aucune utilisation en attente', 'info');
      return;
    }
    
    console.log(`📦 Traitement de ${pending.length} utilisation(s) en attente...`);
    
    pending.forEach((usage: any) => {
      // Traiter chaque utilisation
      this.incrementCouponUsageFromEvent(usage);
    });
    
    // Vider la file d'attente
    localStorage.removeItem('pending_coupon_usages');
    
    this.showAlert(`${pending.length} utilisation(s) traitée(s) avec succès`, 'success');
    
  } catch (error) {
    console.error('❌ Erreur traitement attente:', error);
    this.showAlert('Erreur lors du traitement', 'error');
  }
}
// Dans admin.ts, vers la ligne 9860-9880 environ
// Remplacez la méthode setupCouponUsageListener par ceci :

/**
 * Configuration des écouteurs d'événements pour les coupons
 */

/**
 * Configuration des écouteurs d'événements pour les coupons
 */
private setupCouponUsageListener(): void {
  console.log('👂 Configuration écouteur d\'utilisation des coupons...');
  
  // Écouter les événements personnalisés
  window.addEventListener('couponUsed', (event: any) => {
    console.log('🔔 Événement couponUsed reçu:', event.detail);
    if (event.detail && event.detail.couponCode) {
      this.incrementCouponUsageFromEvent(event.detail);
    }
  });
  
  window.addEventListener('newOrderReceived', (event: any) => {
    console.log('📦 Événement newOrderReceived reçu:', event.detail);
    if (event.detail && event.detail.couponCode) {
      this.incrementCouponUsageFromEvent({
        couponCode: event.detail.couponCode,
        orderNumber: event.detail.orderNumber,
        customerName: event.detail.customerName,
        orderAmount: event.detail.totalAmount,
        source: event.detail.source || 'unknown'
      });
    }
  });
  
  // Vérifier périodiquement les nouvelles utilisations
  setInterval(() => {
    this.checkForPendingCouponUsages();
  }, 5000);
}

/**
 * Incrémente le compteur d'un coupon à partir d'un événement
 */
private incrementCouponUsageFromEvent(data: any): void {
  console.log('📈 Traitement événement coupon:', data);
  
  const couponCode = data.couponCode;
  if (!couponCode) return;
  
  // Chercher le coupon dans la liste locale
  const couponIndex = this.coupons.findIndex(c => c.code === couponCode);
  
  if (couponIndex !== -1) {
    // Incrémenter le compteur
    const currentCount = this.coupons[couponIndex].usedCount || 0;
    this.coupons[couponIndex].usedCount = currentCount + 1;
    
    console.log(`✅ Compteur mis à jour pour ${couponCode}: ${currentCount} → ${this.coupons[couponIndex].usedCount}`);
    
    // Sauvegarder dans localStorage
    this.saveCouponCounters();
    
    // Mettre à jour l'affichage
    this.coupons = [...this.coupons];
    
    // Afficher une notification
    this.showAlert(`📊 Coupon ${couponCode} utilisé (${this.coupons[couponIndex].usedCount} utilisations)`, 'success');
    
    // Sauvegarder l'utilisation dans l'historique
    this.saveCouponUsageToHistory(data);
  } else {
    console.warn(`⚠️ Coupon ${couponCode} non trouvé dans la liste locale`);
    this.findAndUpdateCouponInStorage(couponCode, data);
  }
}

/**
 * Sauvegarde les compteurs de coupons dans localStorage
 */


/**
 * Sauvegarde l'utilisation dans l'historique
 */

/**
 * Cherche et met à jour un coupon dans localStorage
 */
private findAndUpdateCouponInStorage(couponCode: string, data: any): void {
  try {
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    const couponIndex = adminCoupons.findIndex((c: any) => c.code === couponCode);
    
    if (couponIndex !== -1) {
      const currentCount = adminCoupons[couponIndex].usedCount || 0;
      adminCoupons[couponIndex].usedCount = currentCount + 1;
      adminCoupons[couponIndex].lastUsedAt = new Date().toISOString();
      
      localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
      
      this.coupons = adminCoupons;
      
      console.log(`✅ Coupon ${couponCode} mis à jour dans localStorage: ${currentCount} → ${adminCoupons[couponIndex].usedCount}`);
      
      this.updatePageCouponCounters(couponCode, adminCoupons[couponIndex].usedCount);
      
      this.showAlert(`📊 Coupon ${couponCode} mis à jour (${adminCoupons[couponIndex].usedCount} utilisations)`, 'success');
    }
  } catch (error) {
    console.error('❌ Erreur recherche coupon dans storage:', error);
  }
}

/**
 * Met à jour les compteurs dans les pages spécifiques
 */


/**
 * Vérifie les utilisations en attente
 */

/**
 * Fonction de diagnostic pour les événements
 */
diagnosticEvenements(): void {
  console.log('🔍 DIAGNOSTIC DES ÉVÉNEMENTS');
  console.log('============================');
  
  // Vérifier les écouteurs d'événements
  console.log('📋 Écouteurs configurés:');
  console.log('- couponUsed: ✓');
  console.log('- newOrderReceived: ✓');
  console.log('- newSoinOrder: ✓');
  console.log('- adminCouponsUpdated: ✓');
  
  // Vérifier les données dans localStorage
  try {
    const adminCoupons = localStorage.getItem('adminCoupons');
    const couponCounters = localStorage.getItem('coupon_counters');
    const usageHistory = localStorage.getItem('coupon_usage_history');
    
    console.log('📦 Données localStorage:');
    console.log(`- adminCoupons: ${adminCoupons ? JSON.parse(adminCoupons).length : 0} coupons`);
    console.log(`- coupon_counters: ${couponCounters ? Object.keys(JSON.parse(couponCounters)).length : 0} compteurs`);
    console.log(`- usage_history: ${usageHistory ? JSON.parse(usageHistory).length : 0} entrées`);
  } catch (error) {
    console.error('❌ Erreur lecture localStorage:', error);
  }
  
  // Afficher une notification
  this.showAlert('Diagnostic terminé - Voir console (F12)', 'info');
}
// Dans AdminService
incrementCouponUsageLocally(couponCode: string): void {
  console.log(`📈 Incrémentation locale du coupon: ${couponCode}`);
  
  // Récupérer les coupons actuels
  const coupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
  
  // Trouver le coupon
  const couponIndex = coupons.findIndex((c: any) => c.code === couponCode);
  
  if (couponIndex !== -1) {
    // Incrémenter le compteur
    coupons[couponIndex].usedCount = (coupons[couponIndex].usedCount || 0) + 1;
    coupons[couponIndex].lastUsedAt = new Date().toISOString();
    
    // Sauvegarder
    localStorage.setItem('adminCoupons', JSON.stringify(coupons));
    
    console.log(`✅ Nouveau compteur: ${coupons[couponIndex].usedCount}`);
    
    // Mettre à jour les compteurs séparés
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    counters[couponCode] = coupons[couponIndex].usedCount;
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    
    // Émettre un événement
    window.dispatchEvent(new CustomEvent('couponUsageUpdated', {
      detail: { couponCode, usedCount: coupons[couponIndex].usedCount }
    }));
  } else {
    console.warn(`⚠️ Coupon ${couponCode} non trouvé`);
  }
}
// Dans AdminComponent
simulateOrderWithCoupon(): void {
  // Sélectionner un coupon aléatoire
  const activeCoupons = this.coupons.filter(c => c.isActive && !this.isCouponExpired(c));
  
  if (activeCoupons.length === 0) {
    this.showAlert('Aucun coupon actif disponible', 'warning');
    return;
  }
  
  const randomCoupon = activeCoupons[Math.floor(Math.random() * activeCoupons.length)];
  const orderNumber = `SIM-${Date.now()}`;
  const orderAmount = Math.floor(Math.random() * 200) + 50;
  
  // Calculer la réduction
  let discountAmount = 0;
  if (randomCoupon.discountType === 'PERCENTAGE') {
    discountAmount = orderAmount * (randomCoupon.discountValue / 100);
  } else {
    discountAmount = Math.min(randomCoupon.discountValue, orderAmount);
  }
  
  const finalAmount = orderAmount - discountAmount;
  
  console.log('🛒 Simulation commande:', {
    coupon: randomCoupon.code,
    orderNumber,
    orderAmount,
    discountAmount,
    finalAmount
  });
  
  // Incrémenter le compteur
  this.incrementCouponCount(randomCoupon.code, {
    orderNumber,
    customerName: 'Client Test',
    customerEmail: 'test@example.com',
    orderAmount,
    discountAmount
  });
  
  this.showAlert(
    `✅ Commande simulée avec ${randomCoupon.code} - ${this.formatCurrency(discountAmount)} économisés`,
    'success'
  );
}





forceReloadCoupons(): void {
  this.loadCoupons();
  setTimeout(() => {
    this.showAlert(`📊 ${this.coupons.length} coupons chargés avec leurs compteurs`, 'success');
  }, 1000);
}
/**
 * 🔥 SOLUTION: Incrémenter les compteurs de coupons lors de la confirmation d'une commande
 * À appeler dans confirmOrder() et processOrderConfirmation()
 */
private incrementCouponCountersFromOrder(order: CustomerOrder): void {
  console.log('🎫 Vérification du coupon dans la commande:', order);
  
  // Vérifier si la commande a un coupon
  if (!order.couponCode) {
    console.log('ℹ️ Aucun coupon dans cette commande');
    return;
  }
  
  const couponCode = order.couponCode;
  console.log(`✅ Coupon trouvé: ${couponCode}`);
  
  // 1. Mettre à jour le coupon dans la liste locale
  const couponIndex = this.coupons.findIndex(c => c.code === couponCode);
  
  if (couponIndex !== -1) {
    const currentCount = this.coupons[couponIndex].usedCount || 0;
    this.coupons[couponIndex].usedCount = currentCount + 1;
    
    console.log(`📈 Compteur mis à jour: ${currentCount} → ${this.coupons[couponIndex].usedCount}`);
    
    // 2. Sauvegarder dans localStorage
    this.saveCouponCounters();
    
    // 3. Sauvegarder l'historique
    this.saveCouponUsageToHistory({
      couponCode: couponCode,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderAmount: order.totalAmount,
      discountAmount: order.discountAmount || 0,
      source: order.source || 'unknown'
    });
    
    // 4. Mettre à jour l'affichage
    this.coupons = [...this.coupons];
    
    // 5. Synchroniser vers toutes les pages
    setTimeout(() => {
      this.syncCouponsToPages();
    }, 100);
    
    this.showAlert(`🎟️ Coupon ${couponCode} utilisé (${this.coupons[couponIndex].usedCount} utilisations)`, 'success');
  } else {
    console.warn(`⚠️ Coupon ${couponCode} non trouvé dans la liste`);
    
    // Chercher dans le localStorage
    this.findAndUpdateCouponInStorage(couponCode, {
      couponCode: couponCode,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderAmount: order.totalAmount
    });
  }
}

/**
 * 📝 Sauvegarde l'historique d'utilisation des coupons
 */
private saveCouponUsageToHistory(data: any): void {
  try {
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    
    history.push({
      id: Date.now(),
      couponCode: data.couponCode,
      orderNumber: data.orderNumber || 'N/A',
      customerName: data.customerName || 'Inconnu',
      orderAmount: data.orderAmount || 0,
      discountAmount: data.discountAmount || 0,
      usedAt: new Date().toISOString(),
      source: data.source || 'admin'
    });
    
    localStorage.setItem('coupon_usage_history', JSON.stringify(history));
    console.log('📝 Historique sauvegardé');
  } catch (error) {
    console.error('❌ Erreur sauvegarde historique:', error);
  }
}

/**
 * 💾 Sauvegarde les compteurs de coupons
 */
private saveCouponCounters(): void {
  try {
    // Sauvegarder la liste complète
    localStorage.setItem('adminCoupons', JSON.stringify(this.coupons));
    
    // Sauvegarder juste les compteurs
    const counters: { [key: string]: number } = {};
    this.coupons.forEach(c => {
      counters[c.code] = c.usedCount || 0;
    });
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    
    console.log('💾 Compteurs sauvegardés');
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error);
  }
}

/**
 * 🔄 Mettre à jour les statistiques des coupons dans l'interface
 */
public updateAllCouponStats(): void {
  console.log('🔄 Mise à jour des statistiques coupons...');
  
  // Recharger l'historique
  try {
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    const counters: { [key: string]: number } = {};
    
    history.forEach((h: any) => {
      counters[h.couponCode] = (counters[h.couponCode] || 0) + 1;
    });
    
    // Mettre à jour chaque coupon
    this.coupons.forEach(coupon => {
      if (counters[coupon.code] !== undefined) {
        coupon.usedCount = counters[coupon.code];
      }
    });
    
    // Sauvegarder
    localStorage.setItem('adminCoupons', JSON.stringify(this.coupons));
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    
    // Forcer la mise à jour de l'affichage
    this.coupons = [...this.coupons];
    
    console.log('✅ Statistiques coupons mises à jour');
    this.showAlert('Statistiques coupons mises à jour', 'success');
    
  } catch (error) {
    console.error('❌ Erreur mise à jour stats:', error);
  }
}
// Dans AdminService, ajoutez cette méthode d'initialisation automatique

/**
 * Initialise le système de comptage automatique des coupons
 * À appeler une seule fois au démarrage de l'application
 */
initializeAutoCouponCounting(): void {
  console.log('🚀 INITIALISATION DU COMPTAGE AUTOMATIQUE DES COUPONS');
  
  // 1. Créer un écouteur global pour intercepter TOUTES les utilisations de coupons
  this.setupGlobalCouponListener();
  
  // 2. Synchroniser avec l'historique existant
  this.syncWithExistingHistory();
  
  // 3. Vérifier périodiquement les nouvelles utilisations
  this.startPeriodicCheck();
}

/**
 * Écouteur global pour TOUTES les utilisations de coupons
 */
private setupGlobalCouponListener(): void {
  if (typeof window === 'undefined') return;
  
  // Écouter les événements personnalisés
  window.addEventListener('coupon-used', (event: any) => {
    console.log('🔔 Événement coupon-used capturé:', event.detail);
    this.processCouponUsage(event.detail);
  });
  
  // Écouter les nouvelles commandes
  window.addEventListener('new-order', (event: any) => {
    console.log('📦 Nouvelle commande détectée:', event.detail);
    if (event.detail?.couponCode) {
      this.processCouponUsage(event.detail);
    }
  });
  
  // Intercepter localStorage (solution de secours)
  this.interceptLocalStorage();
}

/**
 * Intercepter les modifications du localStorage
 */
private interceptLocalStorage(): void {
  const originalSetItem = localStorage.setItem;
  
  localStorage.setItem = (key: string, value: string) => {
    // Appeler la méthode originale
    originalSetItem.call(localStorage, key, value);
    
    // Vérifier si c'est une commande avec coupon
    if (key === 'admin_all_orders' || key.includes('order')) {
      try {
        const data = JSON.parse(value);
        if (Array.isArray(data)) {
          data.forEach(order => {
            if (order.couponCode) {
              this.processCouponUsage({
                couponCode: order.couponCode,
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                orderAmount: order.totalAmount
              });
            }
          });
        }
      } catch (e) {}
    }
  };
}

/**
 * Synchroniser avec l'historique existant
 */
private syncWithExistingHistory(): void {
  try {
    // Lire TOUS les coupons dans le localStorage
    const allCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    const allOrders = JSON.parse(localStorage.getItem('admin_all_orders') || '[]');
    
    console.log(`📊 Analyse de ${allOrders.length} commandes et ${allCoupons.length} coupons...`);
    
    // Compter les utilisations par coupon
    const usageCounts: { [key: string]: number } = {};
    
    allOrders.forEach((order: any) => {
      if (order.couponCode) {
        usageCounts[order.couponCode] = (usageCounts[order.couponCode] || 0) + 1;
      }
    });
    
    // Lire l'historique existant
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    history.forEach((h: any) => {
      if (h.couponCode) {
        usageCounts[h.couponCode] = Math.max(
          usageCounts[h.couponCode] || 0,
          h.count || 1
        );
      }
    });
    
    console.log('📈 Compteurs calculés:', usageCounts);
    
    // Mettre à jour TOUS les coupons
    this.updateAllCouponCounters(usageCounts);
    
  } catch (error) {
    console.error('❌ Erreur synchronisation:', error);
  }
}

/**
 * Mettre à jour TOUS les compteurs de coupons
 */
private updateAllCouponCounters(counts: { [key: string]: number }): void {
  try {
    // 1. Mettre à jour adminCoupons
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    let updated = false;
    
    adminCoupons.forEach((coupon: any) => {
      if (counts[coupon.code] !== undefined && coupon.usedCount !== counts[coupon.code]) {
        coupon.usedCount = counts[coupon.code];
        updated = true;
      }
    });
    
    if (updated) {
      localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
    }
    
    // 2. Mettre à jour les compteurs
    localStorage.setItem('coupon_counters', JSON.stringify(counts));
    
    // 3. Mettre à jour TOUTES les pages
    ['savonCoupons', 'huilesEssentiellesCoupons', 'huileOliveCoupons', 'soinCoupons'].forEach(page => {
      try {
        const pageCoupons = JSON.parse(localStorage.getItem(page) || '[]');
        let pageUpdated = false;
        
        pageCoupons.forEach((coupon: any) => {
          if (counts[coupon.code] !== undefined) {
            coupon.usedCount = counts[coupon.code];
            pageUpdated = true;
          }
        });
        
        if (pageUpdated) {
          localStorage.setItem(page, JSON.stringify(pageCoupons));
        }
      } catch (e) {}
    });
    
    // 4. Émettre des événements
    this.emitUpdateEvents();
    
  } catch (error) {
    console.error('❌ Erreur mise à jour compteurs:', error);
  }
}

/**
 * Traiter une utilisation de coupon
 */
private processCouponUsage(data: any): void {
  if (!data?.couponCode) return;
  
  const couponCode = data.couponCode;
  console.log(`🔄 Traitement automatique: ${couponCode}`);
  
  try {
    // 1. Mettre à jour adminCoupons
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    const couponIndex = adminCoupons.findIndex((c: any) => c.code === couponCode);
    
    if (couponIndex !== -1) {
      const currentCount = adminCoupons[couponIndex].usedCount || 0;
      adminCoupons[couponIndex].usedCount = currentCount + 1;
      adminCoupons[couponIndex].lastUsedAt = new Date().toISOString();
      
      localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
      console.log(`✅ ${couponCode}: ${currentCount} → ${adminCoupons[couponIndex].usedCount}`);
    }
    
    // 2. Mettre à jour les compteurs
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    counters[couponCode] = (counters[couponCode] || 0) + 1;
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    
    // 3. Ajouter à l'historique
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    history.push({
      couponCode: couponCode,
      orderNumber: data.orderNumber || 'N/A',
      customerName: data.customerName || 'Inconnu',
      orderAmount: data.orderAmount || 0,
      usedAt: new Date().toISOString(),
      source: data.source || 'auto'
    });
    localStorage.setItem('coupon_usage_history', JSON.stringify(history));
    
    // 4. Mettre à jour les pages
    this.updatePageCounters(couponCode, counters[couponCode]);
    
    // 5. Émettre un événement
    this.emitUpdateEvents();
    
  } catch (error) {
    console.error('❌ Erreur traitement:', error);
  }
}

/**
 * Mettre à jour les compteurs des pages
 */


/**
 * Émettre des événements de mise à jour
 */
private emitUpdateEvents(): void {
  if (typeof window === 'undefined') return;
  
  window.dispatchEvent(new Event('adminCouponsUpdated'));
  window.dispatchEvent(new Event('savonCouponsUpdated'));
  window.dispatchEvent(new Event('huilesEssentiellesCouponsUpdated'));
  window.dispatchEvent(new Event('huileOliveCouponsUpdated'));
  window.dispatchEvent(new Event('soinCouponsUpdated'));
}

/**
 * Vérification périodique
 */
private startPeriodicCheck(): void {
  setInterval(() => {
    this.checkForNewUsages();
  }, 5000); // Toutes les 5 secondes
}

/**
 * Vérifier les nouvelles utilisations
 */
private checkForNewUsages(): void {
  try {
    // Vérifier les commandes récentes
    const allOrders = JSON.parse(localStorage.getItem('admin_all_orders') || '[]');
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    
    allOrders.forEach((order: any) => {
      if (order.couponCode && order.status === 'CONFIRMED') {
        const currentCount = counters[order.couponCode] || 0;
        const orderCount = 1; // Chaque commande = 1 utilisation
        
        // Vérifier si ce n'est pas déjà compté
        const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
        const alreadyCounted = history.some((h: any) => 
          h.orderNumber === order.orderNumber && h.couponCode === order.couponCode
        );
        
        if (!alreadyCounted) {
          this.processCouponUsage({
            couponCode: order.couponCode,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            orderAmount: order.totalAmount,
            source: 'periodic-check'
          });
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur vérification périodique:', error);
  }
}
// Dans AdminComponent, modifier ngOnInit :



private incrementLocalCouponUsage(couponCode: string, orderData?: any): void {
  console.log(`📈 Incrémentation locale du coupon: ${couponCode}`);
  
  try {
    // 1. Mettre à jour dans le composant
    const couponIndex = this.coupons.findIndex(c => c.code === couponCode);
    
    if (couponIndex !== -1) {
      const currentCount = this.coupons[couponIndex].usedCount || 0;
      this.coupons[couponIndex].usedCount = currentCount + 1;
      console.log(`✅ Composant: ${currentCount} → ${this.coupons[couponIndex].usedCount}`);
    }
    
    // 2. Mettre à jour dans localStorage
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    const storageIndex = adminCoupons.findIndex((c: any) => c.code === couponCode);
    
    if (storageIndex !== -1) {
      const currentStorage = adminCoupons[storageIndex].usedCount || 0;
      adminCoupons[storageIndex].usedCount = currentStorage + 1;
      localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
    }
    
    // 3. Mettre à jour les compteurs
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    counters[couponCode] = (counters[couponCode] || 0) + 1;
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    
    // 4. Ajouter à l'historique
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    history.push({
      couponCode: couponCode,
      orderNumber: orderData?.orderNumber || 'N/A',
      customerName: orderData?.customerName || 'Inconnu',
      usedAt: new Date().toISOString()
    });
    localStorage.setItem('coupon_usage_history', JSON.stringify(history));
    
    // 5. Forcer la mise à jour
    this.coupons = [...this.coupons];
    
    // 6. Afficher notification
    const newCount = this.coupons.find(c => c.code === couponCode)?.usedCount || 0;
    this.showAlert(`📊 ${couponCode}: ${newCount} utilisations`, 'success');
    
  } catch (error) {
    console.error('❌ Erreur incrémentation:', error);
  }
}

/**
 * ✅ MÉTHODE CORRIGÉE DANS AdminService
 * Utiliser un coupon et incrémenter le compteur
 */

/**
 * Met à jour les compteurs dans les pages spécifiques
 */

/**
 * ✅ MÉTHODE À APPELER LORS DE LA CONFIRMATION D'UNE COMMANDE
 * Dans AdminComponent, dans confirmOrder() ou processOrderConfirmation()
 */
private incrementCouponFromOrder(order: CustomerOrder): void {
  if (!order.couponCode) {
    console.log('ℹ️ Aucun coupon dans cette commande');
    return;
  }
  
  console.log(`🎫 Traitement du coupon ${order.couponCode} depuis la commande ${order.orderNumber}`);
  
  // Récupérer les coupons admin
  const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
  const couponIndex = adminCoupons.findIndex((c: any) => c.code === order.couponCode);
  
  if (couponIndex !== -1) {
    const currentCount = adminCoupons[couponIndex].usedCount || 0;
    const newCount = currentCount + 1;
    
    // Mettre à jour
    adminCoupons[couponIndex].usedCount = newCount;
    adminCoupons[couponIndex].lastUsedAt = new Date().toISOString();
    
    // Sauvegarder
    localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
    
    // Mettre à jour les compteurs
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    counters[order.couponCode] = (counters[order.couponCode] || 0) + 1;
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    
    // Ajouter à l'historique
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    history.push({
      couponCode: order.couponCode,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderAmount: order.totalAmount,
      discountAmount: order.discountAmount || 0,
      usedAt: new Date().toISOString(),
      source: order.source || 'unknown'
    });
    localStorage.setItem('coupon_usage_history', JSON.stringify(history));
    
    // Mettre à jour les coupons dans le composant
    const localIndex = this.coupons.findIndex(c => c.code === order.couponCode);
    if (localIndex !== -1) {
      this.coupons[localIndex].usedCount = newCount;
      this.coupons = [...this.coupons];
    }
    
    // Mettre à jour les pages
    this.updatePageCouponCounters(order.couponCode, newCount);
    
    // Émettre les événements
    this.emitCouponUpdateEvents(order.couponCode, newCount);
    
    console.log(`✅ Compteur incrémenté: ${currentCount} → ${newCount}`);
    this.showAlert(`📊 Coupon ${order.couponCode} utilisé (${newCount} utilisations)`, 'success');
    
  } else {
    console.warn(`⚠️ Coupon ${order.couponCode} non trouvé dans adminCoupons`);
    
    // Créer le coupon s'il n'existe pas
    adminCoupons.push({
      code: order.couponCode,
      usedCount: 1,
      lastUsedAt: new Date().toISOString(),
      isActive: true,
      discountValue: 10,
      discountType: 'PERCENTAGE'
    });
    localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
    console.log(`✅ Nouveau coupon créé: ${order.couponCode}`);
  }
}

/**
 * Met à jour les compteurs des pages
 */

/**
 * Émet des événements de mise à jour
 */

/**
 * ✅ MÉTHODE PRINCIPALE POUR INCRÉMENTER UN COUPON
 * À appeler quand une commande avec coupon est confirmée
 */

/**
 * ✅ Confirmer une commande et incrémenter le coupon si présent
 */

/**
 * ✅ Confirmer une commande et incrémenter automatiquement le coupon
 */

/**
 * Synchroniser les coupons vers toutes les pages
 */
syncCouponsToPages(): void {
  console.log('🔄 Synchronisation des coupons vers les pages...');
  
  // Sauvegarder tous les coupons dans adminCoupons
  localStorage.setItem('adminCoupons', JSON.stringify(this.coupons));
  
  // Filtrer les coupons actifs
  const activeCoupons = this.coupons.filter(coupon => 
    coupon.isActive && !this.isCouponExpired(coupon)
  );
  
  // Distribuer aux différentes pages
  const savonCoupons: Coupon[] = [];
  const huilesCoupons: Coupon[] = [];
  const oliveCoupons: Coupon[] = [];
  const soinCoupons: Coupon[] = [];
  
  activeCoupons.forEach(coupon => {
    // Si coupon universel (pas de produits spécifiques)
    if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
      savonCoupons.push(coupon);
      huilesCoupons.push(coupon);
      oliveCoupons.push(coupon);
      soinCoupons.push(coupon);
      return;
    }
    
    // Vérifier les produits applicables
    let hasSavon = false;
    let hasHuiles = false;
    let hasOlive = false;
    let hasSoin = false;
    
    coupon.applicableProducts.forEach(productId => {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        if (this.isSavonProduct(product)) hasSavon = true;
        if (this.isHuilesEssentiellesProduct(product)) hasHuiles = true;
        if (this.isHuileOliveProduct(product)) hasOlive = true;
        if (this.isSoinProduct(product)) hasSoin = true;
      }
    });
    
    if (hasSavon) savonCoupons.push(coupon);
    if (hasHuiles) huilesCoupons.push(coupon);
    if (hasOlive) oliveCoupons.push(coupon);
    if (hasSoin) soinCoupons.push(coupon);
  });
  
  // Sauvegarder dans localStorage
  localStorage.setItem('savonCoupons', JSON.stringify(savonCoupons));
  localStorage.setItem('huilesEssentiellesCoupons', JSON.stringify(huilesCoupons));
  localStorage.setItem('huileOliveCoupons', JSON.stringify(oliveCoupons));
  localStorage.setItem('soinCoupons', JSON.stringify(soinCoupons));
  
  // Émettre des événements
  window.dispatchEvent(new Event('savonCouponsUpdated'));
  window.dispatchEvent(new Event('huilesEssentiellesCouponsUpdated'));
  window.dispatchEvent(new Event('huileOliveCouponsUpdated'));
  window.dispatchEvent(new Event('soinCouponsUpdated'));
  
  this.showAlert(`${activeCoupons.length} coupons synchronisés vers les pages`, 'success');
}

/**
 * Confirmer une commande
 */


/**
 * Expédier une commande
 */
shipOrder(order: CustomerOrder | string): void {
  console.log('🚚 Expédition commande:', order);
  
  let targetOrder: CustomerOrder | undefined;
  
  if (typeof order === 'string') {
    targetOrder = this.orders.find(o => o.orderNumber === order);
  } else {
    targetOrder = order;
  }
  
  if (!targetOrder) {
    this.showAlert('Commande non trouvée', 'error');
    return;
  }
  
  if (targetOrder.status !== 'CONFIRMED') {
    this.showAlert('La commande doit être confirmée avant d\'être expédiée', 'warning');
    return;
  }
  
  const trackingNumber = prompt('Entrez le numéro de suivi (optionnel):');
  if (trackingNumber === null) return;
  
  targetOrder.status = 'SHIPPED';
  targetOrder.trackingNumber = trackingNumber || '';
  targetOrder.updatedAt = new Date().toISOString();
  
  this.updateOrderInStorage(targetOrder);
  this.updateOrderInList(targetOrder);
  
  this.showAlert(`Commande #${targetOrder.orderNumber} marquée comme expédiée!`, 'success');
}

/**
 * Sauvegarder un coupon
 */

/**
 * Mettre à jour la commande dans la liste affichée
 */

/**
 * Incrémenter le compteur d'un coupon
 */

/**
 * Marquer tous les champs d'un formulaire comme touchés
 */

// ==================== MÉTHODES CORRIGÉES POUR LES COUPONS ====================

/**
 * ✅ Charge les coupons depuis l'API et synchronise avec les compteurs locaux
 */
// Dans AdminComponent - REMPLACEZ la méthode confirmOrder existante

/**
 * ✅ Incrémente le compteur d'un coupon
 * À appeler quand une commande avec coupon est confirmée
 */


/**
 * ✅ Met à jour les compteurs dans toutes les pages
 */


/**
 * ✅ Émet des événements pour mettre à jour l'interface
 */

/**
 * ✅ Récupère l'historique des utilisations d'un coupon
 */
getCouponUsageHistory(couponCode?: string): any[] {
  try {
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    
    if (couponCode) {
      return history.filter((h: any) => h.couponCode === couponCode)
        .sort((a: any, b: any) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());
    }
    
    return history.sort((a: any, b: any) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());
  } catch (error) {
    console.error('❌ Erreur récupération historique:', error);
    return [];
  }
}

/**
 * ✅ Obtient les statistiques détaillées d'un coupon
 */
getCouponDetailedStats(couponCode: string): any {
  const history = this.getCouponUsageHistory(couponCode);
  const coupon = this.coupons.find(c => c.code === couponCode);
  
  const totalUses = history.length;
  const totalDiscount = history.reduce((sum, h) => sum + (h.discountAmount || 0), 0);
  const uniqueCustomers = new Set(history.map(h => h.customerEmail)).size;
  
  // Commandes avec ce coupon
  const allOrders = JSON.parse(localStorage.getItem('admin_all_orders') || '[]');
  const ordersWithCoupon = allOrders.filter((o: any) => o.couponCode === couponCode);
  const confirmedOrders = ordersWithCoupon.filter((o: any) => 
    o.status === 'CONFIRMED' || o.status === 'DELIVERED'
  ).length;
  
  return {
    couponCode,
    coupon: coupon,
    totalUses: totalUses,
    totalDiscount: totalDiscount,
    averageDiscount: totalUses > 0 ? totalDiscount / totalUses : 0,
    uniqueCustomers: uniqueCustomers,
    firstUse: history.length > 0 ? history[history.length - 1].usedAt : null,
    lastUse: history.length > 0 ? history[0].usedAt : null,
    ordersWithCoupon: ordersWithCoupon.length,
    confirmedOrders: confirmedOrders,
    usageHistory: history.slice(0, 10) // 10 dernières utilisations
  };
}

/**
 * ✅ Réinitialise tous les compteurs de coupons
 */
resetAllCouponCounters(): void {
  if (!confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser TOUS les compteurs de coupons à 0 ?')) {
    return;
  }
  
  console.log('🔄 Réinitialisation de tous les compteurs...');
  
  try {
    // Mettre à jour les coupons dans le composant
    this.coupons.forEach(coupon => {
      coupon.usedCount = 0;
    });
    
    // Mettre à jour adminCoupons
    localStorage.setItem('adminCoupons', JSON.stringify(this.coupons));
    
    // Vider les compteurs
    localStorage.setItem('coupon_counters', JSON.stringify({}));
    
    // Vider l'historique
    localStorage.setItem('coupon_usage_history', JSON.stringify([]));
    
    // Mettre à jour les pages
    this.syncCouponsToPages();
    
    // Forcer la mise à jour de l'affichage
    this.coupons = [...this.coupons];
    
    this.showAlert('✅ Tous les compteurs ont été réinitialisés', 'success');
    
  } catch (error) {
    console.error('❌ Erreur réinitialisation:', error);
    this.showAlert('Erreur lors de la réinitialisation', 'error');
  }
}

/**
 * ✅ Resynchronise tous les compteurs à partir de l'historique
 */


/**
 * ✅ Vérifie les utilisations en attente
 */


/**
 * ✅ Force la mise à jour de tous les compteurs
 */

/**
 * ✅ Teste manuellement l'incrémentation d'un coupon
 */
testIncrementNow(couponCode: string): void {
  console.log(`🧪 TEST MANUEL: Incrémentation de ${couponCode}`);
  
  // Trouver le coupon
  const couponIndex = this.coupons.findIndex(c => c.code === couponCode);
  if (couponIndex === -1) {
    this.showAlert(`Coupon ${couponCode} non trouvé!`, 'error');
    return;
  }
  
  // Incrémenter
  this.incrementCouponUsage(couponCode, {
    orderNumber: `TEST-${Date.now()}`,
    customerName: 'Test Manuel',
    customerEmail: 'test@example.com',
    orderAmount: 100,
    discountAmount: 20,
    source: 'test'
  });
  
  this.showAlert(`✅ Test d'incrémentation lancé pour ${couponCode}`, 'success');
}

/**
 * ✅ Ouvre le détail d'une commande
 */
openOrderDetail(order: CustomerOrder | null): void {
  console.log('📋 Ouverture détail commande:', order);
  
  if (!order) {
    // Nouvelle commande
    this.selectedOrder = {
      id: Date.now(),
      orderNumber: `CMD-${Date.now()}`,
      customerName: '',
      customerEmail: '',
      status: 'PENDING',
      orderDate: new Date().toISOString(),
      subtotal: 0,
      shippingCost: 0,
      totalAmount: 0,
      orderItems: [],
      source: 'MANUAL',
      isTemporary: true
    } as CustomerOrder;
  } else {
    // Commande existante
    this.selectedOrder = { ...order };
    
    // Garantir un ID valide
    if (!this.selectedOrder.id || this.selectedOrder.id <= 0) {
      this.selectedOrder.id = this.extractOrGenerateOrderId(this.selectedOrder);
    }
  }
  
  // Mettre à jour le formulaire
  this.orderStatusForm.patchValue({
    status: this.selectedOrder.status,
    trackingNumber: this.selectedOrder.trackingNumber || '',
    notes: this.selectedOrder.notes || ''
  });
  
  this.modals.orderDetail = true;
}

/**
 * ✅ Extrait ou génère un ID pour une commande
 */
private extractOrGenerateOrderId(order: CustomerOrder): number {
  // 1. Extraire de l'orderNumber
  if (order.orderNumber) {
    const match = order.orderNumber.match(/\d+/g);
    if (match && match.length > 0) {
      const extractedId = parseInt(match.join(''), 10);
      if (!isNaN(extractedId) && extractedId > 0) {
        return extractedId;
      }
    }
  }
  
  // 2. Générer basé sur le timestamp
  return Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * ✅ Met à jour une commande dans le stockage
 */
private updateOrderInStorage(order: CustomerOrder): void {
  try {
    const allOrders = JSON.parse(localStorage.getItem('admin_all_orders') || '[]');
    const existingIndex = allOrders.findIndex((o: any) => o.orderNumber === order.orderNumber);
    
    if (existingIndex !== -1) {
      allOrders[existingIndex] = { ...order, lastUpdate: new Date().toISOString() };
    } else {
      allOrders.unshift({ ...order, synchronizedAt: new Date().toISOString() });
    }
    
    localStorage.setItem('admin_all_orders', JSON.stringify(allOrders));
    console.log('💾 Commande sauvegardée dans le stockage');
  } catch (error) {
    console.error('❌ Erreur sauvegarde stockage:', error);
  }
}

/**
 * ✅ Met à jour la commande dans la liste affichée
 */
private updateOrderInList(updatedOrder: CustomerOrder): void {
  const index = this.orders.findIndex(o => o.orderNumber === updatedOrder.orderNumber);
  if (index !== -1) {
    this.orders[index] = { ...updatedOrder };
  } else {
    this.orders.unshift(updatedOrder);
  }
  this.orders = [...this.orders];
}

/**
 * ✅ Charge les coupons (déjà défini plus haut)
 */


/**
 * ✅ Sauvegarde un coupon
 */
saveCoupon(): void {
  if (this.couponForm.invalid) {
    this.showAlert('Veuillez corriger les erreurs du formulaire', 'warning');
    this.markFormGroupTouched(this.couponForm);
    return;
  }

  console.log('🎫 Sauvegarde coupon...');
  this.loading.action = true;
  
  const formatDateForBackend = (dateString: string): string => {
    if (!dateString || dateString.trim() === '') return '';
    if (dateString.length === 10 && dateString.includes('-')) {
      return `${dateString}T00:00:00`;
    }
    return dateString;
  };

  const couponData = this.couponForm.value;
  
  const couponToSave: any = {
    code: couponData.code,
    discountValue: couponData.discountValue,
    discountType: couponData.discountType,
    expiryDate: formatDateForBackend(couponData.expiryDate),
    isActive: couponData.isActive !== undefined ? couponData.isActive : true,
    applicableProducts: this.selectedCouponProducts || []
  };

  if (couponData.description) couponToSave.description = couponData.description;
  if (couponData.maxUses && couponData.maxUses > 0) couponToSave.maxUses = couponData.maxUses;
  if (couponData.minOrderAmount && couponData.minOrderAmount > 0) couponToSave.minOrderAmount = couponData.minOrderAmount;
  if (couponData.startDate && couponData.startDate.trim() !== '') {
    couponToSave.startDate = formatDateForBackend(couponData.startDate);
  }
  if (couponData.discountExtra !== undefined) couponToSave.discountExtra = couponData.discountExtra;
  if (couponData.freeShipping !== undefined) couponToSave.freeShipping = couponData.freeShipping;

  const observable = this.selectedCoupon
    ? this.adminService.updateCoupon(this.selectedCoupon.id, couponToSave)
    : this.adminService.createCoupon(couponToSave);

  observable.subscribe({
    next: (response: ApiResponse<Coupon>) => {
      if (response.success) {
        const action = this.selectedCoupon ? 'modifié' : 'créé';
        this.showAlert(`Coupon ${action} avec succès`, 'success');
        this.modals.coupon = false;
        this.loadCoupons();
        setTimeout(() => this.syncCouponsToPages(), 100);
      } else {
        this.showAlert(response.message || 'Erreur lors de la sauvegarde', 'error');
      }
      this.loading.action = false;
    },
    error: (error) => {
      console.error('❌ Erreur sauvegarde coupon:', error);
      this.showAlert('Erreur lors de la sauvegarde', 'error');
      this.loading.action = false;
    }
  });
}

/**
 * ✅ Marque tous les champs d'un formulaire comme touchés
 */
private markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    if (control instanceof FormGroup) {
      this.markFormGroupTouched(control);
    } else {
      control?.markAsTouched();
    }
  });
}
// Méthode à ajouter dans AdminComponent pour remplacer le pipe filterByEmail
getOrdersByCustomerEmail(email: string): CustomerOrder[] {
  if (!email) return [];
  return this.orders.filter(order => 
    order.customerEmail.toLowerCase() === email.toLowerCase()
  );
}
/**
 * Obtient la date et heure courante formatée
 */
getCurrentDateTime(): string {
  return new Date().toISOString();
}

// Dans AdminComponent, ajoutez ces méthodes :

/**
 * Calcule le total des utilisations de coupons
 */
calculateTotalCouponUses(): number {
  return this.coupons.reduce((total, coupon) => total + (coupon.usedCount || 0), 0);
}

/**
 * Récupère les commandes d'un client spécifique
 */
getCustomerOrders(customerId: number): CustomerOrder[] {
  const customer = this.customers.find(c => c.id === customerId);
  if (!customer) return [];
  
  return this.orders
    .filter(order => order.customerEmail?.toLowerCase() === customer.email?.toLowerCase())
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
}
// ==================== MÉTHODE POUR INCRÉMENTER LE COMPTEUR DE COUPON ====================

/**
 * ✅ INCRÉMENTE LE COMPTEUR D'UTILISATIONS D'UN COUPON
 * Cette méthode doit être appelée automatiquement quand une commande avec coupon est confirmée
 * @param couponCode Code du coupon à incrémenter
 * @param orderData Données de la commande pour l'historique (optionnel)
 */

private updateAllPagesCouponCounters(couponCode: string, newCount: number): void {
  const pages = [
    { key: 'savonCoupons', event: 'savonCouponsUpdated' },
    { key: 'huilesEssentiellesCoupons', event: 'huilesEssentiellesCouponsUpdated' },
    { key: 'huileOliveCoupons', event: 'huileOliveCouponsUpdated' },
    { key: 'soinCoupons', event: 'soinCouponsUpdated' }
  ];
  
  pages.forEach(page => {
    try {
      const pageCoupons = JSON.parse(localStorage.getItem(page.key) || '[]');
      const index = pageCoupons.findIndex((c: any) => c.code === couponCode);
      
      if (index !== -1) {
        pageCoupons[index].usedCount = newCount;
        pageCoupons[index].lastUsedAt = new Date().toISOString();
        localStorage.setItem(page.key, JSON.stringify(pageCoupons));
        console.log(`✅ Page ${page.key} mise à jour: ${couponCode} = ${newCount} utilisations`);
        
        // Émettre un événement spécifique à cette page
        window.dispatchEvent(new Event(page.event));
      }
    } catch (error) {
      console.error(`❌ Erreur mise à jour ${page.key}:`, error);
    }
  });
}

/**
 * ✅ ÉMET DES ÉVÉNEMENTS POUR METTRE À JOUR TOUTES LES INTERFACES
 * @param couponCode Code du coupon
 * @param newCount Nouveau compteur
 */
private emitCouponUpdateEvents(couponCode: string, newCount: number): void {
  // Événement général pour l'admin
  window.dispatchEvent(new CustomEvent('adminCouponsUpdated', {
    detail: { 
      couponCode, 
      newCount, 
      timestamp: new Date().toISOString() 
    }
  }));
  
  // Événements spécifiques aux pages
  window.dispatchEvent(new Event('savonCouponsUpdated'));
  window.dispatchEvent(new Event('huilesEssentiellesCouponsUpdated'));
  window.dispatchEvent(new Event('huileOliveCouponsUpdated'));
  window.dispatchEvent(new Event('soinCouponsUpdated'));
  
  console.log(`📢 Événements émis pour ${couponCode}`);
}

/**
 * ✅ VERSION CORRIGÉE DE confirmOrder AVEC INCRÉMENTATION AUTOMATIQUE DU COUPON
 * À remplacer dans votre code existant
 */
confirmOrder(order: CustomerOrder | string): void {
  console.log('📦 Confirmation commande avec gestion automatique du coupon');
  
  // Récupérer la commande
  let targetOrder: CustomerOrder | undefined;
  
  if (typeof order === 'string') {
    targetOrder = this.orders.find(o => o.orderNumber === order);
    if (!targetOrder) {
      // Chercher dans le localStorage
      const allOrders = JSON.parse(localStorage.getItem('admin_all_orders') || '[]');
      targetOrder = allOrders.find((o: any) => o.orderNumber === order);
    }
  } else {
    targetOrder = order;
  }
  
  if (!targetOrder) {
    this.showAlert('Commande non trouvée', 'error');
    return;
  }
  
  // ✅ VÉRIFIER SI LA COMMANDE A UN COUPON
  if (targetOrder.couponCode) {
    console.log(`🎫 COUPON DÉTECTÉ: ${targetOrder.couponCode} dans la commande ${targetOrder.orderNumber}`);
    
    // INCRÉMENTER LE COMPTEUR DU COUPON AUTOMATIQUEMENT
    this.incrementCouponUsage(targetOrder.couponCode, {
      orderNumber: targetOrder.orderNumber,
      customerName: targetOrder.customerName,
      customerEmail: targetOrder.customerEmail,
      orderAmount: targetOrder.totalAmount,
      discountAmount: targetOrder.discountAmount || 0,
      source: targetOrder.source || 'unknown'
    });
  } else {
    console.log('ℹ️ Aucun coupon dans cette commande');
  }
  
  // Mettre à jour le statut de la commande
  targetOrder.status = 'CONFIRMED';
  targetOrder.updatedAt = new Date().toISOString();
  
  // Sauvegarder la commande mise à jour
  this.updateOrderInStorage(targetOrder);
  this.updateOrderInList(targetOrder);
  
  this.showAlert(`Commande #${targetOrder.orderNumber} confirmée avec succès!`, 'success');
}

/**
 * ✅ MÉTHODE POUR TESTER MANUELLEMENT L'INCRÉMENTATION D'UN COUPON
 * @param couponCode Code du coupon à tester
 */
testIncrementCoupon(couponCode: string): void {
  console.log(`🧪 TEST MANUEL: Incrémentation de ${couponCode}`);
  
  // Vérifier si le coupon existe
  const couponExists = this.coupons.some(c => c.code === couponCode);
  
  if (!couponExists) {
    if (!confirm(`Le coupon ${couponCode} n'existe pas. Voulez-vous le créer ?`)) {
      return;
    }
  }
  
  // Générer un numéro de commande de test
  const testOrderNumber = `TEST-${Date.now()}`;
  
  // Incrémenter le coupon
  this.incrementCouponUsage(couponCode, {
    orderNumber: testOrderNumber,
    customerName: 'Client Test',
    customerEmail: 'test@example.com',
    orderAmount: 100,
    discountAmount: 20,
    source: 'test'
  });
  
  this.showAlert(`✅ Test d'incrémentation lancé pour ${couponCode}`, 'success');
}

/**
 * ✅ MÉTHODE POUR AFFICHER L'HISTORIQUE D'UN COUPON
 * @param couponCode Code du coupon (optionnel)
 */
showCouponHistory(couponCode?: string): void {
  try {
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    
    let filteredHistory = history;
    if (couponCode) {
      filteredHistory = history.filter((h: any) => h.couponCode === couponCode);
    }
    
    if (filteredHistory.length === 0) {
      this.showAlert(`Aucun historique pour ${couponCode || 'tous les coupons'}`, 'info');
      return;
    }
    
    // Trier du plus récent au plus ancien
    filteredHistory.sort((a: any, b: any) => 
      new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime()
    );
    
    console.log(`📜 HISTORIQUE DES UTILISATIONS ${couponCode ? 'pour ' + couponCode : ''}:`);
    console.log('='.repeat(80));
    
    filteredHistory.slice(0, 10).forEach((h: any, index: number) => {
      console.log(`${index + 1}. ${h.couponCode} - Commande ${h.orderNumber} - ${new Date(h.usedAt).toLocaleString()}`);
      console.log(`   Client: ${h.customerName} - Montant: ${h.orderAmount}€ - Réduction: ${h.discountAmount}€`);
      console.log(`   Nouveau compteur: ${h.newCount}`);
      console.log('---');
    });
    
    // Compter par coupon
    const counts: any = {};
    history.forEach((h: any) => {
      counts[h.couponCode] = (counts[h.couponCode] || 0) + 1;
    });
    
    console.log('\n📊 RÉSUMÉ:');
    Object.keys(counts).forEach(code => {
      console.log(`   ${code}: ${counts[code]} utilisations`);
    });
    
    this.showAlert(`📊 ${filteredHistory.length} utilisation(s) affichées dans la console`, 'info');
    
  } catch (error) {
    console.error('❌ Erreur affichage historique:', error);
  }
}

/**
 * ✅ MÉTHODE POUR RESYNCHRONISER TOUS LES COMPTEURS À PARTIR DE L'HISTORIQUE
 */
resynchroniserTousLesCompteurs(): void {
  console.log('🔄 Resynchronisation de tous les compteurs de coupons...');
  
  try {
    // Récupérer l'historique
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    
    // Compter les utilisations par coupon
    const counts: { [key: string]: number } = {};
    history.forEach((h: any) => {
      // Utiliser soit le newCount stocké, soit compter
      if (h.newCount !== undefined) {
        counts[h.couponCode] = Math.max(counts[h.couponCode] || 0, h.newCount);
      } else {
        counts[h.couponCode] = (counts[h.couponCode] || 0) + 1;
      }
    });
    
    console.log('📊 Compteurs calculés depuis l\'historique:', counts);
    
    // Mettre à jour adminCoupons
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    adminCoupons.forEach((coupon: any) => {
      if (counts[coupon.code] !== undefined) {
        coupon.usedCount = counts[coupon.code];
      }
    });
    localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
    
    // Mettre à jour les compteurs
    localStorage.setItem('coupon_counters', JSON.stringify(counts));
    
    // Mettre à jour le composant
    this.coupons.forEach(coupon => {
      if (counts[coupon.code] !== undefined) {
        coupon.usedCount = counts[coupon.code];
      }
    });
    
    // Forcer la mise à jour de l'affichage
    this.coupons = [...this.coupons];
    
    // Mettre à jour toutes les pages
    Object.keys(counts).forEach(code => {
      this.updateAllPagesCouponCounters(code, counts[code]);
    });
    
    this.showAlert(`✅ ${Object.keys(counts).length} coupons resynchronisés`, 'success');
    
  } catch (error) {
    console.error('❌ Erreur resynchronisation:', error);
    this.showAlert('Erreur lors de la resynchronisation', 'error');
  }
}
// ==================== MÉTHODE CORRIGÉE POUR INCRÉMENTER LE COMPTEUR ====================

/**
 * ✅ INCRÉMENTE LE COMPTEUR D'UTILISATIONS D'UN COUPON - VERSION CORRIGÉE
 */
incrementCouponCount(couponCode: string, orderData?: any): void {
  console.log(`📈 INCRÉMENTATION DU COUPON: ${couponCode}`, orderData);
  
  if (!couponCode) {
    console.warn('⚠️ Code coupon vide');
    return;
  }

  try {
    // 1. Lire les coupons depuis localStorage
    let adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    console.log('📊 Coupons avant:', adminCoupons.map((c: any) => ({code: c.code, used: c.usedCount})));

    // 2. Trouver le coupon
    let couponIndex = adminCoupons.findIndex((c: any) => c.code === couponCode);
    
    if (couponIndex === -1) {
      console.log(`⚠️ Coupon ${couponCode} non trouvé - recherche dans le composant...`);
      
      // Chercher dans le composant
      const compCoupon = this.coupons.find(c => c.code === couponCode);
      
      if (compCoupon) {
        adminCoupons.push({
          ...compCoupon,
          usedCount: (compCoupon.usedCount || 0) + 1,
          lastUsedAt: new Date().toISOString()
        });
        console.log(`✅ Coupon ajouté depuis composant`);
      } else {
        // Créer un nouveau coupon
        adminCoupons.push({
          id: Date.now(),
          code: couponCode,
          usedCount: 1,
          discountValue: 10,
          discountType: 'PERCENTAGE',
          expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          isActive: true,
          maxUses: 100,
          lastUsedAt: new Date().toISOString()
        });
        console.log(`✅ Nouveau coupon créé`);
      }
      
      // Mettre à jour localStorage
      localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
      
      // Recharger les coupons
      setTimeout(() => {
        this.loadCoupons();
        this.showAlert(`✅ Coupon ${couponCode} créé avec 1 utilisation`, 'success');
      }, 100);
      
      return;
    }
    
    // 3. INCRÉMENTER LE COMPTEUR
    const currentCount = adminCoupons[couponIndex].usedCount || 0;
    const newCount = currentCount + 1;
    
    // Vérifier la limite maxUses
    const maxUses = adminCoupons[couponIndex].maxUses;
    if (maxUses && newCount > maxUses) {
      this.showAlert(`⚠️ Coupon ${couponCode} a atteint sa limite (${maxUses})`, 'warning');
      return;
    }
    
    // Mettre à jour
    adminCoupons[couponIndex].usedCount = newCount;
    adminCoupons[couponIndex].lastUsedAt = new Date().toISOString();
    
    console.log(`✅ Compteur mis à jour: ${currentCount} → ${newCount}`);
    
    // 4. SAUVEGARDER DANS LOCALSTORAGE
    localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
    
    // 5. METTRE À JOUR LES COMPTEURS SÉPARÉS
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    counters[couponCode] = newCount;
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    
    // 6. AJOUTER À L'HISTORIQUE
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    history.push({
      id: Date.now(),
      couponCode: couponCode,
      orderNumber: orderData?.orderNumber || `CMD-${Date.now()}`,
      customerName: orderData?.customerName || 'Client Test',
      customerEmail: orderData?.customerEmail || '',
      orderAmount: orderData?.orderAmount || 100,
      discountAmount: orderData?.discountAmount || 10,
      usedAt: new Date().toISOString(),
      oldCount: currentCount,
      newCount: newCount,
      source: orderData?.source || 'admin'
    });
    localStorage.setItem('coupon_usage_history', JSON.stringify(history));
    
    // 7. METTRE À JOUR LE COMPOSANT LOCAL
    const localIndex = this.coupons.findIndex(c => c.code === couponCode);
    if (localIndex !== -1) {
      this.coupons[localIndex].usedCount = newCount;
      this.coupons = [...this.coupons]; // Force update
    } else {
      this.coupons = [...adminCoupons];
    }
    
    // 8. METTRE À JOUR LES PAGES SPÉCIFIQUES
    this.updatePageCounters(couponCode, newCount);
    
    // 9. ÉMETTRE DES ÉVÉNEMENTS
    window.dispatchEvent(new CustomEvent('couponUpdated', {
      detail: { couponCode, newCount }
    }));
    
    // 10. AFFICHER NOTIFICATION
    this.showAlert(`📊 ${couponCode}: ${newCount}/${maxUses || '∞'} utilisations`, 'success');
    
    console.log('📊 Coupons après:', adminCoupons.map((c: any) => ({code: c.code, used: c.usedCount})));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

/**
 * Met à jour les compteurs des pages spécifiques
 */
// Dans AdminComponent - REMPLACEZ la méthode loadCoupons existante
loadCoupons(): void {
  console.log('🎫 Chargement coupons...');
  this.loading.coupons = true;
  
  this.adminService.getAllCoupons().pipe(takeUntil(this.destroy$)).subscribe({
    next: (response: any) => {
      if (response.success && response.coupons) {
        // Récupérer les compteurs locaux
        const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
        const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
        
        // Compter depuis l'historique (plus fiable)
        const historyCounts: { [key: string]: number } = {};
        history.forEach((h: any) => {
          historyCounts[h.couponCode] = (historyCounts[h.couponCode] || 0) + 1;
        });
        
        this.coupons = response.coupons.map((coupon: Coupon) => {
          // Priorité à l'historique, puis aux compteurs, puis à la valeur API
          let usedCount = coupon.usedCount || 0;
          
          if (historyCounts[coupon.code] !== undefined) {
            usedCount = historyCounts[coupon.code];
          } else if (counters[coupon.code] !== undefined) {
            usedCount = counters[coupon.code];
          }
          
          return {
            ...coupon,
            usedCount: usedCount
          };
        });
        
        console.log(`✅ ${this.coupons.length} coupons chargés avec leurs compteurs`);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('adminCoupons', JSON.stringify(this.coupons));
        
        // Mettre à jour les compteurs
        const newCounters: { [key: string]: number } = {};
        this.coupons.forEach(c => {
          newCounters[c.code] = c.usedCount || 0;
        });
        localStorage.setItem('coupon_counters', JSON.stringify(newCounters));
        
        // Synchroniser vers les pages
        this.syncCouponsToPages();
      }
      this.loading.coupons = false;
    },
    error: (error) => {
      console.error('❌ Erreur coupons:', error);
      this.loading.coupons = false;
    }
  });
}
// Dans AdminService - REMPLACEZ la méthode existante
useCoupon(couponCode: string, orderAmount: number = 0, orderData?: any): Observable<ApiResponse<any>> {
  console.log(`🎫 UTILISATION DU COUPON: ${couponCode}`, orderData);
  
  // 1. Incrémenter LOCALEMENT immédiatement
  try {
    // Récupérer les coupons admin
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    const couponIndex = adminCoupons.findIndex((c: any) => c.code === couponCode);
    
    if (couponIndex !== -1) {
      const currentCount = adminCoupons[couponIndex].usedCount || 0;
      const newCount = currentCount + 1;
      
      // Mettre à jour le coupon
      adminCoupons[couponIndex].usedCount = newCount;
      adminCoupons[couponIndex].lastUsedAt = new Date().toISOString();
      
      // Sauvegarder dans localStorage
      localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
      
      console.log(`✅ Compteur incrémenté dans adminCoupons: ${currentCount} → ${newCount}`);
      
      // 2. Mettre à jour les compteurs séparés
      const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
      counters[couponCode] = (counters[couponCode] || 0) + 1;
      localStorage.setItem('coupon_counters', JSON.stringify(counters));
      
      // 3. Ajouter à l'historique des utilisations
      const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
      history.push({
        couponCode: couponCode,
        orderNumber: orderData?.orderNumber || 'N/A',
        customerName: orderData?.customerName || 'Client inconnu',
        customerEmail: orderData?.customerEmail || '',
        orderAmount: orderAmount,
        discountAmount: orderData?.discountAmount || 0,
        usedAt: new Date().toISOString(),
        source: orderData?.source || 'unknown'
      });
      localStorage.setItem('coupon_usage_history', JSON.stringify(history));
      
      // 4. Mettre à jour les coupons spécifiques aux pages
      this.updatePageCouponCounters(couponCode, newCount);
      
      // 5. Émettre des événements pour mettre à jour toutes les interfaces
      this.emitCouponUpdateEvents(couponCode, newCount);
      
    } else {
      console.warn(`⚠️ Coupon ${couponCode} non trouvé dans adminCoupons`);
      
      // Créer une entrée si elle n'existe pas
      adminCoupons.push({
        code: couponCode,
        usedCount: 1,
        lastUsedAt: new Date().toISOString(),
        isActive: true,
        discountValue: orderData?.discountValue || 10,
        discountType: 'PERCENTAGE'
      });
      localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
      console.log(`✅ Nouveau coupon créé: ${couponCode}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur incrémentation locale:', error);
  }
  
  // 6. Appel API (en arrière-plan, ne bloque pas)
  return this.http.post<ApiResponse<any>>(`${this.apiUrl}/coupons/use`, {
    code: couponCode,
    orderAmount: orderAmount,
    orderNumber: orderData?.orderNumber,
    customerEmail: orderData?.customerEmail
  }).pipe(
    tap(response => {
      console.log('✅ Réponse API useCoupon:', response);
    }),
    catchError((error) => {
      console.warn('⚠️ API useCoupon non disponible (mais compteur déjà incrémenté localement):', error);
      // Retourner un succès même si l'API échoue
      const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
      return of({
        success: true,
        message: 'Coupon utilisé localement',
        data: { 
          usedCount: counters[couponCode] || 1,
          localOnly: true 
        }
      } as ApiResponse<any>);
    })
  );
}
// Dans AdminComponent - AJOUTEZ cette méthode
/**
 * ✅ INCRÉMENTE LE COMPTEUR D'UTILISATIONS D'UN COUPON
 * Cette méthode doit être appelée automatiquement quand une commande avec coupon est confirmée
 */
incrementCouponUsage(couponCode: string, orderData?: any): void {
  console.log(`📈 INCRÉMENTATION DU COUPON: ${couponCode}`, orderData);
  
  if (!couponCode) {
    console.warn('⚠️ Code coupon vide');
    return;
  }

  try {
    // 1. Lire les coupons depuis localStorage
    let adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    console.log('📊 Coupons avant:', adminCoupons.map((c: any) => ({code: c.code, used: c.usedCount})));

    // 2. Trouver le coupon
    let couponIndex = adminCoupons.findIndex((c: any) => c.code === couponCode);
    
    if (couponIndex === -1) {
      console.log(`⚠️ Coupon ${couponCode} non trouvé - recherche dans le composant...`);
      
      // Chercher dans le composant
      const compCoupon = this.coupons.find(c => c.code === couponCode);
      
      if (compCoupon) {
        adminCoupons.push({
          ...compCoupon,
          usedCount: (compCoupon.usedCount || 0) + 1,
          lastUsedAt: new Date().toISOString()
        });
        console.log(`✅ Coupon ajouté depuis composant`);
      } else {
        // Créer un nouveau coupon
        adminCoupons.push({
          id: Date.now(),
          code: couponCode,
          usedCount: 1,
          discountValue: 10,
          discountType: 'PERCENTAGE',
          expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
          isActive: true,
          maxUses: 100,
          lastUsedAt: new Date().toISOString()
        });
        console.log(`✅ Nouveau coupon créé`);
      }
      
      // Mettre à jour localStorage
      localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
      
      // Recharger les coupons
      setTimeout(() => {
        this.loadCoupons();
        this.showAlert(`✅ Coupon ${couponCode} créé avec 1 utilisation`, 'success');
      }, 100);
      
      return;
    }
    
    // 3. INCRÉMENTER LE COMPTEUR
    const currentCount = adminCoupons[couponIndex].usedCount || 0;
    const newCount = currentCount + 1;
    
    // Vérifier la limite maxUses
    const maxUses = adminCoupons[couponIndex].maxUses;
    if (maxUses && newCount > maxUses) {
      this.showAlert(`⚠️ Coupon ${couponCode} a atteint sa limite (${maxUses})`, 'warning');
      return;
    }
    
    // Mettre à jour
    adminCoupons[couponIndex].usedCount = newCount;
    adminCoupons[couponIndex].lastUsedAt = new Date().toISOString();
    
    console.log(`✅ Compteur mis à jour: ${currentCount} → ${newCount}`);
    
    // 4. SAUVEGARDER DANS LOCALSTORAGE
    localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
    
    // 5. METTRE À JOUR LES COMPTEURS SÉPARÉS
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    counters[couponCode] = newCount;
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    
    // 6. AJOUTER À L'HISTORIQUE
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    history.push({
      id: Date.now(),
      couponCode: couponCode,
      orderNumber: orderData?.orderNumber || `CMD-${Date.now()}`,
      customerName: orderData?.customerName || 'Client Test',
      customerEmail: orderData?.customerEmail || '',
      orderAmount: orderData?.orderAmount || 100,
      discountAmount: orderData?.discountAmount || 10,
      usedAt: new Date().toISOString(),
      oldCount: currentCount,
      newCount: newCount,
      source: orderData?.source || 'admin'
    });
    localStorage.setItem('coupon_usage_history', JSON.stringify(history));
    
    // 7. METTRE À JOUR LE COMPOSANT LOCAL
    const localIndex = this.coupons.findIndex(c => c.code === couponCode);
    if (localIndex !== -1) {
      this.coupons[localIndex].usedCount = newCount;
      this.coupons = [...this.coupons]; // Force update
    } else {
      this.coupons = [...adminCoupons];
    }
    
    // 8. METTRE À JOUR LES PAGES SPÉCIFIQUES
    this.updatePageCounters(couponCode, newCount);
    
    // 9. ÉMETTRE DES ÉVÉNEMENTS
    window.dispatchEvent(new CustomEvent('couponUpdated', {
      detail: { couponCode, newCount }
    }));
    
    // 10. AFFICHER NOTIFICATION
    this.showAlert(`📊 ${couponCode}: ${newCount}/${maxUses || '∞'} utilisations`, 'success');
    
    console.log('📊 Coupons après:', adminCoupons.map((c: any) => ({code: c.code, used: c.usedCount})));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}
// Dans AdminComponent - AJOUTEZ cette méthode
/**
 * Met à jour les compteurs des pages spécifiques
 */
private updatePageCounters(couponCode: string, newCount: number): void {
  const pages = ['savonCoupons', 'huilesEssentiellesCoupons', 'huileOliveCoupons', 'soinCoupons'];
  
  pages.forEach(pageKey => {
    try {
      const pageCoupons = JSON.parse(localStorage.getItem(pageKey) || '[]');
      const index = pageCoupons.findIndex((c: any) => c.code === couponCode);
      
      if (index !== -1) {
        pageCoupons[index].usedCount = newCount;
        localStorage.setItem(pageKey, JSON.stringify(pageCoupons));
      }
    } catch (e) {}
  });
}
ngOnInit() {
  console.log('🚀 INITIALISATION DU COMPOSANT ADMIN');
  
  // 1. Vérifier l'authentification
  this.checkAuthentication();
  
  // 2. Tester l'API
  this.testApiConnection();
  
  // 3. Configurer les écouteurs
  this.setupEventListeners();
  this.setupAutoCouponSync();
  this.setupCouponUsageListener();
  this.setupSoinOrderListener();
  
  // 4. ✅ ÉCOUTER LES MISES À JOUR DE COUPONS DEPUIS LES AUTRES PAGES
  window.addEventListener('adminCouponsUpdated', (event: any) => {
    console.log('🔔 adminCouponsUpdated reçu:', event.detail);
    if (event.detail && event.detail.couponCode) {
      this.syncCouponFromEvent(event.detail);
    }
  });
  
  // 5. ✅ ÉCOUTER LES ÉVÉNEMENTS DE MISES À JOUR DES COUPONS
  window.addEventListener('couponUsed', (event: any) => {
    console.log('🔔 couponUsed reçu:', event.detail);
    if (event.detail && event.detail.couponCode) {
      this.syncCouponFromEvent(event.detail);
    }
  });
  
  // 6. ✅ ÉCOUTER LES NOUVELLES COMMANDES
  window.addEventListener('newOrderReceived', (event: any) => {
    console.log('📦 newOrderReceived reçu:', event.detail);
    if (event.detail && event.detail.couponCode) {
      this.syncCouponFromEvent({
        couponCode: event.detail.couponCode,
        newCount: event.detail.couponNewCount || (event.detail.couponCount || 0) + 1,
        timestamp: new Date().toISOString(),
        source: event.detail.source || 'order'
      });
    }
  });
  
  // 7. Synchronisation initiale
  setTimeout(() => {
    this.forceRefreshAllCounters();
    this.loadCoupons();
  }, 2000);
}
/**
 * ✅ SYNCHRONISE UN COUPON DEPUIS UN ÉVÉNEMENT
 */


/**
 * ✅ SAUVEGARDE UN COUPON DANS LOCALSTORAGE
 */
private saveCouponToLocalStorage(couponCode: string, newCount: number, detail: any): void {
  try {
    // Mettre à jour adminCoupons
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    const couponIndex = adminCoupons.findIndex((c: any) => c.code === couponCode);
    
    if (couponIndex !== -1) {
      adminCoupons[couponIndex].usedCount = newCount;
      adminCoupons[couponIndex].lastUsedAt = detail.timestamp || new Date().toISOString();
    } else {
      adminCoupons.push({
        code: couponCode,
        usedCount: newCount,
        lastUsedAt: detail.timestamp || new Date().toISOString(),
        isActive: true,
        discountValue: 10,
        discountType: 'PERCENTAGE'
      });
    }
    
    localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
    console.log(`💾 adminCoupons mis à jour: ${couponCode} = ${newCount}`);
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde localStorage:', error);
  }
}

/**
 * ✅ MET À JOUR LES COMPTEURS DE COUPONS
 */
private updateCouponCounters(couponCode: string, newCount: number): void {
  try {
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    counters[couponCode] = newCount;
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    console.log(`💾 Compteurs mis à jour: ${couponCode} = ${newCount}`);
  } catch (error) {
    console.error('❌ Erreur mise à jour compteurs:', error);
  }
}

/**
 * ✅ AJOUTE À L'HISTORIQUE DES UTILISATIONS
 */
private addToCouponHistory(couponCode: string, newCount: number, detail: any): void {
  try {
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    
    history.push({
      id: Date.now(),
      couponCode: couponCode,
      orderNumber: detail.orderNumber || `SYNC-${Date.now()}`,
      customerName: detail.customerName || 'Client inconnu',
      customerEmail: detail.customerEmail || '',
      orderAmount: detail.orderAmount || 0,
      discountAmount: detail.discountAmount || 0,
      usedAt: detail.timestamp || new Date().toISOString(),
      oldCount: (detail.oldCount !== undefined) ? detail.oldCount : (newCount - 1),
      newCount: newCount,
      source: detail.source || 'admin-sync'
    });
    
    localStorage.setItem('coupon_usage_history', JSON.stringify(history));
    console.log(`📜 Historique mis à jour pour ${couponCode}`);
    
  } catch (error) {
    console.error('❌ Erreur ajout historique:', error);
  }
}

/**
 * ✅ MET À JOUR LES COMPTEURS DES PAGES SPÉCIFIQUES
 */
private updatePageCouponCounters(couponCode: string, newCount: number): void {
  const pages = [
    { key: 'savonCoupons', event: 'savonCouponsUpdated' },
    { key: 'huilesEssentiellesCoupons', event: 'huilesEssentiellesCouponsUpdated' },
    { key: 'huileOliveCoupons', event: 'huileOliveCouponsUpdated' },
    { key: 'soinCoupons', event: 'soinCouponsUpdated' }
  ];
  
  pages.forEach(page => {
    try {
      const pageCoupons = JSON.parse(localStorage.getItem(page.key) || '[]');
      const index = pageCoupons.findIndex((c: any) => c.code === couponCode);
      
      if (index !== -1) {
        pageCoupons[index].usedCount = newCount;
        pageCoupons[index].lastUsedAt = new Date().toISOString();
        localStorage.setItem(page.key, JSON.stringify(pageCoupons));
        console.log(`✅ Page ${page.key} mise à jour: ${couponCode} = ${newCount}`);
        
        // Émettre un événement pour cette page
        window.dispatchEvent(new Event(page.event));
      }
    } catch (error) {
      console.error(`❌ Erreur mise à jour ${page.key}:`, error);
    }
  });
}

/**
 * ✅ FORCE LA MISE À JOUR DE L'AFFICHAGE DES COUPONS
 */


/**
 * ✅ FORCE LA MISE À JOUR DE TOUS LES COMPTEURS
 */
forceRefreshAllCounters(): void {
  console.log('🔄 RAFRAÎCHISSEMENT FORCÉ DE TOUS LES COMPTEURS');
  
  try {
    // 1. Récupérer toutes les commandes
    const allOrders = JSON.parse(localStorage.getItem('admin_all_orders') || '[]');
    
    // 2. Compter les utilisations depuis les commandes
    const usageCounts: { [key: string]: number } = {};
    
    allOrders.forEach((order: any) => {
      if (order.couponCode && (order.status === 'CONFIRMED' || order.status === 'DELIVERED')) {
        usageCounts[order.couponCode] = (usageCounts[order.couponCode] || 0) + 1;
      }
    });
    
    // 3. Compter depuis l'historique
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    history.forEach((h: any) => {
      if (h.newCount !== undefined) {
        usageCounts[h.couponCode] = Math.max(usageCounts[h.couponCode] || 0, h.newCount);
      } else {
        usageCounts[h.couponCode] = (usageCounts[h.couponCode] || 0) + 1;
      }
    });
    
    // 4. Compter depuis les compteurs
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    Object.keys(counters).forEach(code => {
      usageCounts[code] = Math.max(usageCounts[code] || 0, counters[code]);
    });
    
    console.log('📊 Compteurs calculés:', usageCounts);
    
    // 5. Mettre à jour les coupons dans le composant
    let updatedCount = 0;
    this.coupons.forEach(coupon => {
      if (usageCounts[coupon.code] !== undefined && coupon.usedCount !== usageCounts[coupon.code]) {
        console.log(`   ${coupon.code}: ${coupon.usedCount} → ${usageCounts[coupon.code]}`);
        coupon.usedCount = usageCounts[coupon.code];
        updatedCount++;
      }
    });
    
    // 6. Sauvegarder dans localStorage
    localStorage.setItem('adminCoupons', JSON.stringify(this.coupons));
    localStorage.setItem('coupon_counters', JSON.stringify(usageCounts));
    
    // 7. Forcer la mise à jour de l'affichage
    this.coupons = [...this.coupons];
    
    // 8. Mettre à jour toutes les pages
    Object.keys(usageCounts).forEach(code => {
      this.updatePageCouponCounters(code, usageCounts[code]);
    });
    
    // 9. Émettre un événement global
    window.dispatchEvent(new CustomEvent('allCouponsRefreshed', {
      detail: {
        counts: usageCounts,
        timestamp: new Date().toISOString()
      }
    }));
    
    if (updatedCount > 0) {
      this.showAlert(`✅ ${updatedCount} coupon(s) mis à jour`, 'success');
    } else {
      this.showAlert('Tous les compteurs sont à jour', 'info');
    }
    
  } catch (error) {
    console.error('❌ Erreur refresh:', error);
    this.showAlert('Erreur lors du rafraîchissement', 'error');
  }
}

/**
 * ✅ VÉRIFIE LES UTILISATIONS EN ATTENTE
 */
private checkForPendingCouponUsages(): void {
  try {
    const pending = JSON.parse(localStorage.getItem('pending_coupon_usages') || '[]');
    
    if (pending.length > 0) {
      console.log(`📦 ${pending.length} utilisation(s) en attente trouvée(s)`);
      
      pending.forEach((usage: any) => {
        this.syncCouponFromEvent({
          couponCode: usage.couponCode,
          newCount: usage.newCount,
          orderNumber: usage.orderNumber,
          customerName: usage.customerName,
          timestamp: usage.timestamp,
          source: usage.source || 'pending'
        });
      });
      
      // Vider la file d'attente
      localStorage.removeItem('pending_coupon_usages');
      
      if (pending.length > 0) {
        this.showAlert(`${pending.length} utilisation(s) en attente traitées`, 'success');
      }
    }
  } catch (error) {
    console.error('❌ Erreur vérification utilisations en attente:', error);
  }
}

/**
 * ✅ DIAGNOSTIC COMPLET DES COUPONS
 */
diagnosticCompletCoupons(): void {
  console.log('%c🔍 DIAGNOSTIC COMPLET DES COUPONS', 'background: #4f46e5; color: white; font-size: 16px; padding: 10px;');
  console.log('='.repeat(80));
  
  // 1. Vérifier les coupons dans le composant
  console.log('\n📋 COUPONS DANS LE COMPOSANT:');
  this.coupons.forEach(c => {
    console.log(`   ${c.code}: ${c.usedCount || 0} utilisations`);
  });
  
  // 2. Vérifier adminCoupons dans localStorage
  const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
  console.log('\n💾 ADMIN COUPONS DANS LOCALSTORAGE:');
  adminCoupons.forEach((c: any) => {
    console.log(`   ${c.code}: ${c.usedCount || 0} utilisations`);
  });
  
  // 3. Vérifier les compteurs
  const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
  console.log('\n🔢 COMPTEURS:');
  Object.keys(counters).forEach(code => {
    console.log(`   ${code}: ${counters[code]} utilisations`);
  });
  
  // 4. Vérifier l'historique
  const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
  console.log(`\n📜 HISTORIQUE (${history.length} entrées):`);
  history.slice(-10).forEach((h: any, i: number) => {
    console.log(`   ${i+1}. ${h.couponCode} - ${h.source || 'inconnu'} - ${h.newCount || h.count} utilisations`);
  });
  
  // 5. Vérifier les pages spécifiques
  const pages = ['savonCoupons', 'huilesEssentiellesCoupons', 'huileOliveCoupons', 'soinCoupons'];
  console.log('\n🌐 PAGES SPÉCIFIQUES:');
  pages.forEach(page => {
    const coupons = JSON.parse(localStorage.getItem(page) || '[]');
    console.log(`   ${page}: ${coupons.length} coupons`);
    coupons.slice(0, 3).forEach((c: any) => {
      console.log(`      - ${c.code}: ${c.usedCount || 0} utilisations`);
    });
  });
  
  console.log('\n' + '='.repeat(80));
  this.showAlert('Diagnostic terminé - Voir console (F12)', 'info');
}
/**
 * ✅ SYNCHRONISE UN COUPON DEPUIS UN ÉVÉNEMENT (Version simplifiée)
 */
private syncCouponFromEvent(detail: any): void {
  console.log(`🔄 Synchronisation coupon ${detail.couponCode}`);
  
  if (!detail.couponCode) {
    console.warn('⚠️ Événement sans code coupon');
    return;
  }
  
  // Trouver le coupon dans la liste locale
  const couponIndex = this.coupons.findIndex(c => c.code === detail.couponCode);
  
  if (couponIndex !== -1) {
    const oldCount = this.coupons[couponIndex].usedCount || 0;
    const newCount = oldCount + 1;
    
    // Mettre à jour le coupon
    this.coupons[couponIndex].usedCount = newCount;
    
    console.log(`✅ Coupon ${detail.couponCode}: ${oldCount} → ${newCount}`);
    
    // Mettre à jour l'affichage
    this.coupons = [...this.coupons];
    
    // Sauvegarder dans localStorage
    const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    const adminIndex = adminCoupons.findIndex((c: any) => c.code === detail.couponCode);
    
    if (adminIndex !== -1) {
      adminCoupons[adminIndex].usedCount = newCount;
    } else {
      adminCoupons.push({
        code: detail.couponCode,
        usedCount: newCount,
        isActive: true,
        discountValue: 10,
        discountType: 'PERCENTAGE'
      });
    }
    
    localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
    
    // Mettre à jour les compteurs
    const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
    counters[detail.couponCode] = newCount;
    localStorage.setItem('coupon_counters', JSON.stringify(counters));
    
    // Mettre à jour l'historique
    const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
    history.push({
      couponCode: detail.couponCode,
      orderNumber: detail.orderNumber || 'N/A',
      usedAt: new Date().toISOString(),
      newCount: newCount,
      source: detail.source || 'admin-sync'
    });
    localStorage.setItem('coupon_usage_history', JSON.stringify(history));
    
    // Afficher la notification
    this.showAlert(`📊 Coupon ${detail.couponCode} : ${newCount} utilisation(s)`, 'success');
    
  } else {
    console.warn(`⚠️ Coupon ${detail.couponCode} non trouvé`);
    this.loadCoupons();
  }
}

/**
 * ✅ FORCE LA MISE À JOUR DE L'AFFICHAGE DES COUPONS
 */
refreshCouponDisplay(): void {
  console.log('🔄 Rafraîchissement des coupons');
  
  const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
  let updated = false;
  
  this.coupons.forEach(coupon => {
    if (counters[coupon.code] !== undefined && coupon.usedCount !== counters[coupon.code]) {
      coupon.usedCount = counters[coupon.code];
      updated = true;
    }
  });
  
  if (updated) {
    this.coupons = [...this.coupons];
    this.showAlert('Coupons mis à jour', 'success');
  }
}
} 