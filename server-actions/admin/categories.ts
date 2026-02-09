"use server";

import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";

export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string;
    parent_id: string | null;
    image: string | null;
    icon: string | null;
    is_active: boolean;
    order_index: number;
    children?: Category[]; // For hierarchy
    product_count?: number;
};

export async function getCategories(includeInactive = false): Promise<Category[]> {
    try {
        let sql = `
            SELECT c.*, 
            (SELECT COUNT(*) FROM products p WHERE p.category_path LIKE CONCAT('%', c.slug, '%')) as product_count 
            FROM categories c
        `;

        if (!includeInactive) {
            sql += ` WHERE c.is_active = TRUE`;
        }

        sql += ` ORDER BY c.order_index ASC, c.name ASC`;

        const rows = await query(sql) as Category[];

        // Build hierarchy
        const categoryMap = new Map<string, Category>();
        const rootCategories: Category[] = [];

        // First pass: map all categories
        rows.forEach(cat => {
            cat.children = [];
            categoryMap.set(cat.id, cat);
        });

        // Second pass: link parents and children
        rows.forEach(cat => {
            if (cat.parent_id && categoryMap.has(cat.parent_id)) {
                categoryMap.get(cat.parent_id)!.children!.push(cat);
            } else {
                rootCategories.push(cat);
            }
        });

        return rootCategories;
    } catch (e) {
        console.error("Get Categories Error:", e);
        return [];
    }
}

export async function createCategory(data: any) {
    try {
        await requirePermission('inventory.categories');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    const { name, slug, description, parent_id, image, icon, is_active, order_index } = data;
    const id = uuidv4();

    try {
        await query(`
            INSERT INTO categories (id, name, slug, description, parent_id, image, icon, is_active, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, name, slug, description || '',
            parent_id || null, image || null, icon || null,
            is_active !== undefined ? is_active : true,
            order_index || 0
        ]);

        revalidatePath('/paths/admin/categories');
        revalidatePath('/shop');
        return { success: true, id };
    } catch (e: any) {
        console.error("Create Category Error:", e);
        if (e.code === 'ER_DUP_ENTRY') {
            return { error: 'Slug already exists. Please use a unique slug.' };
        }
        return { error: 'Failed to create category' };
    }
}

export async function updateCategory(id: string, data: any) {
    try {
        await requirePermission('inventory.categories');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    const { name, slug, description, parent_id, image, icon, is_active, order_index } = data;

    try {
        await query(`
            UPDATE categories 
            SET name = ?, slug = ?, description = ?, parent_id = ?, image = ?, icon = ?, is_active = ?, order_index = ?
            WHERE id = ?
        `, [
            name, slug, description,
            parent_id || null, image || null, icon || null,
            is_active, order_index,
            id
        ]);

        revalidatePath('/paths/admin/categories');
        revalidatePath('/shop');
        return { success: true };
    } catch (e: any) {
        console.error("Update Category Error:", e);
        if (e.code === 'ER_DUP_ENTRY') {
            return { error: 'Slug already exists.' };
        }
        return { error: 'Failed to update category' };
    }
}

export async function deleteCategory(id: string) {
    try {
        await requirePermission('inventory.categories');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check for subcategories
        const [subCheck] = await query(`SELECT COUNT(*) as count FROM categories WHERE parent_id = ?`, [id]) as any[];
        if (subCheck.count > 0) {
            return { error: 'Cannot delete category with subcategories. Delete them first.' };
        }

        // Check for usage in products (optional, strict check)
        // Since we store path string, strictly linking by ID isn't possible yet without schema change. 
        // For now, we allow deletion but warn user in UI.

        await query(`DELETE FROM categories WHERE id = ?`, [id]);

        revalidatePath('/paths/admin/categories');
        revalidatePath('/shop');
        return { success: true };
    } catch (e) {
        console.error("Delete Category Error:", e);
        return { error: 'Failed to delete category' };
    }
}
