import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";

// Backend API base URL
const BACKEND_API_URL = 'http://localhost:8000';

// Machine API client functions
async function fetchFromMachine(endpoint: string) {
  const response = await fetch(`${BACKEND_API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Machine API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function postToMachine(endpoint: string, data?: any) {
  const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) {
    throw new Error(`Machine API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function putToMachine(endpoint: string, data: any) {
  const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`Machine API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Machine API Routes - Proxy to backend
  
  // Get machine inventory
  app.get("/api/machines/:machineId/inventory", async (req, res) => {
    try {
      const { machineId } = req.params;
      const inventoryData = await fetchFromMachine(`/api/v1/machines/${machineId}/inventory`);
      res.json(inventoryData);
    } catch (error) {
      res.status(500).json({ error: "Failed to connect to machine API" });
    }
  });

  // Get machine presets
  app.get("/api/machines/:machineId/presets", async (req, res) => {
    try {
      const { machineId } = req.params;
      const { category } = req.query;
      
      let endpoint = `/api/v1/machines/${machineId}/presets`;
      if (category) {
        endpoint += `?category=${category}`;
      }
      
      const presetsData = await fetchFromMachine(endpoint);
      res.json(presetsData);
    } catch (error) {
      res.status(500).json({ error: "Failed to connect to machine API" });
    }
  });

  // Get preset details
  app.get("/api/presets/:presetId", async (req, res) => {
    console.log("🔥 Preset details route hit with ID:", req.params.presetId);
    try {
      const { presetId } = req.params;
      
      const endpoint = `/api/v1/presets/${presetId}`;
      console.log("🔥 Calling backend endpoint:", endpoint);
      const presetDetails = await fetchFromMachine(endpoint);
      console.log("🔥 Backend response:", presetDetails);
      res.json(presetDetails);
    } catch (error) {
      console.error("🔥 Error in preset details:", error);
      res.status(500).json({ error: "Failed to connect to machine API" });
    }
  });

  // Update machine inventory (PUT)
  app.put("/api/machines/:machineId/inventory", async (req, res) => {
    try {
      const { machineId } = req.params;
      const updatedInventory = await putToMachine(`/api/v1/machines/${machineId}/inventory`, req.body);
      res.json(updatedInventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to connect to machine API" });
    }
  });

  // Original Demo API Routes (legacy)
  
  // Get all menu items
  app.get("/api/menu", async (req, res) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  // Get menu items by category
  app.get("/api/menu/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const items = await storage.getMenuItemsByCategory(category);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  // Get single menu item
  app.get("/api/menu/item/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getMenuItem(id);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu item" });
    }
  });

  // Get all add-ons
  app.get("/api/addons", async (req, res) => {
    try {
      const addons = await storage.getAddons();
      res.json(addons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch add-ons" });
    }
  });

  // Create order (proxy to machine API)
  app.post("/api/orders", async (req, res) => {
    try {
      const endpoint = `/api/v1/orders`;
      const orderData = await postToMachine(endpoint, req.body);
      res.status(201).json(orderData);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Update order status (proxy to machine API)
  app.put("/api/orders/:orderId/status", async (req, res) => {
    try {
      const { orderId } = req.params;
      const endpoint = `/api/v1/orders/${orderId}/status`;
      const result = await putToMachine(endpoint, req.body);
      res.json(result);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Get order details (proxy to machine API)
  app.get("/api/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const endpoint = `/api/v1/orders/${orderId}`;
      const orderData = await fetchFromMachine(endpoint);
      res.json(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
