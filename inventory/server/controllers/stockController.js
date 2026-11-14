// stockController.js: Manages Stock IN / Stock OUT movements using Supabase
const supabase = require('../db');

/**
 * Retrieves all stock movements with joined product and user details from Supabase,
 * ordered by most recent first.
 */
async function getStockMovements(req, res) {
  try {
    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select('id, product_id, user_id, type, quantity, created_at, products(name), users(username)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stock movements from Supabase:', error);
      return res.status(500).json({ message: 'Failed to retrieve stock movements.' });
    }

    // Flatten joined relations for frontend compatibility
    const formatted = (movements || []).map((m) => ({
      id: m.id,
      product_id: m.product_id,
      product_name: m.products ? m.products.name : 'Unknown Product',
      user_id: m.user_id,
      user_name: m.users ? m.users.username : 'Unknown User',
      type: m.type,
      quantity: m.quantity,
      created_at: m.created_at
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Error in getStockMovements:', error);
    return res.status(500).json({ message: 'Failed to retrieve stock movements.' });
  }
}

/**
 * Records a Stock IN or Stock OUT movement.
 * Validates available stock for Stock OUT and updates product quantity in Supabase.
 */
async function createStockMovement(req, res) {
  try {
    const { product_id, type, quantity } = req.body;
    const user_id = req.user.id; // Extracted from JWT token payload by authMiddleware

    // Validate inputs
    if (!product_id || !type || quantity === undefined) {
      return res.status(400).json({ message: 'Product, movement type, and quantity are required.' });
    }

    if (type !== 'IN' && type !== 'OUT') {
      return res.status(400).json({ message: 'Movement type must be either IN or OUT.' });
    }

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({ message: 'Movement quantity must be a positive number greater than 0.' });
    }

    // 1. Fetch current product information from Supabase
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, quantity')
      .eq('id', product_id)
      .single();

    if (fetchError || !product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // 2. Block Stock OUT if inventory is insufficient
    if (type === 'OUT' && product.quantity < numQuantity) {
      return res.status(400).json({
        message: `Insufficient stock! Current stock for "${product.name}" is ${product.quantity}, but requested to remove ${numQuantity}.`
      });
    }

    // 3. Calculate new quantity
    const newQuantity = type === 'IN'
      ? product.quantity + numQuantity
      : product.quantity - numQuantity;

    // 4. Update product quantity in Supabase
    const { error: updateError } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', product_id);

    if (updateError) {
      console.error('Error updating product stock in Supabase:', updateError);
      return res.status(500).json({ message: 'Failed to update product quantity.' });
    }

    // 5. Record movement entry in stock_movements table
    const { data: movement, error: insertError } = await supabase
      .from('stock_movements')
      .insert([{
        product_id: Number(product_id),
        user_id: Number(user_id),
        type,
        quantity: numQuantity
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error recording stock movement in Supabase:', insertError);
      return res.status(500).json({ message: 'Failed to record movement entry.' });
    }

    return res.status(201).json({
      message: `Stock ${type} of ${numQuantity} recorded successfully for "${product.name}".`,
      movement: {
        id: movement.id,
        product_id,
        product_name: product.name,
        user_id,
        type,
        quantity: numQuantity,
        previous_quantity: product.quantity,
        updated_quantity: newQuantity
      }
    });
  } catch (error) {
    console.error('Error in createStockMovement:', error);
    return res.status(500).json({ message: 'Failed to record stock movement.' });
  }
}

module.exports = {
  getStockMovements,
  createStockMovement
};
