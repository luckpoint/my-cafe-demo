import type { Order, OrderItem, OrderWithItems } from '../types'

export interface CreateOrderParams {
    id: string
    userId: string
    userEmail: string
    stripePaymentIntentId?: string
    totalAmount: number
    currency?: string
    status?: string
}

export interface CreateOrderItemParams {
    orderId: string
    productId: string
    productName: string
    size: 'short' | 'tall' | 'grande' | 'venti'
    unitPrice: number
    quantity: number
}

export const orderService = {
    async orderExists(db: D1Database, orderId: string): Promise<boolean> {
        const result = await db.prepare(
            'SELECT 1 FROM orders WHERE id = ?'
        ).bind(orderId).first()
        return result !== null
    },

    async createOrder(db: D1Database, params: CreateOrderParams): Promise<void> {
        await db.prepare(`
            INSERT INTO orders (id, user_id, user_email, stripe_payment_intent_id, total_amount, currency, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            params.id,
            params.userId,
            params.userEmail,
            params.stripePaymentIntentId || null,
            params.totalAmount,
            params.currency || 'jpy',
            params.status || 'completed'
        ).run()
    },

    async createOrderItems(db: D1Database, items: CreateOrderItemParams[]): Promise<void> {
        const stmt = db.prepare(`
            INSERT INTO order_items (order_id, product_id, product_name, size, unit_price, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `)

        await db.batch(
            items.map(item => stmt.bind(
                item.orderId,
                item.productId,
                item.productName,
                item.size,
                item.unitPrice,
                item.quantity
            ))
        )
    },

    async getOrdersByUserId(db: D1Database, userId: string): Promise<OrderWithItems[]> {
        const orders = await db.prepare(`
            SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
        `).bind(userId).all<Order>()

        if (!orders.results || orders.results.length === 0) {
            return []
        }

        const orderIds = orders.results.map(o => o.id)
        const placeholders = orderIds.map(() => '?').join(',')

        const items = await db.prepare(`
            SELECT * FROM order_items WHERE order_id IN (${placeholders})
        `).bind(...orderIds).all<OrderItem>()

        const itemsByOrderId = new Map<string, OrderItem[]>()
        for (const item of (items.results || [])) {
            const existing = itemsByOrderId.get(item.order_id) || []
            existing.push(item)
            itemsByOrderId.set(item.order_id, existing)
        }

        return orders.results.map(order => ({
            ...order,
            items: itemsByOrderId.get(order.id) || []
        }))
    }
}
