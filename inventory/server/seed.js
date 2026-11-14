// seed.js: Seed database with admin user, categories, products, and movements
const supabase = require('./db');
const bcrypt = require('bcrypt');

async function runSeed() {
  console.log('Seeding Supabase database...');

  try {
    // 1. Check or insert Admin User
    const { data: users, error: userCheckErr } = await supabase.from('users').select('*').eq('username', 'admin');
    if (userCheckErr) throw userCheckErr;

    let adminId;
    if (users.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const { data: newUser, error: userInsertErr } = await supabase
        .from('users')
        .insert([{ username: 'admin', password: hashedPassword, role: 'admin' }])
        .select()
        .single();
      if (userInsertErr) throw userInsertErr;
      adminId = newUser.id;
      console.log('✓ Admin user seeded successfully (username: admin, password: admin123)');
    } else {
      adminId = users[0].id;
      console.log('✓ Admin user already exists.');
    }

    // 2. Check or insert Categories
    const { data: categories, error: catCheckErr } = await supabase.from('categories').select('*');
    if (catCheckErr) throw catCheckErr;

    let categoryMap = {};
    if (categories.length === 0) {
      const { data: newCats, error: catInsertErr } = await supabase
        .from('categories')
        .insert([
          { name: 'Electronics' },
          { name: 'Office Supplies' },
          { name: 'Furniture' }
        ])
        .select();
      if (catInsertErr) throw catInsertErr;
      newCats.forEach(c => { categoryMap[c.name] = c.id; });
      console.log('✓ 3 Categories seeded successfully.');
    } else {
      categories.forEach(c => { categoryMap[c.name] = c.id; });
      console.log('✓ Categories already exist.');
    }

    // 3. Check or insert Products
    const { data: products, error: prodCheckErr } = await supabase.from('products').select('*');
    if (prodCheckErr) throw prodCheckErr;

    if (products.length === 0) {
      const elecId = categoryMap['Electronics'] || Object.values(categoryMap)[0];
      const officeId = categoryMap['Office Supplies'] || Object.values(categoryMap)[0];
      const furnId = categoryMap['Furniture'] || Object.values(categoryMap)[0];

      const { data: newProds, error: prodInsertErr } = await supabase
        .from('products')
        .insert([
          { name: 'Wireless Mouse', category_id: elecId, price: 25.00, quantity: 4, reorder_level: 10 },
          { name: 'Mechanical Keyboard', category_id: elecId, price: 65.00, quantity: 15, reorder_level: 5 },
          { name: 'Ballpoint Pens (Box)', category_id: officeId, price: 8.50, quantity: 3, reorder_level: 8 },
          { name: 'Spiral Notebook', category_id: officeId, price: 3.00, quantity: 30, reorder_level: 10 },
          { name: 'Ergonomic Desk Chair', category_id: furnId, price: 149.99, quantity: 8, reorder_level: 5 }
        ])
        .select();
      if (prodInsertErr) throw prodInsertErr;
      console.log('✓ 5 Products seeded successfully.');

      // 4. Seed initial stock movements
      if (newProds && newProds.length >= 3) {
        await supabase.from('stock_movements').insert([
          { product_id: newProds[0].id, user_id: adminId, type: 'IN', quantity: 10 },
          { product_id: newProds[0].id, user_id: adminId, type: 'OUT', quantity: 6 },
          { product_id: newProds[1].id, user_id: adminId, type: 'IN', quantity: 15 },
          { product_id: newProds[2].id, user_id: adminId, type: 'IN', quantity: 10 },
          { product_id: newProds[2].id, user_id: adminId, type: 'OUT', quantity: 7 }
        ]);
        console.log('✓ Initial stock movements seeded successfully.');
      }
    } else {
      console.log('✓ Products already exist.');
    }

    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('✗ Seeding error:', error);
  }
}

runSeed();
