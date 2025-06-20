// Google Solar API Integration Service
// Provides solar potential analysis and panel layout recommendations

export interface SolarPotential {
  // Building insights
  maxArrayPanelsCount: number;
  maxArrayAreaMeters2: number;
  maxSunshineHoursPerYear: number;
  carbonOffsetFactorKgPerMwh: number;
  
  // Roof segments
  roofSegments: RoofSegment[];
  
  // Solar potential
  solarPanelConfigs: SolarPanelConfig[];
  
  // Financial analysis
  financialAnalysis: FinancialAnalysis;
  
  // Data quality
  imageryDate: Date;
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RoofSegment {
  segmentIndex: number;
  azimuthDegrees: number; // Direction the roof faces
  pitchDegrees: number; // Roof angle
  stats: {
    areaMeters2: number;
    sunshineQuantiles: number[]; // Annual sunshine data
  };
  center: {
    latitude: number;
    longitude: number;
  };
  boundingBox: {
    sw: { latitude: number; longitude: number };
    ne: { latitude: number; longitude: number };
  };
  planeHeightAtCenterMeters: number;
}

export interface SolarPanelConfig {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  roofSegmentSummaries: {
    segmentIndex: number;
    panelsCount: number;
    yearlyEnergyDcKwh: number;
  }[];
}

export interface FinancialAnalysis {
  monthlyBill: MonthlyBill[];
  panelConfigIndex: number;
  financialDetails: {
    initialAcKwhPerYear: number;
    remainingLifetimeUtilityBill: number;
    federalIncentive: number;
    stateIncentive: number;
    utilityIncentive: number;
    lifetimeSrecTotal: number;
    costOfElectricityWithoutSolar: number;
    netMeteringAllowed: boolean;
    solarPercentage: number;
    percentageExportedToGrid: number;
  };
  savingsYear1: number;
  savingsYear20: number;
  presentValueOfSavingsYear20: number;
  paybackYears: number;
  rebateValue: number;
}

export interface MonthlyBill {
  month: number;
  energyBill: number;
}

export interface SolarInstallationQuote {
  address: string;
  roofArea: number;
  recommendedPanels: number;
  systemSizeKw: number;
  annualProduction: number;
  estimatedCost: {
    low: number;
    high: number;
    average: number;
  };
  savings: {
    annual: number;
    lifetime: number;
  };
  paybackPeriod: number;
  environmentalImpact: {
    co2OffsetTons: number;
    treesEquivalent: number;
  };
}

class SolarService {
  private readonly API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  private readonly SOLAR_API_BASE = 'https://solar.googleapis.com/v1';

  async analyzeSolarPotential(
    address: string, 
    lat?: number, 
    lng?: number
  ): Promise<SolarPotential | null> {
    try {
      // First, get the location if not provided
      let location: { lat: number; lng: number };
      if (!lat || !lng) {
        const geocodedLocation = await this.geocodeAddress(address);
        if (!geocodedLocation.lat || !geocodedLocation.lng) return null;
        location = { lat: geocodedLocation.lat, lng: geocodedLocation.lng };
      } else {
        location = { lat, lng };
      }

      // 1. Get building insights
      const buildingInsights = await this.getBuildingInsights(location.lat!, location.lng!);
      if (!buildingInsights) return null;

      // 2. Get data layers (imagery for solar analysis)
      const dataLayers = await this.getDataLayers(location.lat!, location.lng!);

      // 3. Analyze financial benefits
      const financialAnalysis = await this.getFinancialAnalysis(
        location.lat!, 
        location.lng!,
        buildingInsights
      );

      return {
        ...buildingInsights,
        financialAnalysis
      };
    } catch (error) {
      console.error('Solar analysis error:', error);
      return null;
    }
  }

