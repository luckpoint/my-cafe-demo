import { Hono } from 'hono'
import { auth, OIDCEnv } from '@auth0/auth0-hono'
import { Layout } from './components/Layout'
import { Bindings } from './types'

const app = new Hono<OIDCEnv>()

// Auth0 Middleware
app.use('*', async (c, next) => {
    const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_BASE_URL } = c.env
    console.log('--- Auth0 Middleware Debug ---')
    console.log('Request URL:', c.req.url)
    console.log('AUTH0_DOMAIN:', AUTH0_DOMAIN)
    console.log('AUTH0_CLIENT_ID:', AUTH0_CLIENT_ID ? 'Exists' : 'Missing')
    console.log('AUTH0_BASE_URL:', AUTH0_BASE_URL)
    console.log('------------------------------')

    const authMiddleware = auth({
        domain: AUTH0_DOMAIN,
        clientID: AUTH0_CLIENT_ID,
        clientSecret: AUTH0_CLIENT_SECRET,
        baseURL: AUTH0_BASE_URL,
        authRequired: false,
        session: {
            secret: "password_at_least_32_characters_long",
        },
        idpLogout: true
    })
    return authMiddleware(c, next)
})

import home from './routes/home'
import products from './routes/products'
import cart from './routes/cart'
import profile from './routes/profile'
import api from './routes/api'
import checkout from './routes/checkout'
import checkoutPages from './routes/checkout-pages'
import webhook from './routes/webhook'

app.route('/', home)
app.route('/products', products)
app.route('/cart', cart)
app.route('/profile', profile)
app.route('/api', api)
app.route('/api/checkout', checkout)
app.route('/checkout', checkoutPages)
app.route('/api/webhook', webhook)

export default app
