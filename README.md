# Urban Harvest Vending Machine UI

A modern, touch-friendly vending machine interface for creating custom smoothies and salads. Built with React, TypeScript, Tailwind CSS, and FastAPI.

## 🌟 Features

- **Modern Touch Interface**: Optimized for 19" portrait touchscreen displays
- **Custom Item Creation**: Interactive ingredient selection for smoothies and salads
- **Preset Menu Items**: Pre-configured popular combinations
- **Real-time Calculations**: Dynamic price and calorie calculations
- **Inventory Management**: Real-time ingredient availability tracking
- **Order Processing**: Complete order flow from selection to completion
- **Production-Ready Backend**: FastAPI middleware with PostgreSQL database

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │───▶│  FastAPI API    │───▶│   PostgreSQL    │
│   (React/TS)    │    │   (Python)      │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python) with async database operations
- **Database**: PostgreSQL with production-ready schema
- **State Management**: Zustand for global state
- **API Client**: React Query for data fetching

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL 12+

### 1. Database Setup

```bash
# Navigate to database directory
cd database

# Run setup script (Linux/macOS)
chmod +x setup.sh
./setup.sh

# OR for Windows
setup.bat
```

### 2. API Setup

```bash
# Navigate to API directory
cd api

# Run setup script (Linux/macOS)
chmod +x setup.sh
./setup.sh

# OR for Windows
setup.bat

# Start the API server
python main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: http://localhost:5173

## 📁 Project Structure

```
uharvest_vendingm_ui/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # API client and utilities
│   │   └── hooks/         # Custom React hooks
├── api/                   # FastAPI backend
│   ├── main.py           # API application
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment configuration
├── database/              # Database schema and scripts
│   ├── schema.sql        # Production-ready database schema
│   └── setup.sh          # Database setup script
└── shared/               # Shared TypeScript types
```

## 🎨 UI Pages

### Welcome Page
- Brand introduction with floating animations
- "Get Started" call-to-action

### Selection Page
- Choose between Smoothies and Salads
- Category-specific navigation

### Items Page (Tabbed Interface)
- **Create Tab**: Interactive ingredient selection
- **Saved Tab**: User's saved custom recipes
- **Originals Tab**: Preset menu items

### Customization Page
- Review and modify selected items
- Add-ons and final adjustments

### Payment → Processing → Thank You
- Complete order flow with real-time status updates

## 🗄️ Database Schema

The production-ready PostgreSQL schema includes:

### Core Tables
- `users` - Customer information
- `vending_machines` - Machine status and inventory
- `ingredients` - Available ingredients with pricing
- `presets` - Pre-configured menu items
- `orders` - Customer orders and status

### Features
- **Referential Integrity**: Foreign keys with CASCADE/SET NULL rules
- **Data Validation**: CHECK constraints for business rules
- **Performance**: Optimized indexes for production
- **Sample Data**: Realistic test data included

## 🔧 API Endpoints

### Ingredients
- `GET /api/ingredients` - Get available ingredients

### Menu Items
- `GET /api/items/{category}` - Get preset items by category
- `GET /api/items/{category}/saved` - Get user's saved items
- `POST /api/items/calculate` - Calculate custom item price/calories

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}/status` - Get order status

### Machine
- `GET /api/machine/status` - Get machine status and inventory

## 🎛️ Configuration

### Environment Variables

Create `.env` files in the `api/` directory:

```bash
# Database
DATABASE_URL=postgresql://uharvest:uharvest_password@localhost:5432/uharvest_db

# Machine
MACHINE_ID=550e8400-e29b-41d4-a716-446655440000

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

Create `.env.local` in the `client/` directory:

```bash
VITE_API_URL=http://localhost:8000
```

## 🔄 Development Workflow

### Running in Development Mode

1. **Database**: Ensure PostgreSQL is running
2. **API**: `cd api && python main.py`
3. **Frontend**: `cd client && npm run dev`

### Building for Production

```bash
# Build frontend
cd client && npm run build

# Frontend files will be in client/dist/
# Serve with nginx or your preferred web server

# API is production-ready as-is
# Deploy with gunicorn or uvicorn
```

## 🧪 Testing

### Database Testing
```sql
-- Connect to database and test sample data
psql -h localhost -U uharvest -d uharvest_db
SELECT * FROM ingredients LIMIT 5;
SELECT * FROM presets WHERE category = 'smoothie';
```

### API Testing
```bash
# Test API endpoints
curl http://localhost:8000/api/ingredients
curl http://localhost:8000/api/items/smoothie
```

### Frontend Testing
```bash
cd client
npm run test  # If tests are configured
```

## 🚀 Deployment

### Production Checklist

1. **Database**:
   - Set up PostgreSQL with production credentials
   - Run schema.sql to create tables and sample data
   - Configure connection pooling

2. **API**:
   - Update .env with production settings
   - Use gunicorn or uvicorn for WSGI server
   - Set up reverse proxy (nginx)
   - Enable HTTPS

3. **Frontend**:
   - Build production bundle: `npm run build`
   - Serve static files with nginx
   - Configure CORS for production API

## 🔧 Customization

### Adding New Ingredients
1. Insert into `ingredients` table
2. Update frontend ingredient list
3. Test in Create tab interface

### Adding New Presets
1. Insert into `presets` table
2. Add ingredient mappings in `preset_ingredients`
3. Update frontend Originals tab

### UI Customization
- Modify Tailwind config for brand colors
- Update floating animations in `floating-animation.tsx`
- Customize touch targets in component styles

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL status
pg_isready
# Restart PostgreSQL service
sudo systemctl restart postgresql  # Linux
brew services restart postgresql   # macOS
```

**API Import Errors**
```bash
# Ensure virtual environment is activated
cd api && source venv/bin/activate  # Linux/macOS
cd api && venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Frontend Build Errors**
```bash
# Clear node_modules and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is proprietary software for Urban Harvest vending machines.

## 🤝 Support

For technical support or deployment assistance, contact the development team.

---

**Built with ❤️ for Urban Harvest**
