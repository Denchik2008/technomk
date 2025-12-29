const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'techno_center_secret_key_2024';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'daniilcencenko947@gmail.com',
    pass: 'ikzreihywtgrbmhs' // Пароль приложения Gmail
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ charset: 'utf-8' }));
app.use(bodyParser.urlencoded({ extended: true, charset: 'utf-8' }));

// Set charset for all responses
app.use((req, res, next) => {
  res.charset = 'utf-8';
  next();
});

// Only serve static files if build directory exists
const buildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
}

// Setup uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'));
    }
  }
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Database
const db = new Database('shop.db');

// Ensure UTF-8 encoding
db.pragma('encoding = "UTF-8"');

// Enable foreign keys for CASCADE to work
db.pragma('foreign_keys = ON');

// Auth API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = db.prepare(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
    ).run(email, hashedPassword, name);
    
    // Generate token
    const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: result.lastInsertRowid, email, name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Orders API
app.get('/api/users/orders', authenticateToken, (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    
    // Get order items for each order
    const ordersWithItems = orders.map(order => {
      const items = db.prepare('SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?').all(order.id);
      return { ...order, items };
    });
    
    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload API
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contact Form API
app.post('/api/contact', upload.single('attachment'), async (req, res) => {
  console.log('=== CONTACT FORM REQUEST RECEIVED ===');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  
  try {
    const { name, email, phone, message } = req.body;
    const attachment = req.file ? `/uploads/${req.file.filename}` : null;
    
    console.log('Parsed data:', { name, email, phone, message, attachment });
    
    // Сохраняем в базу данных
    const result = db.prepare(
      'INSERT INTO contact_messages (name, email, phone, message, attachment) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, phone, message, attachment);
    
    console.log('Saved to database with ID:', result.lastInsertRowid);
    
    // Отправляем email на daniilcencenko947@gmail.com
    try {
      const mailOptions = {
        from: 'daniilcencenko947@gmail.com',
        to: 'daniilcencenko947@gmail.com',
        subject: `Новое сообщение от ${name}`,
        html: `
          <h2>Новое сообщение с формы обратной связи</h2>
          <p><strong>Имя:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Телефон:</strong> ${phone}</p>
          <p><strong>Сообщение:</strong></p>
          <p>${message}</p>
          ${attachment ? `<p><strong>Прикреплен файл:</strong> ${attachment}</p>` : ''}
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully to daniilcencenko947@gmail.com');
      res.json({ id: result.lastInsertRowid, message: 'Сообщение отправлено' });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Даже если email не отправился, сообщение сохранено в БД
      res.json({ 
        id: result.lastInsertRowid, 
        message: 'Сообщение не отправлено, попробуйте позже',
        emailError: true 
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Сообщение не отправлено, попробуйте позже' });
  }
});

// Products API
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { name, price, price_from, subcategory_id, description, image, isHit, isNew } = req.body;
    const result = db.prepare(
      'INSERT INTO products (name, price, price_from, subcategory_id, description, image, isHit, isNew) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, price, price_from || 0, subcategory_id, description, image || '', isHit || 0, isNew || 0);
    res.json({ id: result.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const { name, price, price_from, subcategory_id, description, image, isHit, isNew } = req.body;
    db.prepare(
      'UPDATE products SET name = ?, price = ?, price_from = ?, subcategory_id = ?, description = ?, image = ?, isHit = ?, isNew = ? WHERE id = ?'
    ).run(name, price, price_from || 0, subcategory_id, description, image, isHit, isNew, req.params.id);
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders API
app.get('/api/orders', (req, res) => {
  try {
    const { status, category_id } = req.query;
    let query = 'SELECT * FROM orders';
    let params = [];
    
    if (status) {
      // Для "Невыполненных" показываем все активные статусы
      if (status === 'pending') {
        query += ' WHERE status IN (?, ?, ?)';
        params.push('pending', 'under_review', 'awaiting_payment');
      } else {
        query += ' WHERE status = ?';
        params.push(status);
      }
    }
    
    query += ' ORDER BY created_at DESC';
    
    let orders = db.prepare(query).all(...params);
    
    // Get order items with full info for each order
    orders = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.name, p.price, p.image, p.subcategory_id,
               s.name as subcategory_name, s.parent_id,
               c.name as category_name
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        LEFT JOIN subcategories s ON p.subcategory_id = s.id
        LEFT JOIN categories c ON s.parent_id = c.id
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });
    
    // Filter by category if specified
    if (category_id && category_id !== 'all') {
      orders = orders.filter(order => 
        order.items.some(item => item.parent_id === parseInt(category_id))
      );
    }
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const { user_id, customer_name, customer_email, customer_phone, customer_address, comment, items, total, status, has_comment } = req.body;
    
    const result = db.prepare(
      'INSERT INTO orders (user_id, customer_name, customer_email, customer_phone, customer_address, comment, total, original_total, has_comment, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(user_id || null, customer_name, customer_email, customer_phone, customer_address || '', comment || '', total, total, has_comment || 0, status || 'pending');
    
    const orderId = result.lastInsertRowid;
    
    // Insert order items
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    items.forEach(item => {
      insertItem.run(orderId, item.product_id, item.quantity, item.price);
    });
    
    res.json({ id: orderId, message: 'Order created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/total', (req, res) => {
  try {
    const { total } = req.body;
    db.prepare('UPDATE orders SET total = ? WHERE id = ?').run(total, req.params.id);
    res.json({ message: 'Order total updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories API (главные каталоги)
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name, description, image, has_comments } = req.body;
    const result = db.prepare('INSERT INTO categories (name, description, image, has_comments) VALUES (?, ?, ?, ?)').run(name, description || '', image || '', has_comments || 0);
    res.json({ id: result.lastInsertRowid, name, description, image, has_comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:id', (req, res) => {
  try {
    const { name, description, image, has_comments } = req.body;
    db.prepare('UPDATE categories SET name = ?, description = ?, image = ?, has_comments = ? WHERE id = ?').run(name, description, image, has_comments || 0, req.params.id);
    res.json({ id: req.params.id, name, description, image, has_comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    // CASCADE will automatically delete subcategories and products
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    if (result.changes > 0) {
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ error: 'Category not found' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Subcategories API (подкаталоги)
app.get('/api/categories/:id/subcategories', (req, res) => {
  try {
    const subcategories = db.prepare('SELECT * FROM subcategories WHERE parent_id = ? ORDER BY name').all(req.params.id);
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/subcategories', (req, res) => {
  try {
    const subcategories = db.prepare('SELECT s.*, c.name as category_name FROM subcategories s JOIN categories c ON s.parent_id = c.id ORDER BY s.name').all();
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subcategories', (req, res) => {
  try {
    const { parent_id, name, description, image } = req.body;
    const result = db.prepare('INSERT INTO subcategories (parent_id, name, description, image) VALUES (?, ?, ?, ?)').run(parent_id, name, description || '', image || '');
    res.json({ id: result.lastInsertRowid, parent_id, name, description, image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/subcategories/:id', (req, res) => {
  try {
    const { parent_id, name, description, image } = req.body;
    db.prepare('UPDATE subcategories SET parent_id = ?, name = ?, description = ?, image = ? WHERE id = ?').run(parent_id, name, description, image, req.params.id);
    res.json({ id: req.params.id, parent_id, name, description, image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/subcategories/:id', (req, res) => {
  try {
    // CASCADE will automatically delete products
    const result = db.prepare('DELETE FROM subcategories WHERE id = ?').run(req.params.id);
    if (result.changes > 0) {
      res.json({ message: 'Subcategory deleted successfully' });
    } else {
      res.status(404).json({ error: 'Subcategory not found' });
    }
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/subcategories/:id/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products WHERE subcategory_id = ?').all(req.params.id);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reviews API
app.get('/api/products/:id/reviews', (req, res) => {
  try {
    const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products/:id/reviews', (req, res) => {
  try {
    const { customer_name, rating, comment } = req.body;
    const result = db.prepare(
      'INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)'
    ).run(req.params.id, customer_name, rating, comment || '');
    res.json({ id: result.lastInsertRowid, message: 'Review added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app (only in production)
app.get('*', (req, res) => {
  const buildPath = path.join(__dirname, '../client/build', 'index.html');
  if (fs.existsSync(buildPath)) {
    res.sendFile(buildPath);
  } else {
    res.json({ message: 'API is running. Start the client separately in development mode.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

