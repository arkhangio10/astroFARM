#!/usr/bin/env python3
"""
Prepare NASA data tiles for AstroFarm
Converts GeoTIFF files to web-optimized tiles for Leaflet
"""

import os
import sys
import argparse
from pathlib import Path
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from rasterio.windows import from_bounds
import numpy as np
from PIL import Image
import json

# Central Valley AOI bounds (WGS84)
AOI_BOUNDS = {
    'west': -120.9,
    'south': 35.0,
    'east': -118.4,
    'north': 37.0
}

def create_tiles_from_geotiff(input_path, output_dir, zoom_levels=(8, 12)):
    """
    Convert GeoTIFF to web tiles
    """
    print(f"Processing {input_path}...")
    
    with rasterio.open(input_path) as src:
        # Crop to AOI
        window = from_bounds(
            AOI_BOUNDS['west'],
            AOI_BOUNDS['south'],
            AOI_BOUNDS['east'],
            AOI_BOUNDS['north'],
            src.transform
        )
        
        # Read data
        data = src.read(1, window=window)
        transform = src.window_transform(window)
        
        # Normalize data for visualization
        if data.dtype == np.float32 or data.dtype == np.float64:
            # Handle NDVI (-1 to 1) or other normalized data
            if np.nanmin(data) >= -1 and np.nanmax(data) <= 1:
                # NDVI-like data
                data = np.clip((data + 1) * 127.5, 0, 255).astype(np.uint8)
            else:
                # Other float data
                data = np.clip((data - np.nanmin(data)) / (np.nanmax(data) - np.nanmin(data)) * 255, 0, 255).astype(np.uint8)
        
        # Create output directory
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate tiles for each zoom level
        for z in zoom_levels:
            tile_size = 256
            tiles_per_side = 2 ** z
            
            for x in range(tiles_per_side):
                for y in range(tiles_per_side):
                    # Calculate tile bounds
                    tile_west = -180 + (x * 360 / tiles_per_side)
                    tile_east = -180 + ((x + 1) * 360 / tiles_per_side)
                    tile_north = 85.0511 - (y * 170.1022 / tiles_per_side)
                    tile_south = 85.0511 - ((y + 1) * 170.1022 / tiles_per_side)
                    
                    # Check if tile intersects with AOI
                    if (tile_west < AOI_BOUNDS['east'] and 
                        tile_east > AOI_BOUNDS['west'] and 
                        tile_north > AOI_BOUNDS['south'] and 
                        tile_south < AOI_BOUNDS['north']):
                        
                        # Create tile directory
                        tile_dir = output_dir / str(z) / str(x)
                        tile_dir.mkdir(parents=True, exist_ok=True)
                        
                        # Create tile image (simplified - in production, use proper tile generation)
                        tile_data = np.full((tile_size, tile_size), 128, dtype=np.uint8)
                        
                        # Save tile
                        tile_path = tile_dir / f"{y}.png"
                        Image.fromarray(tile_data, mode='L').save(tile_path)
        
        print(f"Generated tiles for zoom levels {zoom_levels}")

def create_series_data(input_path, parcels_path, output_dir):
    """
    Extract time series data for each parcel
    """
    print(f"Creating series data from {input_path}...")
    
    # Load parcels
    with open(parcels_path) as f:
        parcels = json.load(f)
    
    # Create output directory
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # For each parcel, extract time series
    for i, feature in enumerate(parcels['features']):
        parcel_id = f"parcel_{i:03d}"
        
        # Simulate time series data
        series_data = {
            'parcel_id': parcel_id,
            'geometry': feature['geometry'],
            'properties': feature['properties'],
            'time_series': []
        }
        
        # Generate 30 days of data
        for day in range(30):
            # Simulate realistic values
            base_value = 0.5 + np.random.normal(0, 0.1)
            seasonal_trend = 0.1 * np.sin(day * 2 * np.pi / 30)
            noise = np.random.normal(0, 0.05)
            
            value = np.clip(base_value + seasonal_trend + noise, 0, 1)
            
            series_data['time_series'].append({
                'day': day,
                'value': float(value),
                'quality': 'good' if np.random.random() > 0.2 else 'cloudy'
            })
        
        # Save series data
        series_path = output_dir / f"{parcel_id}.json"
        with open(series_path, 'w') as f:
            json.dump(series_data, f, indent=2)
    
    print(f"Created series data for {len(parcels['features'])} parcels")

def create_demo_parcels(output_path):
    """
    Create demo parcel data for Central Valley
    """
    print(f"Creating demo parcels at {output_path}...")
    
    # Create sample parcels in Central Valley
    parcels = {
        'type': 'FeatureCollection',
        'features': []
    }
    
    # Generate 10 sample parcels
    for i in range(10):
        # Random locations within Central Valley
        lon = np.random.uniform(AOI_BOUNDS['west'], AOI_BOUNDS['east'])
        lat = np.random.uniform(AOI_BOUNDS['south'], AOI_BOUNDS['north'])
        
        # Create square parcel
        size = 0.01  # ~1km
        coords = [[
            [lon - size/2, lat - size/2],
            [lon + size/2, lat - size/2],
            [lon + size/2, lat + size/2],
            [lon - size/2, lat + size/2],
            [lon - size/2, lat - size/2]
        ]]
        
        feature = {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': coords
            },
            'properties': {
                'id': f'parcel_{i:03d}',
                'crop_type': np.random.choice(['carrot', 'tomato', 'lettuce', 'corn']),
                'area_ha': np.random.uniform(10, 100),
                'soil_type': np.random.choice(['clay', 'sandy', 'loam']),
                'irrigation': np.random.choice(['drip', 'sprinkler', 'flood'])
            }
        }
        
        parcels['features'].append(feature)
    
    # Save parcels
    with open(output_path, 'w') as f:
        json.dump(parcels, f, indent=2)
    
    print(f"Created {len(parcels['features'])} demo parcels")

def main():
    parser = argparse.ArgumentParser(description='Prepare NASA data for AstroFarm')
    parser.add_argument('--input', help='Input GeoTIFF file')
    parser.add_argument('--output', help='Output directory')
    parser.add_argument('--parcels', help='Parcels GeoJSON file')
    parser.add_argument('--create-parcels', help='Create demo parcels file')
    parser.add_argument('--zoom-levels', nargs='+', type=int, default=[8, 12], help='Zoom levels to generate')
    
    args = parser.parse_args()
    
    if args.create_parcels:
        create_demo_parcels(args.create_parcels)
    
    if args.input and args.output:
        if args.parcels:
            create_series_data(args.input, args.parcels, args.output)
        else:
            create_tiles_from_geotiff(args.input, args.output, args.zoom_levels)

if __name__ == '__main__':
    main()

