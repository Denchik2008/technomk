const Database = require('better-sqlite3');

const db = new Database('shop.db');

// Ensure UTF-8 encoding
db.pragma('encoding = "UTF-8"');

// Enable foreign keys for CASCADE to work
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    has_comments INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    price_from INTEGER DEFAULT 0,
    subcategory_id INTEGER,
    description TEXT,
    image TEXT,
    isHit INTEGER DEFAULT 0,
    isNew INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    comment TEXT,
    total REAL NOT NULL,
    original_total REAL,
    has_comment INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert main categories (родительские каталоги)
const mainCategories = [
  { name: 'МК', description: 'Мастер-классы', has_comments: 0 },
  { name: 'ДР', description: 'День рождения', has_comments: 1 },
  { name: 'Сувениры', description: 'Сувенирная продукция', has_comments: 0 },
  { name: 'Подарки', description: 'Подарки и сувениры', has_comments: 0 },
];

const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, description, has_comments) VALUES (?, ?, ?)');
mainCategories.forEach(cat => {
  insertCategory.run(cat.name, cat.description, cat.has_comments);
});

// Insert subcategories (подкаталоги)
const subcategories = [
  { parent_id: 1, name: 'Кулинарные МК', description: 'Кулинарные мастер-классы для всех' },
  { parent_id: 1, name: 'Технологические МК', description: 'Технические и технологические мастер-классы' },
  { parent_id: 2, name: 'Программы ДР', description: 'Программы для празднования дня рождения' },
  { parent_id: 3, name: 'Текстиль', description: 'Текстильная продукция' },
  { parent_id: 3, name: 'Полиграфия', description: 'Полиграфическая продукция' },
  { parent_id: 4, name: 'Головоломки', description: 'Головоломки и логические игры' },
  { parent_id: 4, name: 'Канцелярия', description: 'Канцелярские товары' },
];

const insertSubcategory = db.prepare('INSERT INTO subcategories (parent_id, name, description) VALUES (?, ?, ?)');
subcategories.forEach(sub => {
  insertSubcategory.run(sub.parent_id, sub.name, sub.description);
});

// Insert sample products
const products = [
  { name: 'Набор для МК "Новогодние игрушки"', price: 350, price_from: 0, subcategory_id: 1, description: 'Набор для создания новогодних игрушек', isHit: 1, isNew: 1 },
  { name: 'Набор для МК "Символ года"', price: 350, price_from: 0, subcategory_id: 1, description: 'Набор для создания символа года', isHit: 1, isNew: 1 },
  { name: 'Набор для МК "Новогодний гномик"', price: 400, price_from: 0, subcategory_id: 1, description: 'Набор для создания новогоднего гномика', isHit: 1, isNew: 1 },
  { name: 'Набор для МК "Новогодний венок"', price: 500, price_from: 0, subcategory_id: 1, description: 'Набор для создания новогоднего венка', isHit: 1, isNew: 1 },
  { name: 'Набор для МК шоколадное печенье', price: 400, price_from: 0, subcategory_id: 1, description: 'Набор для приготовления шоколадного печенья', isHit: 1, isNew: 0 },
  { name: 'Набор для МК пряничный домик', price: 500, price_from: 0, subcategory_id: 1, description: 'Набор для создания пряничного домика', isHit: 0, isNew: 0 },
  { name: 'Набор для МК Светящийся домик', price: 400, price_from: 0, subcategory_id: 2, description: 'Набор для создания светящегося домика', isHit: 1, isNew: 0 },
  { name: 'Набор для МК Расписные пряники', price: 400, price_from: 0, subcategory_id: 1, description: 'Набор для росписи пряников', isHit: 1, isNew: 0 },
  { name: 'Набор для МК Синнабон', price: 400, price_from: 0, subcategory_id: 1, description: 'Набор для приготовления синнабонов', isHit: 1, isNew: 1 },
  { name: 'Набор МК "Кулинарная школа"', price: 3900, price_from: 0, subcategory_id: 1, description: 'Полный набор для кулинарной школы', isHit: 1, isNew: 0 },
  { name: 'Набор для МК пицца и лимонад', price: 400, price_from: 0, subcategory_id: 1, description: 'Набор для приготовления пиццы и лимонада', isHit: 1, isNew: 0 },
  { name: 'Кружка с рисунком', price: 350, price_from: 0, subcategory_id: 4, description: 'Кружка с индивидуальным рисунком', isHit: 1, isNew: 0 },
  { name: 'Подставка под телефон', price: 400, price_from: 0, subcategory_id: 4, description: 'Подставка под телефон с индивидуальным рисунком', isHit: 0, isNew: 1 },
  { name: 'Набор для МК "Печенье орешки"', price: 350, price_from: 0, subcategory_id: 1, description: 'Набор для приготовления печенья орешки', isHit: 0, isNew: 1 },
  { name: 'Программа ДР Гарри Поттер', price: 14000, price_from: 1, subcategory_id: 3, description: 'Программа празднования дня рождения в стиле Гарри Поттера. Цена зависит от количества участников и выбранных опций.', isHit: 1, isNew: 0 },
];

const insertProduct = db.prepare('INSERT INTO products (name, price, price_from, subcategory_id, description, isHit, isNew) VALUES (?, ?, ?, ?, ?, ?, ?)');

try {
  products.forEach(product => {
    insertProduct.run(product.name, product.price, product.price_from, product.subcategory_id, product.description, product.isHit, product.isNew);
  });
  console.log('Database initialized with sample products, categories and subcategories!');
} catch (error) {
  console.error('Error inserting products:', error);
}

db.close();

