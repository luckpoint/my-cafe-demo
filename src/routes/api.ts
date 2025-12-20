import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'

import { productService } from '../services/productService'

import { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

app.post('/cart/add', async (c) => {
    const body = await c.req.parseBody()
    const productId = body['productId'] as string
    const quantity = parseInt(body['quantity'] as string || '1')
    const size = (body['size'] as string || 'tall') as 'short' | 'tall' | 'grande' | 'venti'

    const product = await productService.getProductById(productId)
    if (!product) {
        return c.redirect('/cart?error=product_not_found')
    }

    const cookie = getCookie(c, 'cart')
    let cart: any[] = []
    try {
        if (cookie) cart = JSON.parse(cookie)
    } catch { }

    // Find existing item with same id AND size
    const existingItemIndex = cart.findIndex((item: any) => item.id === productId && item.size === size)
    if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity
    } else {
        cart.push({
            id: product.id,
            quantity: quantity,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size
        })
    }

    setCookie(c, 'cart', JSON.stringify(cart), {
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return c.redirect('/cart')
})

// Remove item from cart
app.post('/cart/remove', (c) => {
    const body = c.req.parseBody()
    return body.then((parsedBody) => {
        const productId = parsedBody['productId'] as string
        const size = parsedBody['size'] as string

        const cookie = getCookie(c, 'cart')
        let cart: any[] = []
        try {
            if (cookie) cart = JSON.parse(cookie)
        } catch { }

        cart = cart.filter((item: any) => !(item.id === productId && item.size === size))

        setCookie(c, 'cart', JSON.stringify(cart), {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 7
        })

        return c.redirect('/cart')
    })
})

// Update item quantity in cart
app.post('/cart/update', (c) => {
    const body = c.req.parseBody()
    return body.then((parsedBody) => {
        const productId = parsedBody['productId'] as string
        const size = parsedBody['size'] as string
        const quantity = parseInt(parsedBody['quantity'] as string || '1')

        const cookie = getCookie(c, 'cart')
        let cart: any[] = []
        try {
            if (cookie) cart = JSON.parse(cookie)
        } catch { }

        const itemIndex = cart.findIndex((item: any) => item.id === productId && item.size === size)
        if (itemIndex >= 0) {
            if (quantity <= 0) {
                cart.splice(itemIndex, 1)
            } else {
                cart[itemIndex].quantity = quantity
            }
        }

        setCookie(c, 'cart', JSON.stringify(cart), {
            path: '/',
            secure: true,
            httpOnly: true,
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 7
        })

        return c.redirect('/cart')
    })
})

app.post('/cart/clear', (c) => {
    setCookie(c, 'cart', '', { path: '/', maxAge: 0 })
    return c.redirect('/cart')
})

export default app
