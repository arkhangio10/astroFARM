#!/usr/bin/env python3
"""
Generate time series data for AstroFarm
Creates realistic time series for NDVI, soil moisture, temperature, and precipitation
"""

import os
import sys
import json
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import argparse

def generate_ndvi_series(days=30, base_value=0.6, noise_level=0.1):
    """
    Generate realistic NDVI time series
    """
    series = []
    for day in range(days):
        # Seasonal trend (higher in summer)
        seasonal = 0.2 * np.sin(day * 2 * np.pi / 365)
        
        # Growth trend (increases over time)
        growth = 0.1 * (day / days)
        
        # Random noise
        noise = np.random.normal(0, noise_level)
        
        # Cloud cover (random)
        cloud_cover = np.random.random() < 0.2  # 20% chance of clouds
        
        if cloud_cover:
            value = None  # No data due to clouds
            quality = 'cloudy'
        else:
            value = np.clip(base_value + seasonal + growth + noise, 0, 1)
            quality = 'good'
        
        series.append({
            'day': day,
            'value': value,
            'quality': quality,
            'date': (datetime.now() - timedelta(days=days-day)).isoformat()
        })
    
    return series

def generate_soil_moisture_series(days=30, base_value=0.4, noise_level=0.05):
    """
    Generate realistic soil moisture time series
    """
    series = []
    for day in range(days):
        # Precipitation effect
        precipitation = np.random.exponential(2)  # mm/day
        moisture_increase = min(precipitation * 0.1, 0.2)
        
        # Evaporation (higher in summer)
        evaporation = 0.02 + 0.01 * np.sin(day * 2 * np.pi / 365)
        
        # Random noise
        noise = np.random.normal(0, noise_level)
        
        value = np.clip(base_value + moisture_increase - evaporation + noise, 0, 1)
        
        series.append({
            'day': day,
            'value': value,
            'precipitation': precipitation,
            'date': (datetime.now() - timedelta(days=days-day)).isoformat()
        })
    
    return series

def generate_temperature_series(days=30, base_temp=20, noise_level=2):
    """
    Generate realistic temperature time series
    """
    series = []
    for day in range(days):
        # Daily cycle
        daily_cycle = 8 * np.sin(day * 2 * np.pi / 1)  # Daily variation
        
        # Seasonal trend
        seasonal = 10 * np.sin(day * 2 * np.pi / 365)
        
        # Random noise
        noise = np.random.normal(0, noise_level)
        
        temp = base_temp + daily_cycle + seasonal + noise
        
        series.append({
            'day': day,
            'value': temp,
            'min_temp': temp - 5,
            'max_temp': temp + 5,
            'date': (datetime.now() - timedelta(days=days-day)).isoformat()
        })
    
    return series

def generate_precipitation_series(days=30, base_rate=0.1):
    """
    Generate realistic precipitation time series
    """
    series = []
    for day in range(days):
        # Precipitation is intermittent
        if np.random.random() < base_rate:
            # Rain event
            intensity = np.random.exponential(5)  # mm
            duration = np.random.randint(1, 6)  # hours
        else:
            intensity = 0
            duration = 0
        
        series.append({
            'day': day,
            'value': intensity,
            'duration_hours': duration,
            'date': (datetime.now() - timedelta(days=days-day)).isoformat()
        })
    
    return series

def create_parcel_series(parcel_id, crop_type, days=30):
    """
    Create complete time series for a parcel
    """
    # Adjust parameters based on crop type
    crop_params = {
        'carrot': {'ndvi_base': 0.6, 'soil_base': 0.4, 'temp_base': 18},
        'tomato': {'ndvi_base': 0.7, 'soil_base': 0.5, 'temp_base': 22},
        'lettuce': {'ndvi_base': 0.5, 'soil_base': 0.6, 'temp_base': 16},
        'corn': {'ndvi_base': 0.8, 'soil_base': 0.4, 'temp_base': 24}
    }
    
    params = crop_params.get(crop_type, crop_params['carrot'])
    
    return {
        'parcel_id': parcel_id,
        'crop_type': crop_type,
        'ndvi': generate_ndvi_series(days, params['ndvi_base']),
        'soil_moisture': generate_soil_moisture_series(days, params['soil_base']),
        'temperature': generate_temperature_series(days, params['temp_base']),
        'precipitation': generate_precipitation_series(days),
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'days': days,
            'crop_type': crop_type,
            'data_quality': 'simulated'
        }
    }

def main():
    parser = argparse.ArgumentParser(description='Generate time series data for AstroFarm')
    parser.add_argument('--output', required=True, help='Output directory')
    parser.add_argument('--parcels', help='Parcels GeoJSON file')
    parser.add_argument('--days', type=int, default=30, help='Number of days to generate')
    parser.add_argument('--num-parcels', type=int, default=10, help='Number of parcels to generate')
    
    args = parser.parse_args()
    
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Create subdirectories
    (output_dir / 'ndvi').mkdir(exist_ok=True)
    (output_dir / 'soil_moisture').mkdir(exist_ok=True)
    (output_dir / 'temperature').mkdir(exist_ok=True)
    (output_dir / 'precipitation').mkdir(exist_ok=True)
    
    # Load parcels if provided
    if args.parcels:
        with open(args.parcels) as f:
            parcels = json.load(f)
        parcel_features = parcels['features']
    else:
        # Create demo parcels
        parcel_features = []
        for i in range(args.num_parcels):
            feature = {
                'properties': {
                    'id': f'parcel_{i:03d}',
                    'crop_type': np.random.choice(['carrot', 'tomato', 'lettuce', 'corn'])
                }
            }
            parcel_features.append(feature)
    
    # Generate series for each parcel
    for feature in parcel_features:
        parcel_id = feature['properties']['id']
        crop_type = feature['properties']['crop_type']
        
        print(f"Generating series for {parcel_id} ({crop_type})...")
        
        series_data = create_parcel_series(parcel_id, crop_type, args.days)
        
        # Save individual series files
        for data_type in ['ndvi', 'soil_moisture', 'temperature', 'precipitation']:
            series_path = output_dir / data_type / f"{parcel_id}.json"
            with open(series_path, 'w') as f:
                json.dump(series_data[data_type], f, indent=2)
        
        # Save complete parcel data
        parcel_path = output_dir / f"{parcel_id}_complete.json"
        with open(parcel_path, 'w') as f:
            json.dump(series_data, f, indent=2)
    
    print(f"Generated time series for {len(parcel_features)} parcels")
    print(f"Output directory: {output_dir}")

if __name__ == '__main__':
    main()

