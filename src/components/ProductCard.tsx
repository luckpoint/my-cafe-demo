import type { FC } from 'hono/jsx'
import type { Product } from '../types'

export const ProductCard: FC<{ product: Product }> = ({ product }) => {
    return (
        <div class="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
            <div class="w-full h-64 bg-gray-200 aspect-w-1 aspect-h-1 overflow-hidden group-hover:opacity-90 transition-opacity">
                <img src={product.image} alt={product.name} class="w-full h-full object-center object-cover" />
            </div>
            <div class="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <h3 class="text-lg font-medium text-gray-900">
                        <a href={`/products/${product.id}`}>
                            <span aria-hidden="true" class="absolute inset-0"></span>
                            {product.name}
                        </a>
                    </h3>
                    <p class="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                </div>
                <div class="mt-4 flex items-center justify-between">
                    <p class="text-xl font-bold text-primary">¥{product.price.tall}</p>
                    <span class="text-sm text-gray-400">Tall</span>
                </div>
            </div>
        </div>
    )
}
