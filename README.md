# Interactive US Map

This is an interactive map of the United States that allows filtering and visualization by different geographic resolutions:
- States
- Metro Areas
- Counties
- ZIP Codes

## Setup

1. First, install the dependencies:
```bash
npm install
```

2. Get a Mapbox Access Token:
   - Go to [Mapbox](https://www.mapbox.com/)
   - Create an account or sign in
   - Navigate to your account's tokens page
   - Create a new token or use the default public token
   - Replace `YOUR_MAPBOX_ACCESS_TOKEN` in `src/components/Map.js` with your token

3. Start the development server:
```bash
npm start
```

## Features

- Interactive map with hover effects
- Resolution switching between State, Metro, County, and ZIP Code levels
- Choropleth visualization
- Responsive design

## Technologies Used

- React
- Mapbox GL JS
- CSS3 