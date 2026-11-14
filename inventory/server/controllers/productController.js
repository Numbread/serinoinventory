// productController.js: CRUD operations and search for products using Supabase
const supabase = require('../db');

/**
 * Retrieves all products from Supabase, optionally filtered by name (?search=).
 * Joins with the categories table to include category name.
 */
async function getAllProducts(req, res) {
  try {
    const { search } = req.query;

    let query = supabase
      .from('products')
      .select('id, name, category_id, price, quantity, reorder_level, categories(name)')
      .order('id', { ascending: false });

    // Filter by name if search term is provided
    if (search && search.trim() !== '') {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Error fetching products from Supabase:', error);
      return res.status(500).json({ message: 'Failed to retrieve products.' });
    }

    // Flatten joined categories(name) to category_name for frontend compatibility
    const formatted = (products || []).map((p) => ({
      id: p.id,
      name: p.name,
      category_id: p.category_id,
      category_name: p.categories ? p.categories.name : 'Uncategorized',
      price: p.price,
      quantity: p.quantity,
      reorder_level: p.reorder_level
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return res.status(500).json({ message: 'Failed to retrieve products.' });
  }
}

/**
 * Creates a new product in the Supabase inventory.
 */
async function createProduct(req, res) {
  try {
    const { name, category_id, price, quantity, reorder_level } = req.body;

    // Validate required fields
    if (!name || category_id === undefined || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Name, category, price, and initial quantity are required.' });
    }

    // Validate numeric values
    const numPrice = parseFloat(price);
    const numQuantity = parseInt(quantity, 10);
    const numReorderLevel = reorder_level !== undefined ? parseInt(reorder_level, 10) : 5;

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ message: 'Price must be a valid non-negative number.' });
    }
    if (isNaN(numQuantity) || numQuantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
    }
    if (isNaN(numReorderLevel) || numReorderLevel < 0) {
      return res.status(400).json({ message: 'Reorder level must be a non-negative integer.' });
    }

    // Verify category exists
    const { data: catRows, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .limit(1);

    if (catError || !catRows || catRows.length === 0) {
      return res.status(400).json({ message: 'Selected category does not exist.' });
    }

    // Insert new product into Supabase
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert([{
        name: name.trim(),
        category_id: Number(category_id),
        price: numPrice,
        quantity: numQuantity,
        reorder_level: numReorderLevel
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating product in Supabase:', insertError);
      return res.status(500).json({ message: 'Failed to create product.' });
    }

    return res.status(201).json({
      message: 'Product created successfully.',
      product: newProduct
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    return res.status(500).json({ message: 'Failed to create product.' });
  }
}

/**
 * Updates an existing product's details by ID.
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, category_id, price, quantity, reorder_level } = req.body;

    // Validate required fields
    if (!name || category_id === undefined || price === undefined || quantity === undefined) {
      return res.status(400).json({ message: 'Name, category, price, and quantity are required.' });
    }

    const numPrice = parseFloat(price);
    const numQuantity = parseInt(quantity, 10);
    const numReorderLevel = reorder_level !== undefined ? parseInt(reorder_level, 10) : 5;

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ message: 'Price must be a valid non-negative number.' });
    }
    if (isNaN(numQuantity) || numQuantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
    }
    if (isNaN(numReorderLevel) || numReorderLevel < 0) {
      return res.status(400).json({ message: 'Reorder level must be a non-negative integer.' });
    }

    // Verify category exists
    const { data: catRows, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .limit(1);

    if (catError || !catRows || catRows.length === 0) {
      return res.status(400).json({ message: 'Selected category does not exist.' });
    }

    // Update product in Supabase
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        name: name.trim(),
        category_id: Number(category_id),
        price: numPrice,
        quantity: numQuantity,
        reorder_level: numReorderLevel
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product in Supabase:', updateError);
      return res.status(500).json({ message: 'Failed to update product.' });
    }

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json({
      message: 'Product updated successfully.',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    return res.status(500).json({ message: 'Failed to update product.' });
  }
}

/**
 * Deletes a product by ID.
 * Cascade deletes linked stock movements automatically via Foreign Key constraint.
 */
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting product from Supabase:', deleteError);
      return res.status(500).json({ message: 'Failed to delete product.' });
    }

    return res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return res.status(500).json({ message: 'Failed to delete product.' });
  }
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
