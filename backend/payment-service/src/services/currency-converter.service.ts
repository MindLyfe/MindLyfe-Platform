import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface ExchangeRates {
  [currency: string]: number;
}

interface CurrencyConversionResult {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  exchangeRate: number;
  timestamp: Date;
}

@Injectable()
export class CurrencyConverterService {
  private readonly logger = new Logger(CurrencyConverterService.name);
  private exchangeRatesCache: { [baseCurrency: string]: { rates: ExchangeRates; timestamp: Date } } = {};
  private readonly cacheExpiryMinutes = 15; // Cache rates for 15 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversionResult> {
    if (fromCurrency === toCurrency) {
      return {
        fromCurrency,
        toCurrency,
        amount,
        convertedAmount: amount,
        exchangeRate: 1,
        timestamp: new Date(),
      };
    }

    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = Math.round(amount * exchangeRate * 100) / 100; // Round to 2 decimal places

    return {
      fromCurrency,
      toCurrency,
      amount,
      convertedAmount,
      exchangeRate,
      timestamp: new Date(),
    };
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    try {
      // Try to get rate from cache first
      const cachedRates = this.getCachedRates(fromCurrency);
      if (cachedRates && cachedRates[toCurrency]) {
        this.logger.log(`Using cached exchange rate: ${fromCurrency} -> ${toCurrency} = ${cachedRates[toCurrency]}`);
        return cachedRates[toCurrency];
      }

      // Fetch fresh rates from API
      const rates = await this.fetchExchangeRates(fromCurrency);
      if (rates[toCurrency]) {
        return rates[toCurrency];
      }

      // If direct rate not available, try reverse conversion
      const reverseRates = await this.fetchExchangeRates(toCurrency);
      if (reverseRates[fromCurrency]) {
        return 1 / reverseRates[fromCurrency];
      }

      throw new Error(`Exchange rate not available for ${fromCurrency} -> ${toCurrency}`);
    } catch (error) {
      this.logger.error(`Failed to get exchange rate: ${error.message}`);
      // Return fallback rates for common African currencies
      return this.getFallbackRate(fromCurrency, toCurrency);
    }
  }

  /**
   * Get multiple exchange rates for a base currency
   */
  async getExchangeRates(baseCurrency: string, targetCurrencies: string[]): Promise<ExchangeRates> {
    try {
      const rates = await this.fetchExchangeRates(baseCurrency);
      const filteredRates: ExchangeRates = {};

      for (const currency of targetCurrencies) {
        if (currency === baseCurrency) {
          filteredRates[currency] = 1;
        } else if (rates[currency]) {
          filteredRates[currency] = rates[currency];
        }
      }

      return filteredRates;
    } catch (error) {
      this.logger.error(`Failed to get exchange rates: ${error.message}`);
      return this.getFallbackRates(baseCurrency, targetCurrencies);
    }
  }

  /**
   * Fetch exchange rates from external API
   */
  private async fetchExchangeRates(baseCurrency: string): Promise<ExchangeRates> {
    try {
      // Try multiple API providers for reliability
      const providers = [
        () => this.fetchFromExchangeRateAPI(baseCurrency),
        () => this.fetchFromFixer(baseCurrency),
        () => this.fetchFromCurrencyAPI(baseCurrency),
      ];

      for (const provider of providers) {
        try {
          const rates = await provider();
          if (rates && Object.keys(rates).length > 0) {
            // Cache the rates
            this.cacheRates(baseCurrency, rates);
            return rates;
          }
        } catch (error) {
          this.logger.warn(`Provider failed: ${error.message}`);
          continue;
        }
      }

      throw new Error('All currency API providers failed');
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetch rates from ExchangeRate-API (free tier available)
   */
  private async fetchFromExchangeRateAPI(baseCurrency: string): Promise<ExchangeRates> {
    const apiKey = this.configService.get<string>('currency.exchangeRateApiKey');
    const url = apiKey 
      ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
      : `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;

    const response = await firstValueFrom(
      this.httpService.get(url, { timeout: 5000 })
    );

    if (response.data && response.data.conversion_rates) {
      return response.data.conversion_rates;
    } else if (response.data && response.data.rates) {
      return response.data.rates;
    }

    throw new Error('Invalid response from ExchangeRate-API');
  }

  /**
   * Fetch rates from Fixer.io
   */
  private async fetchFromFixer(baseCurrency: string): Promise<ExchangeRates> {
    const apiKey = this.configService.get<string>('currency.fixerApiKey');
    if (!apiKey) {
      throw new Error('Fixer API key not configured');
    }

    const response = await firstValueFrom(
      this.httpService.get(`https://api.fixer.io/latest?access_key=${apiKey}&base=${baseCurrency}`, {
        timeout: 5000
      })
    );

    if (response.data && response.data.success && response.data.rates) {
      return response.data.rates;
    }

    throw new Error('Invalid response from Fixer.io');
  }

  /**
   * Fetch rates from CurrencyAPI
   */
  private async fetchFromCurrencyAPI(baseCurrency: string): Promise<ExchangeRates> {
    const apiKey = this.configService.get<string>('currency.currencyApiKey');
    if (!apiKey) {
      throw new Error('CurrencyAPI key not configured');
    }

    const response = await firstValueFrom(
      this.httpService.get(`https://api.currencyapi.com/v3/latest?apikey=${apiKey}&base_currency=${baseCurrency}`, {
        timeout: 5000
      })
    );

    if (response.data && response.data.data) {
      const rates: ExchangeRates = {};
      Object.keys(response.data.data).forEach(currency => {
        rates[currency] = response.data.data[currency].value;
      });
      return rates;
    }

    throw new Error('Invalid response from CurrencyAPI');
  }

  /**
   * Cache exchange rates
   */
  private cacheRates(baseCurrency: string, rates: ExchangeRates): void {
    this.exchangeRatesCache[baseCurrency] = {
      rates,
      timestamp: new Date(),
    };

    this.logger.log(`Cached exchange rates for ${baseCurrency}`);
  }

  /**
   * Get cached rates if still valid
   */
  private getCachedRates(baseCurrency: string): ExchangeRates | null {
    const cached = this.exchangeRatesCache[baseCurrency];
    if (!cached) {
      return null;
    }

    const now = new Date();
    const cacheAge = (now.getTime() - cached.timestamp.getTime()) / (1000 * 60); // Age in minutes

    if (cacheAge > this.cacheExpiryMinutes) {
      delete this.exchangeRatesCache[baseCurrency];
      return null;
    }

    return cached.rates;
  }

  /**
   * Get fallback exchange rates for common African currencies
   */
  private getFallbackRate(fromCurrency: string, toCurrency: string): number {
    // Approximate rates as of 2024 (should be updated regularly)
    const fallbackRates: { [key: string]: ExchangeRates } = {
      USD: {
        UGX: 3700,
        KES: 129,
        TZS: 2500,
        RWF: 1300,
        GHS: 12,
        ZMW: 27,
        XOF: 600,
        NAD: 18,
        BWP: 13.5,
        ZAR: 18,
        MWK: 1700,
        NGN: 1500,
        AED: 3.67,
        ETB: 120,
        MZN: 64,
        AOA: 830,
        XAF: 600,
        CDF: 2800,
        EUR: 0.85,
        GBP: 0.73,
      },
      UGX: {
        USD: 0.00027,
        KES: 0.035,
        TZS: 0.68,
        RWF: 0.35,
        EUR: 0.00023,
        GBP: 0.0002,
      },
    };

    if (fallbackRates[fromCurrency] && fallbackRates[fromCurrency][toCurrency]) {
      this.logger.warn(`Using fallback rate: ${fromCurrency} -> ${toCurrency} = ${fallbackRates[fromCurrency][toCurrency]}`);
      return fallbackRates[fromCurrency][toCurrency];
    }

    // If no fallback rate available, return 1 (no conversion)
    this.logger.warn(`No fallback rate available for ${fromCurrency} -> ${toCurrency}, returning 1`);
    return 1;
  }

  /**
   * Get fallback rates for multiple currencies
   */
  private getFallbackRates(baseCurrency: string, targetCurrencies: string[]): ExchangeRates {
    const rates: ExchangeRates = {};
    for (const currency of targetCurrencies) {
      rates[currency] = this.getFallbackRate(baseCurrency, currency);
    }
    return rates;
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', // International
      'UGX', 'KES', 'TZS', 'RWF', 'GHS', 'ZMW', 'XOF', 'NAD', 'BWP', 'ZAR', 
      'MWK', 'NGN', 'AED', 'ETB', 'MZN', 'AOA', 'XAF', 'CDF' // African
    ];
  }

  /**
   * Format currency amount with proper symbols and decimals
   */
  formatCurrency(amount: number, currency: string): string {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      UGX: 'UGX ',
      KES: 'KSh ',
      TZS: 'TSh ',
      RWF: 'RWF ',
      GHS: 'GH₵ ',
      ZMW: 'ZK ',
      XOF: 'CFA ',
      NAD: 'N$ ',
      BWP: 'P ',
      ZAR: 'R ',
      MWK: 'MK ',
      NGN: '₦ ',
      AED: 'AED ',
      ETB: 'Br ',
      MZN: 'MT ',
      AOA: 'Kz ',
      XAF: 'FCFA ',
      CDF: 'FC ',
    };

    const symbol = currencySymbols[currency] || `${currency} `;
    
    // Some currencies don't use decimal places
    const noDecimalCurrencies = ['UGX', 'RWF', 'TZS', 'MWK', 'CDF', 'XOF', 'XAF'];
    const decimals = noDecimalCurrencies.includes(currency) ? 0 : 2;
    
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })}`;
  }
} 