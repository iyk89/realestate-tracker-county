import React, { useMemo } from 'react';
import './SidePanel.css';

// Data categories with emojis
const categories = {
  'Sales Metrics 📊': [
    'median_sale_price',
    'median_sale_price_yoy',
    'median_sale_psf',
    'median_sale_psf_yoy',
    'average_sale_to_list_ratio',
    'average_sale_to_list_ratio_yoy',
    'adjusted_average_homes_sold',
    'adjusted_average_homes_sold_yoy'
  ],
  'Listing Metrics 🆕': [
    'median_new_listing_price',
    'median_new_listing_price_yoy',
    'adjusted_average_new_listings',
    'adjusted_average_new_listings_yoy',
    'off_market_in_two_weeks',
    'off_market_in_two_weeks_yoy'
  ],
  'Market Activity 🕑': [
    'median_days_on_market',
    'median_days_on_market_yoy',
    'average_pending_sales_listing_updates',
    'average_pending_sales_listing_updates_yoy',
    'age_of_inventory',
    'age_of_inventory_yoy',
    'months_of_supply',
    'months_of_supply_yoy'
  ],
  'Price Adjustments 🔻': [
    'percent_active_listings_with_price_drops',
    'percent_active_listings_with_price_drops_yoy',
    'average_sale_to_list_ratio',
    'average_sale_to_list_ratio_yoy'
  ],
  'Property Details 📐': [
    'median_pending_sqft',
    'median_pending_sqft_yoy'
  ]
};

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

const SidePanel = ({ data, selectedColumns, onColumnSelect }) => {
  // Filter data to only include counties and 4-week duration
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter(item => 
      item.region_type?.toLowerCase() === 'county' && 
      item.duration?.toLowerCase() === '4 weeks'
    );
  }, [data]);

  // Get all available columns from the data
  const availableColumns = useMemo(() => {
    if (!filteredData.length) return new Set();
    return new Set(Object.keys(filteredData[0]));
  }, [filteredData]);

  return (
    <div className="side-panel">
      <h3>Select Data to Display</h3>
      {filteredData.length > 0 ? (
        <>
          <div className="data-info">
            <p>Showing data for counties with 4-week duration</p>
            <p>Counties available: {filteredData.length}</p>
          </div>
          <div className="categories">
            {Object.entries(categories).map(([categoryName, categoryColumns]) => {
              // Filter out columns that don't exist in the data
              const existingColumns = categoryColumns.filter(col => availableColumns.has(col));
              if (existingColumns.length === 0) return null;

              return (
                <div key={categoryName} className="category">
                  <h4 className="category-title">{categoryName}</h4>
                  <div className="column-selectors">
                    {existingColumns.map((column) => (
                      <label key={column} className="column-selector">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(column)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onColumnSelect([...selectedColumns, column]);
                            } else {
                              onColumnSelect(selectedColumns.filter(col => col !== column));
                            }
                          }}
                        />
                        <span className="column-name">{columnLabels[column] || column.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>Upload a file with county-level data to see available data points</p>
          <p>Make sure your data includes 'region_type', 'region_name', and 'duration' fields</p>
        </div>
      )}
    </div>
  );
};

export default SidePanel; 