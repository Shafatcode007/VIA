import apiClient from './client'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export interface Product {
  id: number
  seller_id: number
  canonical_item_id: number | null
  name: string
  description: string | null
  price: number
  unit: string
  stock_quantity: number
  image_url: string | null
  is_available: boolean
  seller_name?: string
  normalized_price_per_gram?: number
}

export interface Seller {
  id: number
  user_id: number
  name: string
  description: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  is_active: boolean
  delivery_radius_km: number
  minimum_order_amount: number
}

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  product_name: string
  product_price: number
  subtotal: number
}

export interface Cart {
  id: number
  items: CartItem[]
  total_cents: number
  item_count: number
}

export interface SubOrderItem {
  id: number
  product_id: number
  quantity: number
  unit_price_cents: number
  total_cents: number
}

export interface SubOrder {
  id: number
  seller_id: number
  status: string
  subtotal_cents: number
  items: SubOrderItem[]
}

export interface Order {
  id: number
  status: string
  total_cents: number
  delivery_address: string | null
  sub_orders: SubOrder[]
  created_at: string | null
}

export interface StrategyResult {
  strategy: string
  total_items: number
  total_cost: number
  delivery_fees: number
  total_with_delivery: number
  sellers_used: number
  estimated_savings: number
  warnings: string[]
  item_assignments: Record<number, { seller_id: number; seller_name: string; line_total: number }>
}

export interface OptimizationResult {
  recommended: string
  strategies: Record<string, StrategyResult>
  savings: number
}

export async function listProducts(query?: string): Promise<{ products: Product[]; count: number }> {
  const params = query ? { q: query } : {}
  const { data } = await apiClient.get('/api/v1/grocery/products', { params })
  return data
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await apiClient.get(`/api/v1/grocery/products/${id}`)
  return data
}

export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get('/api/v1/grocery/cart')
  return data
}

export async function addToCart(productId: number, quantity: number): Promise<Cart> {
  const { data } = await apiClient.post('/api/v1/grocery/cart/items', { product_id: productId, quantity })
  return data
}

export async function updateCartItem(itemId: number, quantity: number): Promise<Cart> {
  const { data } = await apiClient.put(`/api/v1/grocery/cart/items/${itemId}`, { quantity })
  return data
}

export async function removeFromCart(itemId: number): Promise<Cart> {
  const { data } = await apiClient.delete(`/api/v1/grocery/cart/items/${itemId}`)
  return data
}

export async function optimizeCart(): Promise<OptimizationResult> {
  const { data } = await apiClient.get('/api/v1/grocery/cart/optimize')
  return data
}

export async function checkout(deliveryAddress: string): Promise<{ order_id: number; total_cents: number; seller_count: number }> {
  const { data } = await apiClient.post('/api/v1/grocery/orders/checkout', { delivery_address: deliveryAddress })
  return data
}

export async function listOrders(): Promise<{ orders: Order[] }> {
  const { data } = await apiClient.get('/api/v1/grocery/orders')
  return data
}

export async function getOrder(orderId: number): Promise<Order> {
  const { data } = await apiClient.get(`/api/v1/grocery/orders/${orderId}`)
  return data
}

export async function initiatePayment(orderId: number, method: string, idempotencyKey?: string): Promise<{ payment_id: number; status: string; amount_cents: number; method: string }> {
  const { data } = await apiClient.post(`/api/v1/grocery/orders/${orderId}/pay`, { method, idempotency_key: idempotencyKey })
  return data
}

export async function confirmPayment(paymentId: number, transactionId: string): Promise<{ status: string; payment_id: number }> {
  const { data } = await apiClient.post(`/api/v1/grocery/orders/payments/${paymentId}/confirm`, null, { params: { transaction_id: transactionId } })
  return data
}

/* NECESSITY: Seller product management APIs */
/* LOGIC: Only accessible by SELLER role; backend enforces via require_role */
/* EDGE-CASE: Returns empty array for new sellers with no profile */

export async function getMySellers(): Promise<{ sellers: Seller[] }> {
  const { data } = await apiClient.get('/api/v1/grocery/sellers/me')
  return data
}

export async function createSeller(seller: Omit<Seller, 'id' | 'user_id' | 'is_active' | 'minimum_order_amount' | 'created_at'>): Promise<Seller> {
  const { data } = await apiClient.post('/api/v1/grocery/sellers', seller)
  return data
}

export async function getSellerProducts(sellerId: number): Promise<{ products: Product[] }> {
  const { data } = await apiClient.get(`/api/v1/grocery/sellers/${sellerId}/products`)
  return data
}

export async function createSellerProduct(sellerId: number, product: Omit<Product, 'id' | 'seller_id' | 'seller_name' | 'normalized_price_per_gram' | 'created_at'>): Promise<Product> {
  const { data } = await apiClient.post(`/api/v1/grocery/sellers/${sellerId}/products`, product)
  return data
}

export async function updateProduct(productId: number, updates: Partial<Pick<Product, 'name' | 'description' | 'price' | 'unit' | 'stock_quantity' | 'image_url' | 'is_available'>>): Promise<Product> {
  const { data } = await apiClient.put(`/api/v1/grocery/products/${productId}`, updates)
  return data
}
