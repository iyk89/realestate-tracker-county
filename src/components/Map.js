import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import Tooltip from './Tooltip';
import PriceHistoryModal from './PriceHistoryModal';
import { supabase } from '../supabaseClient';

// Mapping of column names to human-readable labels
const columnLabels = {
  median_sale_price: 'Median Sale Price ($)',
  median_sale_price_yoy: 'Median Sale Price YoY (%)',
  median_sale_psf: 'Median Sale Price per Sqft ($)',
  median_sale_psf_yoy: 'Median Sale Price per Sqft YoY (%)',
  average_sale_to_list_ratio: 'Average Sale-to-List Ratio (%)',
  average_sale_to_list_ratio_yoy: 'Average Sale-to-List Ratio YoY Change (%)',
  adjusted_average_homes_sold: 'Average Homes Sold',
  adjusted_average_homes_sold_yoy: 'Average Homes Sold YoY (%)',
  median_new_listing_price: 'Median New Listing Price ($)',
  median_new_listing_price_yoy: 'Median New Listing Price YoY (%)',
  adjusted_average_new_listings: 'Avg. New Listings',
  adjusted_average_new_listings_yoy: 'Avg. New Listings YoY (%)',
  off_market_in_two_weeks: 'Listings Off Market Within 2 Weeks',
  off_market_in_two_weeks_yoy: 'Listings Off Market Within 2 Weeks YoY (%)',
  median_days_on_market: 'Median Days on Market',
  median_days_on_market_yoy: 'Median Days on Market YoY (%)',
  average_pending_sales_listing_updates: 'Avg. Pending Sales',
  average_pending_sales_listing_updates_yoy: 'Avg. Pending Sales YoY (%)',
  age_of_inventory: 'Age of Inventory (Days)',
  age_of_inventory_yoy: 'Age of Inventory YoY (%)',
  months_of_supply: 'Months of Supply',
  months_of_supply_yoy: 'Months of Supply YoY (%)',
  percent_active_listings_with_price_drops: '% Listings with Price Drops',
  percent_active_listings_with_price_drops_yoy: '% Listings with Price Drops YoY (%)',
  median_pending_sqft: 'Median Pending Square Feet',
  median_pending_sqft_yoy: 'Median Pending Sqft YoY (%)'
};

// Cache for storing loaded data
const dataCache = {
  state: null,
  county: null
};

function getColorScale(percentage) {
    // Normalize the value between 0 and 1
    // Input range is -100 to 100, so we add 100 and divide by 200
    const normalized = (percentage + 100) / 200;
    
    // Convert to RGB values
    // Red (high): rgb(255, 0, 0)
    // Blue (low): rgb(0, 0, 255)
    const red = Math.round(255 * normalized);
    const blue = Math.round(255 * (1 - normalized));
    
    return `rgb(${red}, 0, ${blue})`;
}

