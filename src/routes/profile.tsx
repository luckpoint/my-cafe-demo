import { Hono } from 'hono'
import { requiresAuth } from '@auth0/auth0-hono'
import { Layout } from '../components/Layout'
import { Header } from '../components/Header'
import { Footer } from '../components/Footer'

import { Bindings, Variables } from '../types'

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

app.get('/', requiresAuth(), async (c) => {
    const session = await c.var.auth0Client?.getSession(c)
    if (session) {
        console.log('--- Auth Check Debug (Profile) ---')
        console.log('User IS authenticated')
        console.log('Session User:', JSON.stringify(session.user, null, 2))
        console.log('------------------------------')
    } else {
        // Should not happen due to requiresAuth() but good for consistency
        console.log('--- Auth Check Debug (Profile) ---')
        console.log('User is NOT authenticated')
        console.log('------------------------------')
    }
    const user = session?.user

    return c.html(
        <Layout title="Profile">
            <Header user={user} cartCount={0} currentPath="/profile" />

            <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div class="max-w-3xl mx-auto bg-white shadow overflow-hidden sm:rounded-lg">
                    <div class="px-4 py-5 sm:px-6 flex items-center justify-between">
                        <div>
                            <h3 class="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                            <p class="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application status.</p>
                        </div>
                        <img src={user.picture} alt={user.name} class="h-16 w-16 rounded-full" />
                    </div>

                    <div class="border-t border-gray-200">
                        <dl>
                            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt class="text-sm font-medium text-gray-500">Full name</dt>
                                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
                            </div>
                            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt class="text-sm font-medium text-gray-500">Email address</dt>
                                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                            </div>
                            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt class="text-sm font-medium text-gray-500">User ID</dt>
                                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.sub}</dd>
                            </div>
                        </dl>
                    </div>

                    <div class="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200 text-right">
                        <a href="/auth/logout" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none">
                            Sign out
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </Layout>
    )
})

export default app
