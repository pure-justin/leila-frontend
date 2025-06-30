// Property Data Service - Integrates with various property data APIs

export interface PropertyParcel {
  parcelId: string;
  address: string;
  owner?: string;
  boundaries: google.maps.LatLngLiteral[];
  area: number; // square feet
  zoning?: string;
  yearBuilt?: number;
  assessedValue?: number;
  lotSize?: number;
  buildingSize?: number;
  propertyType?: string;
  lastSaleDate?: string;
  lastSalePrice?: number;
}

export interface PropertyData {
  parcel?: PropertyParcel;
  roofArea?: number;
  yardArea?: number;
  drivewayArea?: number;
  poolArea?: number;
  estimatedHeight?: number;
  treeCount?: number;
  hasPool?: boolean;
  hasSolarPanels?: boolean;
}

class PropertyDataService {
  // Multiple API options for property data
  private readonly APIs = {
    // Free/Public APIs
    REGRID: {
      name: 'Regrid',
      baseUrl: 'https://app.regrid.com/api/v1',
      requiresKey: true,
      documentation: 'https://regrid.com/api'
    },
    OPEN_ADDRESSES: {
      name: 'OpenAddresses',
      baseUrl: 'https://openaddresses.io/api',
      requiresKey: false,
      documentation: 'https://openaddresses.io'
    },
    LOVELAND: {
      name: 'Loveland/makeloveland',
      baseUrl: 'https://makeloveland.com/api/v1',
      requiresKey: true,
      documentation: 'https://makeloveland.com/api'
    },
    // County-specific APIs (example patterns)
    COUNTY_ASSESSOR: {
      name: 'County Assessor',
      // URLs vary by county, this is a pattern
      urlPattern: 'https://{county}.gov/assessor/api/parcel',
      requiresKey: false
    }
  };

