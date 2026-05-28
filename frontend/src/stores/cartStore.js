import { create } from 'zustand';
import api from '../services/api';

export const useCartStore = create((set, get) => ({
    items: [],
    customerId: null,
    total: 0,
    
    addItem: (product, quantity = 1, unitPrice = null) => {
        const existing = get().items.find(i => i.product_id === product.id);
        let newItems;
        if (existing) {
            newItems = get().items.map(i =>
                i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            );
        } else {
            newItems = [...get().items, {
                product_id: product.id,
                name: product.name,
                price: unitPrice || product.base_price,
                quantity: quantity
            }];
        }
        set({ items: newItems });
        get().calculateCart();
    },
    
    removeItem: (index) => {
        const newItems = get().items.filter((_, i) => i !== index);
        set({ items: newItems });
        get().calculateCart();
    },
    
    updateQuantity: (index, quantity) => {
        if (quantity < 1) return;
        const items = [...get().items];
        items[index].quantity = quantity;
        set({ items });
        get().calculateCart();
    },
    
    calculateCart: async () => {
        const { items, customerId } = get();
        if (items.length === 0) {
            set({ total: 0 });
            return;
        }
        try {
            const payload = {
                items: items.map(i => ({
                    product_id: i.product_id,
                    quantity: i.quantity,
                    price: i.price
                })),
                customer_id: customerId
            };
            console.log('Calculating cart with payload:', payload);
            const res = await api.post('/cart/calculate', payload);
            console.log('Cart calculation response:', res.data);
            set({ total: res.data.total });
        } catch (err) {
            console.error('Cart calculation error:', err);
        }
    },
    
    setCustomer: (customerId) => {
        set({ customerId });
        get().calculateCart();
   },
    
    clearCart: () => set({ items: [], customerId: null, total: 0 })
}));