function USMap({ data, selectedColumns }) {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stateLayer, setStateLayer] = useState(null);
  const [countyLayer, setCountyLayer] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create a memoized lookup map for county data
  const countyDataMap = useMemo(() => {
    if (!data) return new Map();
    
    return data.reduce((map, item) => {
      // Extract and normalize the county name from region_name
      const regionParts = item.region_name.split(',');
      if (regionParts.length === 2) {
        const countyName = regionParts[0].trim().replace(/\s+county$/i, '').toLowerCase();
        map.set(countyName, item);
      }
      return map;
    }, new Map());
  }, [data]);

  // Filter data to only include counties and 4-week duration
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    console.log('Data length in Map:', data.length);
    return data;
  }, [data]);

  // Memoized function to fetch data with caching
  const fetchGeoData = useCallback(async (url, type) => {
    if (dataCache[type]) {
      return dataCache[type];
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      dataCache[type] = data;
      return data;
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      setError(`Failed to load ${type} data. Please try again.`);
      throw error;
    }
  }, []);

  // Function to create vector layer with styling
  const createVectorLayer = useCallback((source, options = {}) => {
    return new VectorLayer({
      source,
      style: new Style({
        fill: new Fill({
          color: options.fillColor || 'rgba(100, 100, 100, 0.2)'
        }),
        stroke: new Stroke({
          color: options.strokeColor || '#666',
          width: options.strokeWidth || 0.5
        })
      }),
      zIndex: options.zIndex || 0
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([-98.5795, 39.8283]),
        zoom: 4,
        minZoom: 3,
        maxZoom: 12
      })
    });

    setMap(initialMap);

    // Load vector layers
    const loadVectorLayers = async () => {
      setLoading(true);
      try {
        // Load state boundaries
        const stateUrl = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';
        const stateData = await fetchGeoData(stateUrl, 'state');
        const stateFeatures = new GeoJSON().readFeatures(stateData, {
          featureProjection: 'EPSG:3857'
        });
        const stateSource = new VectorSource({ features: stateFeatures });
        const newStateLayer = createVectorLayer(stateSource, {
          fillColor: 'rgba(255, 255, 255, 0)',
          strokeColor: '#000',
          strokeWidth: 2,
          zIndex: 1
        });

        // Load county boundaries
        const countyUrl = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';
        const countyData = await fetchGeoData(countyUrl, 'county');
        const countyFeatures = new GeoJSON().readFeatures(countyData, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326'
        });
        const countySource = new VectorSource({ features: countyFeatures });
        const newCountyLayer = createVectorLayer(countySource, {
          fillColor: 'rgba(100, 100, 100, 0.1)',
          strokeColor: '#666',
          strokeWidth: 0.5,
          zIndex: 2
        });

        // Add layers to map
        initialMap.addLayer(newStateLayer);
        initialMap.addLayer(newCountyLayer);

        setStateLayer(newStateLayer);
        setCountyLayer(newCountyLayer);
      } catch (error) {
        console.error('Error loading map data:', error);
        setError('Failed to load map data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadVectorLayers();

    return () => {
      initialMap.setTarget(null);
    };
  }, [createVectorLayer, fetchGeoData]);

  // Update hover interaction
  useEffect(() => {
    if (!map || !stateLayer || !countyLayer) return;

    const highlightStyle = new Style({
      fill: new Fill({
        color: 'rgba(70, 130, 180, 0.4)'
      }),
      stroke: new Stroke({
        color: '#333',
        width: 2
      })
    });

    let highlighted = null;
    const handlePointerMove = (e) => {
      const pixel = map.getEventPixel(e.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';

      if (highlighted) {
        highlighted.setStyle(undefined);
        highlighted = null;
      }

      if (!hit) {
        setTooltipContent('');
        setTooltipPosition(null);
        return;
      }

      map.forEachFeatureAtPixel(pixel, (feature) => {
        highlighted = feature;
        feature.setStyle(highlightStyle);
        
        const name = feature.get('NAME');
        const countyName = name ? `${name} County` : 'Unknown Location';
        let content = countyName;

        // Add selected column data if available using the lookup map
        if (selectedColumns.length > 0) {
          // Clean up and normalize the feature name for lookup
          const normalizedName = name?.replace(/\s+county$/i, '').toLowerCase().trim() || '';
          const countyData = countyDataMap.get(normalizedName);

          if (countyData) {
            // Add data for each selected column
            selectedColumns.forEach(column => {
              if (countyData[column] !== undefined) {
                const label = columnLabels[column] || column.replace(/_/g, ' ');
                const value = countyData[column];
                
                // Format the value based on whether it's a price, percentage, or other number
                let formattedValue = value;
                if (column.includes('price') && !column.includes('yoy')) {
                  formattedValue = `$${Number(value).toLocaleString()}`;
                } else if (column.includes('ratio') || column.includes('percent') || column.includes('yoy')) {
                  const numValue = Number(value);
                  if (Math.abs(numValue) > 1) {
                    formattedValue = `${numValue.toFixed(1)}%`;
                  } else {
                    formattedValue = `${(numValue * 100).toFixed(1)}%`;
                  }
                } else {
                  formattedValue = Number(value).toLocaleString();
                }
                content += `\n${label}: ${formattedValue}`;
              }
            });
          }
        }
        
        setTooltipContent(content);
        setTooltipPosition([e.originalEvent.clientX, e.originalEvent.clientY]);
        return true;
      });
    };

    map.on('pointermove', handlePointerMove);

    return () => {
      map.un('pointermove', handlePointerMove);
    };
  }, [map, stateLayer, countyLayer, selectedColumns, countyDataMap]);

  // Function to fetch historical data for a county
  const fetchCountyHistory = async (countyName) => {
    try {
      const { data: historyData, error } = await supabase
        .from('housingdata')
        .select('period_begin, median_sale_price')
        .ilike('region_name', `${countyName}%`)
        .eq('duration', '4 weeks')
        .order('period_begin', { ascending: true });

      if (error) throw error;

      // Log raw data for debugging
      console.log('Raw history data for', countyName, ':', historyData);

      // Filter out invalid or unreasonable prices (e.g., above $10M or below $10K)
      const validHistoryData = historyData.filter(item => {
        const price = Number(item.median_sale_price);
        const isValid = !isNaN(price) && price >= 10000 && price <= 10000000;
        if (!isValid) {
          console.log('Filtered out invalid price:', price, 'for date:', item.period_begin);
        }
        return isValid;
      }).map(item => ({
        ...item,
        median_sale_price: Number(item.median_sale_price) / 1 // Divide by 1000 to correct scale
      }));

      // Group data by month and calculate median
      const monthlyData = validHistoryData.reduce((acc, curr) => {
        const date = new Date(curr.period_begin);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthKey]) {
          acc[monthKey] = [];
        }
        acc[monthKey].push(curr.median_sale_price);
        return acc;
      }, {});

      // Calculate median for each month
      const aggregatedData = Object.entries(monthlyData).map(([monthKey, prices]) => {
        // Sort prices to calculate median
        prices.sort((a, b) => a - b);
        const median = prices.length % 2 === 0
          ? (prices[prices.length/2 - 1] + prices[prices.length/2]) / 2
          : prices[Math.floor(prices.length/2)];

        const [year, month] = monthKey.split('-');
        return {
          period_begin: new Date(year, parseInt(month) - 1, 1).toISOString(),
          median_sale_price: median
        };
      });

      // Sort by date and log final data
      const finalData = aggregatedData.sort((a, b) => 
        new Date(a.period_begin) - new Date(b.period_begin)
      );
      
      console.log('Final processed data for', countyName, ':', finalData);
      return finalData;
    } catch (error) {
      console.error('Error fetching county history:', error);
      return [];
    }
  };

  // Handle county click
  const handleCountyClick = async (feature) => {
    const name = feature.get('NAME');
    if (!name) return;

    const countyName = `${name} County`;
    const historyData = await fetchCountyHistory(name);
    
    setSelectedCounty(countyName);
    setHistoryData(historyData);
    setIsModalOpen(true);
  };

  // Add click handler to map
  useEffect(() => {
    if (!map) return;

    const handleClick = async (e) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, feature => feature);
      if (feature) {
        await handleCountyClick(feature);
      }
    };

    map.on('click', handleClick);
    return () => map.un('click', handleClick);
  }, [map]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" style={{ width: '100%', height: '100%' }} />
      <Tooltip content={tooltipContent} position={tooltipPosition} />
      <PriceHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        countyName={selectedCounty}
        historyData={historyData}
      />
    </div>
  );
}

const YoYPercentage = ({ percentage }) => {
    return (
        <div style={{ color: getColorScale(percentage) }}>
            {percentage.toFixed(2)}%
        </div>
    );
};

export default USMap; 