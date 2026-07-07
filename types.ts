export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface TariffRecommendation {
  companyName: string;
  tariffName: string;
  estimatedMonthlyCost: number;
  savingsAmount: number;
  savingsPercentage: number;
  pricePerKwh?: number; // Price per kWh
  estimatedPowerCost?: number; // Monthly cost for power term
  estimatedEnergyCost?: number; // Monthly cost for energy consumption
  pros: string[];
  cons: string[];
  url?: string; // New: URL to the tariff page
  contractDuration?: string;
  greenEnergy?: boolean;
}

export interface BillAnalysis {
  clientName?: string;
  cups?: string;
  currentProvider?: string;
  currentTariff?: string;
  contractedPowerP1?: number;
  contractedPowerP2?: number;
  consumptionP1?: number;
  consumptionP2?: number;
  consumptionP3?: number;
  totalConsumption?: number;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  currentTotalCost?: number;
  powerOptimizationSuggestion?: string;
  recommendations: TariffRecommendation[];
  narrativeAnalysis: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}