import React, { useState, useEffect } from 'react';
import {
  TrendingUp, AlertTriangle, ShieldCheck, Zap, ArrowRightLeft,
  Calendar, Activity, Sparkles, RefreshCw, Layers
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function PredictiveForecasterView({ hospitals = [], onOpenInterHospital }) {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const data = await resilientFetch('/api/clinical/shortage-forecast');
      setForecastData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1a73e8]" />
            <h2 className="text-xl font-bold text-[#202124] tracking-tight">
              Google Cloud • AI Regional Shortage Forecaster & Burn-Rate Analytics
            </h2>
            <span className="text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2.5 py-0.5 rounded-full">
              7-DAY PREDICTIVE HORIZON
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-1">
            Machine learning forecast of trauma intake volume, burn rates, and automated pre-emptive inter-hospital balancing
          </p>
        </div>

        <button
          onClick={fetchForecast}
          className="flex items-center gap-1.5 bg-white hover:bg-[#f8fafd] text-[#1a73e8] border border-[#dadce0] px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh AI Predictions</span>
        </button>
      </div>

      {/* Regional Forecast Cards */}
      {forecastData && (
        <div className="space-y-6">
          {/* Regional Alert Banner */}
          <div className="bg-white p-5 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#202124]">
                  Regional Status: <strong className="text-[#137333]">{forecastData.regionalStatus}</strong>
                </span>
                <p className="text-[11px] text-[#5f6368]">
                  Automated balancing engine monitoring 5 regional trauma hubs across San Francisco grid
                </p>
              </div>
            </div>

            <button
              onClick={onOpenInterHospital}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Auto-Balance Fleet</span>
            </button>
          </div>

          {/* 5 Hospital Forecast Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forecastData.hospitalForecasts.map((hosp) => {
              const isHighRisk = hosp.riskLevel === 'CRITICAL_STOCKOUT_RISK';
              const isWatch = hosp.riskLevel === 'MODERATE_WATCH';

              return (
                <div
                  key={hosp.hospitalId}
                  className="bg-white border border-[#dadce0] p-5 rounded-3xl shadow-[0_1px_3px_rgba(60,64,67,0.08)] hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-bold text-[#202124] text-xs">{hosp.hospitalName}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${
                          isHighRisk
                            ? 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]'
                            : isWatch
                            ? 'bg-[#fef7e0] text-[#b06000] border-[#feefc3]'
                            : 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                        }`}>
                          {hosp.riskLevel.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-[#202124]">{hosp.currentTotalUnits}</span>
                        <span className="text-[9px] text-[#70757a] block">Current Units</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 bg-[#f8fafd] p-2.5 rounded-2xl border border-[#dadce0] mb-3 text-[11px]">
                      <div>
                        <span className="text-[9px] text-[#5f6368] block font-semibold">DAILY BURN RATE</span>
                        <span className="text-[#202124] font-bold font-mono">~{hosp.estimatedDailyBurnRate} units/day</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#5f6368] block font-semibold">O- RUNWAY</span>
                        <span className={`font-bold font-mono ${isHighRisk ? 'text-[#ea4335]' : 'text-[#137333]'}`}>
                          {hosp.daysUntilStockout} days
                        </span>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="space-y-1 text-[11px] text-[#5f6368]">
                      {hosp.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#1a73e8] font-bold">›</span>
                          <span className="leading-tight">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f1f3f4] flex items-center justify-between text-xs">
                    <button
                      onClick={onOpenInterHospital}
                      className="text-[#1a73e8] hover:text-[#1557b0] font-bold flex items-center gap-1"
                    >
                      <span>Launch Transfer Route</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