  // Fetch parcel data from multiple sources
  async getParcelData(address: string, lat?: number, lng?: number): Promise<PropertyParcel | null> {
    try {
      // Try multiple APIs in order of preference
      
      // 1. Try Regrid API (most comprehensive)
      const regridData = await this.fetchFromRegrid(address, lat, lng);
      if (regridData) return regridData;
      
      // 2. Try county assessor data
      const countyData = await this.fetchFromCountyAssessor(address, lat, lng);
      if (countyData) return countyData;
      
      // 3. Try OpenAddresses
      const openAddressData = await this.fetchFromOpenAddresses(address);
      if (openAddressData) return openAddressData;
      
      // 4. If all else fails, estimate from satellite imagery
      if (lat && lng) {
        return await this.estimateFromSatellite(address, lat, lng);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching parcel data:', error);
      return null;
    }
  }

  private async fetchFromRegrid(address: string, lat?: number, lng?: number): Promise<PropertyParcel | null> {
    try {
      // Check if we have a Regrid API key
      const apiKey = process.env.NEXT_PUBLIC_REGRID_API_KEY;
      if (!apiKey) return null;
      
      // Use lat/lng if available, otherwise geocode the address
      let url = `${this.APIs.REGRID.baseUrl}/parcels`;
      if (lat && lng) {
        url += `?lat=${lat}&lon=${lng}`;
      } else {
        url += `?address=${encodeURIComponent(address)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (!data.parcels || data.parcels.length === 0) return null;
      
      const parcel = data.parcels[0];
      return this.parseRegridData(parcel);
    } catch (error) {
      console.error('Regrid API error:', error);
      return null;
    }
  }

  private async fetchFromCountyAssessor(address: string, lat?: number, lng?: number): Promise<PropertyParcel | null> {
    // This would need to be customized based on the specific county
    // Many counties provide free APIs but with different formats
    
    // Example implementation for a generic county API
    try {
      // First, determine the county from the address or coordinates
      const county = await this.determineCounty(address, lat, lng);
      if (!county) return null;
      
      // Check if we have a known API for this county
      const countyAPI = this.getCountyAPIEndpoint(county);
      if (!countyAPI) return null;
      
      const response = await fetch(`${countyAPI}/parcel/search?address=${encodeURIComponent(address)}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      return this.parseCountyData(data, county);
    } catch (error) {
      console.error('County API error:', error);
      return null;
    }
  }

  private async fetchFromOpenAddresses(address: string): Promise<PropertyParcel | null> {
    try {
      const response = await fetch(
        `${this.APIs.OPEN_ADDRESSES.baseUrl}/search?text=${encodeURIComponent(address)}`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      if (!data.features || data.features.length === 0) return null;
      
      // OpenAddresses mainly provides address points, not full parcel data
      // But we can use it as a starting point
      const feature = data.features[0];
      return {
        parcelId: feature.properties.hash || 'unknown',
        address: feature.properties.fullAddress || address,
        boundaries: [], // Would need to be fetched from another source
        area: 0, // Would need to be calculated
        propertyType: feature.properties.type
      };
    } catch (error) {
      console.error('OpenAddresses API error:', error);
      return null;
    }
  }

  private async estimateFromSatellite(address: string, lat: number, lng: number): Promise<PropertyParcel | null> {
    // Use AI to estimate property boundaries from satellite imagery
    try {
      const prompt = `
        Given a property at coordinates ${lat}, ${lng} with address "${address}",
        estimate the property boundaries and characteristics.
        
        Return a JSON object with:
        - estimatedLotSize (in square feet)
        - estimatedBuildingSize (in square feet)
        - propertyType (residential, commercial, etc)
        - hasPool (boolean)
        - treeCount (approximate)
        - boundaryPoints (array of lat/lng coordinates forming a polygon)
      `;
      
      // This would integrate with Google Earth Engine or similar
      // For now, return estimated data
      return {
        parcelId: `estimated-${Date.now()}`,
        address,
        boundaries: this.generateEstimatedBoundaries(lat, lng),
        area: 8000, // Average residential lot
        propertyType: 'residential',
        lotSize: 8000,
        buildingSize: 2000
      };
    } catch (error) {
      console.error('Satellite estimation error:', error);
      return null;
    }
  }

  private generateEstimatedBoundaries(lat: number, lng: number): google.maps.LatLngLiteral[] {
    // Generate a rectangular boundary around the center point
    // Average residential lot is about 80x100 feet
    const latOffset = 0.0001; // Roughly 36 feet
    const lngOffset = 0.00012; // Roughly 40 feet
    
    return [
      { lat: lat + latOffset, lng: lng - lngOffset },
      { lat: lat + latOffset, lng: lng + lngOffset },
      { lat: lat - latOffset, lng: lng + lngOffset },
      { lat: lat - latOffset, lng: lng - lngOffset }
    ];
  }

  private parseRegridData(data: any): PropertyParcel {
    return {
      parcelId: data.parcelnumb || data.id,
      address: data.address || '',
      owner: data.owner || '',
      boundaries: this.parseGeometry(data.geometry),
      area: data.ll_gisacre ? data.ll_gisacre * 43560 : 0, // Convert acres to sq ft
      zoning: data.zoning,
      yearBuilt: data.yearbuilt,
      assessedValue: data.assessedvalue,
      lotSize: data.ll_gisacre ? data.ll_gisacre * 43560 : 0,
      buildingSize: data.buildingareasqft,
      propertyType: data.usedesc,
      lastSaleDate: data.saledate,
      lastSalePrice: data.saleprice
    };
  }

  private parseCountyData(data: any, county: string): PropertyParcel {
    // This would need to be customized for each county's data format
    return {
      parcelId: data.parcel_id || data.pin,
      address: data.property_address || data.situs_address,
      owner: data.owner_name,
      boundaries: [], // Would need to parse from county GIS data
      area: data.lot_area || 0,
      zoning: data.zoning_code,
      yearBuilt: data.year_built,
      assessedValue: data.assessed_value,
      lotSize: data.lot_size,
      buildingSize: data.building_area,
      propertyType: data.property_class
    };
  }

  private parseGeometry(geometry: any): google.maps.LatLngLiteral[] {
    if (!geometry || !geometry.coordinates) return [];
    
    // GeoJSON polygon format
    if (geometry.type === 'Polygon' && geometry.coordinates[0]) {
      return geometry.coordinates[0].map((coord: number[]) => ({
        lat: coord[1],
        lng: coord[0]
      }));
    }
    
    return [];
  }

  private async determineCounty(address: string, lat?: number, lng?: number): Promise<string | null> {
    // Use Google Geocoding API to determine county
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await new Promise<string | null>((resolve) => {
        const request = lat && lng 
          ? { location: { lat, lng } }
          : { address };
          
        geocoder.geocode(request, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const county = results[0].address_components.find(
              component => component.types.includes('administrative_area_level_2')
            );
            resolve(county?.long_name || null);
          } else {
            resolve(null);
          }
        });
      });
      
      return result;
    } catch (error) {
      console.error('County determination error:', error);
      return null;
    }
  }

