-- Create a function to get distinct counties with their most recent data
CREATE OR REPLACE FUNCTION get_distinct_counties(duration_param text)
RETURNS TABLE (
    region_name text,
    max_period_begin timestamp
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    WITH RankedData AS (
        SELECT 
            region_name,
            period_begin,
            ROW_NUMBER() OVER (PARTITION BY region_name ORDER BY period_begin DESC) as rn
        FROM housingdata
        WHERE 
            duration = duration_param
            AND region_type ILIKE '%county%'
    )
    SELECT 
        region_name,
        period_begin as max_period_begin
    FROM RankedData
    WHERE rn = 1
    ORDER BY region_name;
$$; 