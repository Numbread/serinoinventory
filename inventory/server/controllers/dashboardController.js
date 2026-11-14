// dashboardController.js: Gathers summary metrics, low stock items, and recent activity using Supabase
const supabase = require('../db');

/**
 * Retrieves dashboard summary data from Supabase:
 * 1. Total product count
 * 2. Total category count
 * 3. Low-stock products list and count (quantity <= reorder_level)
 * 4. The 5 most recent stock movements
 */
async function getDashboardSummary(req, res) {
  try {
    // 1. Total products count
    const { count: totalProducts, error: prodCountErr } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (prodCountErr) {
      console.error('Error fetching product count from Supabase:', prodCountErr);
    }

    // 2. Total categories count
    const { count: totalCategories, error: catCountErr } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (catCountErr) {
      console.error('Error fetching category count from Supabase:', catCountErr);
    }

    // 3. Products list with joined categories to evaluate low-stock items
    const { data: allProducts, error: prodErr } = await supabase
      .from('products')
      .select('id, name, category_id, price, quantity, reorder_level, categories(name)');

    if (prodErr) {
      console.error('Error fetching products for low stock analysis:', prodErr);
    }

    // Filter products where current quantity is less than or equal to reorder_level
    const lowStockProducts = (allProducts || [])
      .filter((p) => Number(p.quantity) <= Number(p.reorder_level))
      .map((p) => ({
        id: p.id,
        name: p.name,
        category_id: p.category_id,
        category_name: p.categories ? p.categories.name : 'Uncategorized',
        price: p.price,
        quantity: p.quantity,
        reorder_level: p.reorder_level
      }))
      .sort((a, b) => a.quantity - b.quantity);

    // 4. The 5 most recent stock movements
    const { data: rawMovements, error: moveErr } = await supabase
      .from('stock_movements')
      .select('id, product_id, user_id, type, quantity, created_at, products(name), users(username)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (moveErr) {
      console.error('Error fetching recent movements from Supabase:', moveErr);
    }

    const recentMovements = (rawMovements || []).map((m) => ({
      id: m.id,
      product_id: m.product_id,
      product_name: m.products ? m.products.name : 'Unknown Product',
      user_id: m.user_id,
      user_name: m.users ? m.users.username : 'Unknown User',
      type: m.type,
      quantity: m.quantity,
      created_at: m.created_at
    }));

    return res.status(200).json({
      totalProducts: totalProducts || 0,
      totalCategories: totalCategories || 0,
      totalLowStock: lowStockProducts.length,
      lowStockProducts,
      recentMovements
    });
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    return res.status(500).json({ message: 'Failed to retrieve dashboard summary data.' });
  }
}

module.exports = {
  getDashboardSummary
};
