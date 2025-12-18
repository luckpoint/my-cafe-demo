const CART_KEY = 'my_coffee_cart';

export const cart = {
    getCart() {
        const items = localStorage.getItem(CART_KEY);
        return items ? JSON.parse(items) : [];
    },

    addToCart(product, size, price) {
        const items = this.getCart();
        const existingItem = items.find(item => item.id === product.id && item.size === size);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            items.push({
                id: product.id,
                name: product.name,
                image: product.image,
                size: size,
                price: price,
                quantity: 1
            });
        }

        this.saveCart(items);
    },

    removeFromCart(id, size) {
        let items = this.getCart();
        items = items.filter(item => !(item.id === id && item.size === size));
        this.saveCart(items);
    },

    updateQuantity(id, size, quantity) {
        const items = this.getCart();
        const item = items.find(item => item.id === id && item.size === size);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeFromCart(id, size);
                return;
            }
            this.saveCart(items);
        }
    },

    clearCart() {
        localStorage.removeItem(CART_KEY);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    },

    getCartTotal() {
        const items = this.getCart();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    saveCart(items) {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
};
