import React, { useState, useEffect } from 'react';
import './App.css';
import USMap from './components/Map';
import Header from './components/Header';
import SidePanel from './components/SidePanel';
import { supabase } from './supabaseClient';

function App() {
  const [realEstateData, setRealEstateData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from Supabase...');
      
      // Define the columns we actually need
      const requiredColumns = [
        'region_name',
        'region_type',
        'period_begin',
        'median_sale_price',
        'median_sale_price_yoy',
        'median_sale_ppsf',
        'median_sale_ppsf_yoy',
        'average_sale_to_list_ratio',
        'average_sale_to_list_ratio_yoy',
        'adjusted_average_homes_sold',
        'adjusted_average_homes_sold_yoy',
        'median_new_listing_price',
        'median_new_listing_price_yoy',
        'adjusted_average_new_listings',
        'adjusted_average_new_listings_yoy',
        'off_market_in_two_weeks',
        'off_market_in_two_weeks_yoy',
        'median_days_on_market',
        'median_days_on_market_yoy',
        'average_pending_sales_listing_updates',
        'average_pending_sales_listing_updates_yoy',
        'age_of_inventory',
        'age_of_inventory_yoy',
        'months_of_supply',
        'months_of_supply_yoy',
        'percent_active_listings_with_price_drops',
        'percent_active_listings_with_price_drops_yoy',
        'median_pending_sqft',
        'median_pending_sqft_yoy'
      ].join(', ');

      // Fetch all county data directly without period_begin filter
      const { data: countyData, error } = await supabase
        .from('housingdata')
        .select(requiredColumns)
        .eq('duration', '4 weeks')
        .ilike('region_type', '%county%')
        .order('period_begin', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched records:', countyData?.length);
      if (countyData?.length > 0) {
        console.log('Sample record:', countyData[0]);
      }
      
      setRealEstateData(countyData);
      setSelectedColumns([]); // Reset selected columns when new data is loaded
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data from the database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <Header />
      <USMap 
        data={realEstateData} 
        selectedColumns={selectedColumns}
      />
      <SidePanel 
        data={realEstateData}
        selectedColumns={selectedColumns}
        onColumnSelect={setSelectedColumns}
        loading={loading}
        error={error}
      />
    </div>
  );
}

export default App; 