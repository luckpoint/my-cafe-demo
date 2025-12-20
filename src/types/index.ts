export interface Product {
    id: string
    name: string
    description: string
    price: {
        short: number
        tall: number
        grande: number
        venti: number
    }
    image: string
    category: string
    rating?: number
    reviews?: number
    customizations?: string[]
}

export interface User {
    name?: string
    email?: string
    picture?: string
    sub?: string
}

export interface CartItem extends Product {
    quantity: number
    size: 'short' | 'tall' | 'grande' | 'venti'
}

export interface Bindings {
    AUTH0_DOMAIN: string
    AUTH0_CLIENT_ID: string
    AUTH0_CLIENT_SECRET: string
    AUTH0_BASE_URL: string
    STRIPE_SECRET_KEY: string
    STRIPE_WEBHOOK_SECRET: string
}

export interface Variables {
    auth0Client: any
    user?: User
}
