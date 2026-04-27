const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

const initialData = {
    users: [],
    products: [
        // Vegetables
        { id: 1, en_name: 'Potato', bn_name: 'আলু', category: 'vegetables', price: 25, unit: 'kg', img: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=500&q=80', stock: 1 },
        { id: 2, en_name: 'Tomato', bn_name: 'টমেটো', category: 'vegetables', price: 40, unit: 'kg', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80', stock: 1 },
        { id: 3, en_name: 'Onion', bn_name: 'পেঁয়াজ', category: 'vegetables', price: 35, unit: 'kg', img: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=500&q=80', stock: 1 },
        { id: 4, en_name: 'Garlic', bn_name: 'রসুন', category: 'vegetables', price: 150, unit: 'kg', img: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&q=80', stock: 1 },
        { id: 5, en_name: 'Ginger', bn_name: 'আদা', category: 'vegetables', price: 200, unit: 'kg', img: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&q=80', stock: 1 },
        { id: 6, en_name: 'Brinjal', bn_name: 'বেগুন', category: 'vegetables', price: 45, unit: 'kg', img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&q=80', stock: 1 },
        { id: 7, en_name: 'Cabbage', bn_name: 'বাঁধাকপি', category: 'vegetables', price: 30, unit: 'pc', img: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ec3?w=500&q=80', stock: 1 },
        { id: 8, en_name: 'Cauliflower', bn_name: 'ফুলকপি', category: 'vegetables', price: 40, unit: 'pc', img: 'https://images.unsplash.com/photo-1510627489930-0c1b0ba003e9?w=500&q=80', stock: 1 },
        { id: 9, en_name: 'Carrot', bn_name: 'গাজর', category: 'vegetables', price: 60, unit: 'kg', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&q=80', stock: 1 },
        { id: 10, en_name: 'Radish', bn_name: 'মুলো', category: 'vegetables', price: 20, unit: 'kg', img: 'https://images.unsplash.com/photo-1593105544232-498705f21051?w=500&q=80', stock: 1 },
        { id: 11, en_name: 'Cucumber', bn_name: 'শসা', category: 'vegetables', price: 30, unit: 'kg', img: 'https://images.unsplash.com/photo-1449339494186-661ddfa59270?w=500&q=80', stock: 1 },
        { id: 12, en_name: 'Pumpkin', bn_name: 'কুমড়ো', category: 'vegetables', price: 25, unit: 'kg', img: 'https://images.unsplash.com/photo-1506862538367-1064bb6394c3?w=500&q=80', stock: 1 },
        { id: 13, en_name: 'Bottle Gourd', bn_name: 'লাউ', category: 'vegetables', price: 40, unit: 'pc', img: 'https://images.unsplash.com/photo-1591871937573-74dbba515c4c?w=500&q=80', stock: 1 },
        { id: 14, en_name: 'Bitter Gourd', bn_name: 'করলা', category: 'vegetables', price: 60, unit: 'kg', img: 'https://images.unsplash.com/photo-1588613254750-cf5d9859f592?w=500&q=80', stock: 1 },
        { id: 15, en_name: 'Ridge Gourd', bn_name: 'ঝিঙ্গে', category: 'vegetables', price: 50, unit: 'kg', img: 'https://images.unsplash.com/photo-1628156172671-558e80ca5cc1?w=500&q=80', stock: 1 },
        { id: 16, en_name: 'Ladies Finger', bn_name: 'ঢেঁড়স', category: 'vegetables', price: 40, unit: 'kg', img: 'https://images.unsplash.com/photo-1449339494186-661ddfa59270?w=500&q=80', stock: 1 },
        { id: 17, en_name: 'Pointed Gourd', bn_name: 'পটল', category: 'vegetables', price: 60, unit: 'kg', img: 'https://images.unsplash.com/photo-1628156172671-558e80ca5cc1?w=500&q=80', stock: 1 },
        { id: 18, en_name: 'Capsicum', bn_name: 'ক্যাপসিকাম', category: 'vegetables', price: 100, unit: 'kg', img: 'https://images.unsplash.com/photo-1563569110-e7196276239b?w=500&q=80', stock: 1 },
        { id: 19, en_name: 'Green Chili', bn_name: 'কাঁচা লঙ্কা', category: 'vegetables', price: 10, unit: '100g', img: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=500&q=80', stock: 1 },
        { id: 20, en_name: 'Spinach', bn_name: 'পালং শাক', category: 'vegetables', price: 15, unit: 'bunch', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80', stock: 1 },
        
        // Fruits
        { id: 50, en_name: 'Bananas', bn_name: 'কলা', category: 'fruits', price: 40, unit: 'dozen', img: 'https://images.unsplash.com/photo-1571771894821-ad9902d73647?w=500&q=80', stock: 1 },
        { id: 51, en_name: 'Apples', bn_name: 'আপেল', category: 'fruits', price: 180, unit: 'kg', img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&q=80', stock: 1 },
        { id: 52, en_name: 'Oranges', bn_name: 'কমলালেবু', category: 'fruits', price: 120, unit: 'kg', img: 'https://images.unsplash.com/photo-1582281227059-591b4070471c?w=500&q=80', stock: 1 },
        { id: 53, en_name: 'Papaya', bn_name: 'পেঁপে', category: 'fruits', price: 50, unit: 'kg', img: 'https://images.unsplash.com/photo-1526644485127-d2970f64e1e9?w=500&q=80', stock: 1 },
        { id: 54, en_name: 'Mango', bn_name: 'আম', category: 'fruits', price: 80, unit: 'kg', img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&q=80', stock: 1 }
    ],
    orders: [],
    payments: []
};

function read() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function write(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
