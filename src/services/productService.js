import api from './api';

export const productService = {
    async getAllProducts() {
        const response = await api.get('/products');
        return response.data;
    },

    async getProductById(id) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    async getProductsByCategory(category) {
        if (category === 'all') {
            return this.getAllProducts();
        }
        const response = await api.get(`/products?category=${category}`);
        return response.data;
    },

    async searchProducts(query) {
        const response = await api.get(`/products?q=${query}`);
        return response.data;
    }
};