  private async geocodeAddress(address: string): Promise<{ lat?: number; lng?: number }> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      return {};
    } catch (error) {
      console.error('Geocoding error:', error);
      return {};
    }
  }

  private async getBuildingInsights(lat: number, lng: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.SOLAR_API_BASE}/buildingInsights:findClosest?` +
        `location.latitude=${lat}&location.longitude=${lng}&key=${this.API_KEY}`
      );
      
      if (!response.ok) {
        console.error('Building insights error:', await response.text());
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Building insights error:', error);
      return null;
    }
  }

  private async getDataLayers(lat: number, lng: number): Promise<any> {
    try {
      // Get various data layers for comprehensive analysis
      const layers = [
        'DSM_LAYER', // Digital Surface Model
        'IMAGERY_LAYER', // Aerial imagery
        'ANNUAL_FLUX_LAYER', // Solar radiation data
        'MONTHLY_FLUX_LAYER' // Monthly solar data
      ];

      const response = await fetch(
        `${this.SOLAR_API_BASE}/dataLayers:get?` +
        `location.latitude=${lat}&location.longitude=${lng}&` +
        `radiusMeters=50&` +
        `requiredQuality=HIGH&` +
        layers.map(l => `dataLayers=${l}`).join('&') +
        `&key=${this.API_KEY}`
      );

      if (!response.ok) {
        console.error('Data layers error:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Data layers error:', error);
      return null;
    }
  }

  private async getFinancialAnalysis(
    lat: number, 
    lng: number, 
    buildingInsights: any
  ): Promise<FinancialAnalysis> {
    // Calculate financial analysis based on building insights
    const panelCount = buildingInsights.solarPotential?.maxArrayPanelsCount || 20;
    const yearlyProductionKwh = panelCount * 350 * 0.8; // 350W panels, 80% efficiency
    const electricityRate = 0.13; // Average US rate per kWh
    
    return {
      monthlyBill: this.calculateMonthlyBills(yearlyProductionKwh),
      panelConfigIndex: 0,
      financialDetails: {
        initialAcKwhPerYear: yearlyProductionKwh,
        remainingLifetimeUtilityBill: 5000,
        federalIncentive: panelCount * 350 * 6 * 0.3, // 30% federal tax credit
        stateIncentive: panelCount * 350 * 6 * 0.1, // Varies by state
        utilityIncentive: 500,
        lifetimeSrecTotal: 2000,
        costOfElectricityWithoutSolar: yearlyProductionKwh * electricityRate * 20,
        netMeteringAllowed: true,
        solarPercentage: 85,
        percentageExportedToGrid: 20
      },
      savingsYear1: yearlyProductionKwh * electricityRate,
      savingsYear20: yearlyProductionKwh * electricityRate * 20 * 1.3, // With inflation
      presentValueOfSavingsYear20: yearlyProductionKwh * electricityRate * 20 * 0.8,
      paybackYears: 7.5,
      rebateValue: 2000
    };
  }

  private calculateMonthlyBills(yearlyProductionKwh: number): MonthlyBill[] {
    // Solar production varies by month
    const monthlyFactors = [
      0.06, 0.07, 0.08, 0.09, 0.11, 0.12,
      0.12, 0.11, 0.09, 0.08, 0.07, 0.06
    ];
    
    return monthlyFactors.map((factor, index) => ({
      month: index + 1,
      energyBill: Math.max(0, 150 - (yearlyProductionKwh * factor * 0.13))
    }));
  }

  async generateSolarQuote(
    address: string,
    solarData: SolarPotential | null,
    roofArea?: number
  ): Promise<SolarInstallationQuote> {
    // Base calculations
    const avgPanelSize = 17.5; // sq ft per panel
    const panelWattage = 350; // watts per panel
    const installCostPerWatt = 3.00; // Average US install cost
    
    let recommendedPanels = 20; // Default
    let usableRoofArea = roofArea || 1000; // Default estimate
    
    if (solarData) {
      recommendedPanels = solarData.maxArrayPanelsCount;
      usableRoofArea = solarData.maxArrayAreaMeters2 * 10.764; // Convert to sq ft
    } else if (roofArea) {
      // Estimate based on roof area (typically 75% is usable)
      usableRoofArea = roofArea * 0.75;
      recommendedPanels = Math.floor(usableRoofArea / avgPanelSize);
    }
    
    const systemSizeKw = (recommendedPanels * panelWattage) / 1000;
    const annualProduction = systemSizeKw * 1400; // Average sun hours * efficiency
    const systemCost = systemSizeKw * 1000 * installCostPerWatt;
    
    // Calculate savings
    const electricityRate = 0.13; // per kWh
    const annualSavings = annualProduction * electricityRate;
    const federalTaxCredit = systemCost * 0.3; // 30% federal tax credit
    const netCost = systemCost - federalTaxCredit;
    const paybackYears = netCost / annualSavings;
    
    return {
      address,
      roofArea: usableRoofArea,
      recommendedPanels,
      systemSizeKw,
      annualProduction,
      estimatedCost: {
        low: systemCost * 0.85,
        high: systemCost * 1.15,
        average: systemCost
      },
      savings: {
        annual: annualSavings,
        lifetime: annualSavings * 25 // 25-year warranty typical
      },
      paybackPeriod: paybackYears,
      environmentalImpact: {
        co2OffsetTons: (annualProduction * 0.0007 * 25), // Lifetime CO2 offset
        treesEquivalent: Math.round(annualProduction * 0.0007 * 25 * 20) // Trees planted equivalent
      }
    };
  }

  // Get local solar installers
  async getLocalInstallers(lat: number, lng: number): Promise<any[]> {
    // This would integrate with your contractor database
    // Filter for contractors with 'solar' service
    return [
      {
        name: 'SunPower Solar Solutions',
        rating: 4.8,
        reviews: 245,
        certifications: ['NABCEP', 'Tesla Powerwall Certified'],
        yearsInBusiness: 12,
        projectsCompleted: 500
      },
      {
        name: 'Green Energy Pros',
        rating: 4.9,
        reviews: 189,
        certifications: ['NABCEP', 'LG Pro Dealer'],
        yearsInBusiness: 8,
        projectsCompleted: 350
      }
    ];
  }

  // Calculate ROI for solar investment
  calculateSolarROI(quote: SolarInstallationQuote): {
    roi: number;
    breakEvenYear: number;
    totalReturn: number;
    irr: number;
  } {
    const initialInvestment = quote.estimatedCost.average * 0.7; // After tax credit
    const annualReturn = quote.savings.annual;
    const systemLife = 25; // years
    
    // Simple ROI calculation
    const totalReturn = (annualReturn * systemLife) - initialInvestment;
    const roi = (totalReturn / initialInvestment) * 100;
    
    // Break-even calculation
    const breakEvenYear = Math.ceil(initialInvestment / annualReturn);
    
    // Internal Rate of Return (simplified)
    const irr = ((Math.pow(totalReturn / initialInvestment + 1, 1 / systemLife)) - 1) * 100;
    
    return {
      roi: Math.round(roi),
      breakEvenYear,
      totalReturn: Math.round(totalReturn),
      irr: Math.round(irr * 10) / 10
    };
  }

  // Generate comprehensive solar report
  async generateSolarReport(
    address: string,
    propertyData: any
  ): Promise<string> {
    const solarPotential = await this.analyzeSolarPotential(address);
    const quote = await this.generateSolarQuote(address, solarPotential, propertyData.roofArea);
    const roi = this.calculateSolarROI(quote);
    
    return `
