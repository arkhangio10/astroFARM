# AstroFarm - Sustainable Agriculture Simulation

AstroFarm is an educational farming simulation game that uses real NASA satellite data to teach sustainable agriculture practices. Players make farming decisions based on actual environmental data from the Central Valley of California.

🚀 **Live Demo**: Deploy in progress...

## 🌟 Features

- **Real NASA Data**: Uses MODIS NDVI, SMAP soil moisture, and GPM precipitation data
- **Educational Tips**: Contextual guidance based on sustainable farming practices
- **Achievement System**: Super Carrot medals with 4 tiers (Bronze, Silver, Gold, Platinum)
- **Multiplayer**: Asynchronous competition with weekly seeds and private rooms
- **Interactive Map**: Leaflet-based map with NASA data layers
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd astrofarm_game
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure Supabase:
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_init.sql`
   - Update `.env.local` with your Supabase credentials

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Play

1. **Start a Game**: Click "Start Playing" on the homepage
2. **Make Decisions**: Use the HUD to water, fertilize, plant, and harvest crops
3. **Learn from Tips**: Read contextual tips about sustainable farming practices
4. **Earn Achievements**: Get Super Carrot medals for good farming decisions
5. **Compete**: Join weekly challenges or create private rooms with friends

## 🗺️ Game Levels

1. **Humidity Management**: Learn to water efficiently with weather forecasts
2. **NDVI Interpretation**: Distinguish between cloud cover and crop stress
3. **Frost Protection**: Time planting to avoid frost damage
4. **Drought Response**: Manage water during dry periods
5. **Final Challenge**: Optimize all farming practices for maximum yield

## 📊 Data Sources

- **NDVI**: MODIS MCD13Q1 (250m resolution, 16-day composite)
- **Soil Moisture**: SMAP via Crop-CASMA (~1km resolution)
- **Temperature**: MODIS MOD11A2 (1km resolution, 8-day composite)
- **Precipitation**: GPM IMERG (0.1° resolution, 30-minute intervals)

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Leaflet** for interactive maps
- **Zustand** for state management
- **Framer Motion** for animations

### Backend
- **Next.js API Routes** (serverless)
- **Supabase** (PostgreSQL + Auth)
- **Zod** for validation

### Game Engine
- **Pure functions** for deterministic simulation
- **Seeded RNG** for reproducible results
- **Server-side validation** to prevent cheating

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run end-to-end tests
npm run test:e2e

# Run linting
npm run lint
```

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### Game Configuration

Edit `src/lib/config.ts` to modify:
- Game parameters (resources, costs, targets)
- Achievement criteria
- Tip rules and cooldowns
- Data layer configurations

## 📚 Educational Content

AstroFarm teaches:
- **Water Management**: Efficient irrigation and drought response
- **Soil Health**: Organic vs. synthetic fertilizers
- **Climate Data**: Interpreting satellite imagery and weather data
- **Sustainable Practices**: Environmental impact of farming decisions
- **Data Limitations**: Understanding resolution, latency, and accuracy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for providing open satellite data
- **Supabase** for the backend infrastructure
- **Vercel** for hosting and deployment
- **OpenStreetMap** for base map tiles

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Check the [Data & Principles](https://astrofarm.vercel.app/datos-y-principios) page
- Review the [FAIR/CARE principles](https://astrofarm.vercel.app/datos-y-principios) for data usage

## 🎯 Roadmap

- [ ] Additional crop types and regions
- [ ] Real-time multiplayer with WebSockets
- [ ] Mobile app with React Native
- [ ] Integration with more NASA datasets
- [ ] Advanced analytics and reporting
- [ ] Teacher dashboard for classroom use

---

**Built with ❤️ for sustainable agriculture education**

