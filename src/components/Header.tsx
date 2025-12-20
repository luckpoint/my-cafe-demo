import type { FC } from 'hono/jsx'
import type { User } from '../types'

interface HeaderProps {
    user?: User | null
    cartCount?: number
    currentPath?: string
}

export const Header: FC<HeaderProps> = ({ user, cartCount = 0, currentPath = '/' }) => {
    return (
        <header class="bg-white shadow-sm sticky top-0 z-50 font-sans">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div class="flex-shrink-0 flex items-center">
                        <a href="/" class="text-2xl font-bold text-primary tracking-tight">MY CAFE DEMO</a>
                    </div>

                    {/* Desktop Nav */}
                    <nav class="hidden md:flex space-x-8">
                        <a href="/" class={`${currentPath === '/' ? 'text-primary' : 'text-gray-900'} hover:text-primary px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wide`}>Home</a>
                        <a href="/products" class={`${currentPath.includes('/products') ? 'text-primary' : 'text-gray-900'} hover:text-primary px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wide`}>Menu</a>
                    </nav>

                    {/* Right Actions */}
                    <div class="flex items-center space-x-6">
                        {/* Search Icon (Mock) */}
                        <button class="text-gray-500 hover:text-primary hidden sm:block">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>

                        {/* Auth */}
                        {user ? (
                            <div class="relative group">
                                <button class="flex items-center space-x-2 text-gray-700 hover:text-primary focus:outline-none">
                                    <img src={user.picture || "https://ui-avatars.com/api/?name=" + user.name + "&background=00704A&color=fff"} class="h-8 w-8 rounded-full border border-gray-200" alt={user.name} />
                                    <span class="text-sm font-medium hidden lg:block">{user.name}</span>
                                </button>
                                {/* Dropdown via CSS hover */}
                                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block transition-all duration-200 ring-1 ring-black ring-opacity-5">
                                    <div class="px-4 py-2 border-b border-gray-100">
                                        <p class="text-sm">Signed in as</p>
                                        <p class="text-sm font-bold truncate">{user.email}</p>
                                    </div>
                                    <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                                    <a href="/auth/logout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-red-600">Sign out</a>
                                </div>
                            </div>
                        ) : (
                            <a href="/auth/login" class="text-gray-800 hover:text-primary font-bold text-sm border border-gray-800 hover:border-primary rounded-full px-4 py-2 transition-colors">
                                Sign in
                            </a>
                        )}

                        {/* Cart */}
                        <a href="/cart" class="relative group">
                            <div class="p-2 text-gray-700 group-hover:text-primary transition-colors">
                                <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span class="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full border-2 border-white shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                        </a>
                    </div>

                    {/* Mobile menu button */}
                    <div class="md:hidden flex items-center">
                        <button class="text-gray-500 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary p-2">
                            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}