# Solar Installation Report
## Property: ${address}

### Solar Potential Analysis
- Recommended System Size: ${quote.systemSizeKw} kW
- Number of Panels: ${quote.recommendedPanels}
- Annual Production: ${quote.annualProduction.toLocaleString()} kWh
- Usable Roof Area: ${quote.roofArea.toLocaleString()} sq ft

### Financial Analysis
- System Cost: $${quote.estimatedCost.average.toLocaleString()}
- Federal Tax Credit (30%): $${(quote.estimatedCost.average * 0.3).toLocaleString()}
- Net Cost: $${(quote.estimatedCost.average * 0.7).toLocaleString()}
- Annual Savings: $${quote.savings.annual.toLocaleString()}
- 25-Year Savings: $${quote.savings.lifetime.toLocaleString()}
- Payback Period: ${quote.paybackPeriod.toFixed(1)} years
- Return on Investment: ${roi.roi}%

### Environmental Impact
- CO2 Offset: ${quote.environmentalImpact.co2OffsetTons.toFixed(1)} tons
- Equivalent to Planting: ${quote.environmentalImpact.treesEquivalent.toLocaleString()} trees

### Next Steps
1. Schedule a detailed site assessment
2. Review financing options
3. Apply for permits and incentives
4. Installation timeline: 4-6 weeks
    `;
  }
}

// Export singleton instance
export const solarService = new SolarService();