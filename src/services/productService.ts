// @ts-ignore
import db from '../../db.json'
import type { Product } from '../types'

// Type assertion for the imported JSON
const productsData = (db as { products: Product[] }).products

export const productService = {
    getAllProducts: async (): Promise<Product[]> => {
        return productsData
    },

    getProductById: async (id: string): Promise<Product | undefined> => {
        return productsData.find(p => p.id === id)
    }
}