  private getCountyAPIEndpoint(county: string): string | null {
    // Map of known county APIs
    const knownCountyAPIs: Record<string, string> = {
      'Los Angeles County': 'https://assessor.lacounty.gov/api',
      'Cook County': 'https://datacatalog.cookcountyil.gov/api',
      'Harris County': 'https://hcad.org/api',
      'Maricopa County': 'https://mcassessor.maricopa.gov/api',
      'San Diego County': 'https://arcc.sdcounty.ca.gov/api',
      // Add more counties as needed
    };
    
    return knownCountyAPIs[county] || null;
  }

  // Calculate property metrics from parcel and measurement data
  calculatePropertyMetrics(parcel: PropertyParcel, measurements: any): PropertyData {
    const data: PropertyData = {
      parcel,
      roofArea: measurements.roofArea,
      yardArea: measurements.yardArea || (parcel.lotSize ? parcel.lotSize - (parcel.buildingSize || 0) : undefined),
      drivewayArea: measurements.drivewayArea
    };
    
    // Estimate roof area if not measured but building size is known
    if (!data.roofArea && parcel.buildingSize) {
      // Rough estimate: roof area is usually 1.1-1.3x building footprint
      data.roofArea = Math.round(parcel.buildingSize * 1.2);
    }
    
    return data;
  }

  // Get service-specific quotes based on property data
  async generateSmartQuotes(propertyData: PropertyData, services: string[]): Promise<any[]> {
    const quotes = [];
    
    for (const service of services) {
      const quote = await this.calculateServiceQuote(service, propertyData);
      if (quote) quotes.push(quote);
    }
    
    return quotes;
  }

  private async calculateServiceQuote(service: string, data: PropertyData): Promise<any> {
    // Use AI to generate more accurate quotes based on property data
    const prompt = `
      Generate a price quote for ${service} service based on this property data:
      - Lot size: ${data.parcel?.lotSize || 'unknown'} sq ft
      - Building size: ${data.parcel?.buildingSize || 'unknown'} sq ft
      - Roof area: ${data.roofArea || 'unknown'} sq ft
      - Yard area: ${data.yardArea || 'unknown'} sq ft
      - Property type: ${data.parcel?.propertyType || 'residential'}
      - Year built: ${data.parcel?.yearBuilt || 'unknown'}
      
      Provide a realistic price range based on current market rates.
    `;
    
    // For now, use standard calculations
    switch (service.toLowerCase()) {
      case 'roofing':
        if (data.roofArea) {
          const basePrice = data.roofArea * 4.5; // $4.50/sq ft average
          return {
            service: 'Roof Replacement',
            measurement: `${data.roofArea.toLocaleString()} sq ft`,
            priceRange: `$${(basePrice * 0.8).toLocaleString()} - $${(basePrice * 1.3).toLocaleString()}`,
            factors: ['Material type', 'Roof complexity', 'Current condition']
          };
        }
        break;
        
      case 'landscaping':
        if (data.yardArea) {
          const basePrice = data.yardArea * 0.08; // $0.08/sq ft for maintenance
          return {
            service: 'Monthly Lawn Care',
            measurement: `${data.yardArea.toLocaleString()} sq ft`,
            priceRange: `$${(basePrice * 0.8).toFixed(0)} - $${(basePrice * 1.2).toFixed(0)}`,
            factors: ['Grass type', 'Terrain', 'Additional services']
          };
        }
        break;
    }
    
    return null;
  }
}

// Export singleton instance
export const propertyDataService = new PropertyDataService();