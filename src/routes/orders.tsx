import { Hono } from 'hono'
import { requiresAuth } from '@auth0/auth0-hono'
import { Layout } from '../components/Layout'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'
import { orderService } from '../services/orderService'
import type { Bindings, Variables, OrderWithItems } from '../types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

const formatDate = (dateString: string) => {
    // SQLite datetime('now') returns UTC time in format "YYYY-MM-DD HH:MM:SS"
    // Convert to ISO 8601 format with 'Z' suffix to indicate UTC
    const isoString = dateString.replace(' ', 'T') + 'Z'
    const date = new Date(isoString)
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
    }).format(price)
}

const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
        completed: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        failed: 'bg-red-100 text-red-800'
    }
    const colorClass = colors[status] || 'bg-gray-100 text-gray-800'

    return (
        <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    )
}

const OrderCard = ({ order }: { order: OrderWithItems }) => (
    <div class="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div class="px-6 py-5 sm:px-8 flex items-center justify-between border-b border-gray-200">
            <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {formatDate(order.created_at)}
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                    Order ID: {order.id.slice(0, 20)}...
                </p>
            </div>
            <div class="text-right">
                <StatusBadge status={order.status} />
                <p class="mt-2 text-lg font-bold text-gray-900">
                    {formatPrice(order.total_amount)}
                </p>
            </div>
        </div>

        <div class="px-6 py-5 sm:px-8">
            <table class="min-w-full">
                <thead>
                    <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th class="pb-2 pr-8">Item</th>
                        <th class="pb-2 pr-8">Size</th>
                        <th class="pb-2 pr-8 text-center">Qty</th>
                        <th class="pb-2 text-right">Price</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    {order.items.map(item => (
                        <tr>
                            <td class="py-2 pr-8 text-sm text-gray-900">{item.product_name}</td>
                            <td class="py-2 pr-8 text-sm text-gray-500 capitalize">{item.size}</td>
                            <td class="py-2 pr-8 text-sm text-gray-500 text-center">{item.quantity}</td>
                            <td class="py-2 text-sm text-gray-900 text-right">
                                {formatPrice(item.unit_price * item.quantity)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
)

const EmptyState = () => (
    <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by ordering your favorite drinks.</p>
        <div class="mt-6">
            <a href="/products" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark">
                Start Shopping
            </a>
        </div>
    </div>
)

app.get('/', requiresAuth(), async (c) => {
    const session = await c.var.auth0Client?.getSession(c)
    const user = session?.user

    if (!user?.sub) {
        return c.redirect('/auth/login')
    }

    const orders = await orderService.getOrdersByUserId(c.env.DB, user.sub)
    console.log('User Sub:', user.sub)
    console.log('Orders found:', orders.length)


    return c.html(
        <Layout title="Order History">
            <Header user={user} cartCount={0} currentPath="/orders" />

            <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Order History</h1>
                    <p class="mt-2 text-sm text-gray-600">
                        View your past orders and their status.
                    </p>
                </div>

                {orders.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div>
                        {orders.map(order => (
                            <OrderCard order={order} />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </Layout>
    )
})

export default app
