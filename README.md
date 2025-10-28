# Weather Now 🌤️

A responsive weather application built for Jamie, the Outdoor Enthusiast. Get real-time weather information for any city worldwide with a beautiful, user-friendly interface.


## Features

- **Real-time Weather Data**: Get current weather conditions for any city worldwide
- **Beautiful UI**: Gradient backgrounds with glassmorphic design elements
- **Fully Responsive**: Works seamlessly on mobile, tablet, and desktop devices
- **Weather Icons**: Dynamic icons that change based on weather conditions
- **Comprehensive Information**: 
  - Current temperature and "feels like" temperature
  - Weather condition descriptions
  - Humidity levels
  - Wind speed and direction
  - Last updated timestamp
- **Error Handling**: Graceful error messages for invalid cities or network issues
- **Loading States**: Smooth loading indicators for better UX
- **Keyboard Support**: Press Enter to search

## 🚀 Live Demo

[View Live Application](#) <!-- Add your deployment URL here -->

##  Technology Stack

- **Frontend Framework**: React 18.3 with Vite
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **API**: Open-Meteo Weather API (no authentication required)
- **State Management**: React useState hooks
- **Build Tool**: Vite

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd weather-now
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:5173
   ```

##  Project Structure

```
weather-now/
├── public/              # Static assets
├── src/
│   ├── App.jsx         # Main application component
│   ├── index.css       # Global styles with Tailwind directives
│   └── main.jsx        # Application entry point
├── index.html          # HTML template
├── package.json        # Project dependencies
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
└── vite.config.js      # Vite configuration
```

##  Responsive Design

The application is fully responsive and optimized for:
- **Mobile devices** (320px and up)
- **Tablets** (768px and up)
- **Desktops** (1024px and up)

### Responsive Features:
- Flexible grid layouts
- Touch-friendly buttons and inputs
- Adaptive font sizes
- Optimized spacing for different screen sizes

##  Design Decisions

### Color Scheme
- **Primary**: Blue gradient (from-blue-400 to via-blue-500)
- **Secondary**: Purple accent (to-purple-600)
- **Background**: Glassmorphic white overlays with backdrop blur

### Typography
- System font stack for better performance
- Responsive font sizes (text-4xl on mobile to text-6xl on desktop)

### User Experience
- Clear visual feedback for all interactions
- Loading states to prevent user confusion
- Error messages displayed prominently
- Intuitive search interface

## API Integration

### Open-Meteo API

**Geocoding API**
```
https://geocoding-api.open-meteo.com/v1/search
```
- Converts city names to geographic coordinates
- Returns city name, country, latitude, and longitude

**Weather API**
```
https://api.open-meteo.com/v1/forecast
```
- Parameters used:
  - `temperature_2m`: Current temperature
  - `relative_humidity_2m`: Humidity percentage
  - `apparent_temperature`: "Feels like" temperature
  - `weather_code`: WMO weather condition code
  - `wind_speed_10m`: Wind speed at 10 meters
  - `wind_direction_10m`: Wind direction in degrees

### Weather Codes (WMO)

The app uses WMO (World Meteorological Organization) weather interpretation codes:

| Code | Description |
|------|-------------|
| 0 | Clear sky |
| 1 | Mainly clear |
| 2 | Partly cloudy |
| 3 | Overcast |
| 45, 48 | Foggy |
| 51-55 | Drizzle (light to dense) |
| 61-65 | Rain (slight to heavy) |
| 71-77 | Snow (slight to heavy) |
| 80-82 | Rain showers |
| 85-86 | Snow showers |
| 95-99 | Thunderstorm |

##  Error Handling

The application handles the following error scenarios:

1. **Empty Search**: Prompts user to enter a city name
2. **City Not Found**: Displays helpful error message
3. **Network Errors**: Catches and displays API failures
4. **Invalid Responses**: Gracefully handles unexpected data

## Testing

### Manual Testing Checklist

- [x] Search for valid cities (London, Tokyo, New York, Mumbai)
- [x] Test with invalid city names
- [x] Test with empty search
- [x] Test responsive design on multiple devices
- [x] Test keyboard navigation (Enter key)
- [x] Test error scenarios
- [x] Test loading states
- [x] Verify all weather data displays correctly

### Browser Compatibility

Tested and working on:
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Microsoft Edge (latest)
- Safari (latest)

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

### Deployment Options

**Vercel**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm run build
# Upload the 'dist' folder to Netlify
```

**GitHub Pages**
```bash
npm run build
# Deploy the 'dist' folder
```

## 📝 Code Quality

### Best Practices Implemented

- ✅ Clean, readable code with descriptive variable names
- ✅ Comprehensive comments and documentation
- ✅ Modular function design
- ✅ Proper error handling
- ✅ Consistent code formatting
- ✅ Semantic HTML elements
- ✅ Accessibility considerations (ARIA labels)

### Code Comments

The codebase includes:
- File-level documentation
- Function-level JSDoc comments
- Inline comments for complex logic
- Clear parameter and return type descriptions

##  User Requirements Met

### For Jamie, the Outdoor Enthusiast

✅ **Quick Access**: Fast, one-click weather search  
✅ **Essential Information**: Temperature, conditions, wind, humidity  
✅ **Visual Clarity**: Large, readable fonts and clear icons  
✅ **Mobile-First**: Perfect for checking weather on-the-go  
✅ **Reliable**: Accurate data from trusted weather sources  

