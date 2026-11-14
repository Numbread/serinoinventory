// categoryController.js: CRUD operations for product categories using Supabase
const supabase = require('../db');

/**
 * Retrieves all categories from Supabase, sorted alphabetically by name.
 */
async function getAllCategories(req, res) {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      return res.status(500).json({ message: 'Failed to retrieve categories.' });
    }

    return res.status(200).json(categories || []);
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    return res.status(500).json({ message: 'Failed to retrieve categories.' });
  }
}

/**
 * Creates a new category.
 */
async function createCategory(req, res) {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const trimmedName = name.trim();

    // Check if category name already exists (case-insensitive)
    const { data: existing, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', trimmedName);

    if (checkError) {
      console.error('Error checking category uniqueness:', checkError);
      return res.status(500).json({ message: 'Failed to validate category name.' });
    }

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'A category with this name already exists.' });
    }

    // Insert new category into Supabase
    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert([{ name: trimmedName }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting category into Supabase:', insertError);
      return res.status(500).json({ message: 'Failed to create category.' });
    }

    return res.status(201).json({
      message: 'Category created successfully.',
      category: newCategory
    });
  } catch (error) {
    console.error('Error in createCategory:', error);
    return res.status(500).json({ message: 'Failed to create category.' });
  }
}

/**
 * Updates an existing category by its ID.
 */
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const trimmedName = name.trim();

    // Verify category exists
    const { data: existing, error: findError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .limit(1);

    if (findError || !existing || existing.length === 0) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // Check for duplicate name in other categories
    const { data: duplicates, error: dupError } = await supabase
      .from('categories')
      .select('id')
      .ilike('name', trimmedName)
      .neq('id', id);

    if (dupError) {
      console.error('Error checking duplicate category name:', dupError);
      return res.status(500).json({ message: 'Failed to validate category name.' });
    }

    if (duplicates && duplicates.length > 0) {
      return res.status(400).json({ message: 'Another category with this name already exists.' });
    }

    // Update category in Supabase
    const { data: updated, error: updateError } = await supabase
      .from('categories')
      .update({ name: trimmedName })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating category in Supabase:', updateError);
      return res.status(500).json({ message: 'Failed to update category.' });
    }

    return res.status(200).json({
      message: 'Category updated successfully.',
      category: updated
    });
  } catch (error) {
    console.error('Error in updateCategory:', error);
    return res.status(500).json({ message: 'Failed to update category.' });
  }
}

/**
 * Deletes a category by its ID.
 * Prevents deletion if products are currently linked to this category.
 */
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // Check if any product is assigned to this category
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) {
      console.error('Error checking linked products in Supabase:', countError);
      return res.status(500).json({ message: 'Failed to verify category associations.' });
    }

    if (count && count > 0) {
      return res.status(400).json({
        message: 'Cannot delete category: products are currently assigned to it. Reassign or delete those products first.'
      });
    }

    // Delete category
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting category from Supabase:', deleteError);
      return res.status(500).json({ message: 'Failed to delete category.' });
    }

    return res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return res.status(500).json({ message: 'Failed to delete category.' });
  }
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
