import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItems = pgTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'smoothies' or 'salads'
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  calories: integer("calories").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
});

export const addons = pgTable("addons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  icon: text("icon").notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  itemId: text("item_id").notNull(),
  itemName: text("item_name").notNull(),
  itemPrice: decimal("item_price", { precision: 10, scale: 2 }).notNull(),
  addons: text("addons").notNull(), // JSON string of selected addons
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("processing"), // 'processing', 'completed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems);
export const insertAddonSchema = createInsertSchema(addons);
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type Addon = typeof addons.$inferSelect;
export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Frontend types
export interface SelectedAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;
  item: MenuItem;
  addons: SelectedAddon[];
  total: number;
}
