"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';

const MediaForecast = () => {
  // Core input states
  const [campaignDuration, setCampaignDuration] = useState(30);
  const [totalAdSpend, setTotalAdSpend] = useState(200000);
  const [cpm, setCpm] = useState(40);
  const [adCtr, setAdCtr] = useState(2);
  const [vslToOfCtr, setVslToOfCtr] = useState(5);
  const [orderFormConversion, setOrderFormConversion] = useState(20);
  const [aov, setAov] = useState(204.42);

  // Store previous metrics to calculate changes
  interface Metrics {
    totalImpressions: number;
    dailyBudget: number;
    clicksToVsl: number;
    costPerClick: number;
    clicksToOrder: number;
    grossOrders: number;
    grossRevenue: number;
    roas: number;
    cpa: number;
    promoConversionRate: number;
  }

  const [previousMetrics, setPreviousMetrics] = useState<Metrics | null>(null);
  const [derivedMetrics, setDerivedMetrics] = useState<Metrics>({
    totalImpressions: 0,
    dailyBudget: 0,
    clicksToVsl: 0,
    costPerClick: 0,
    clicksToOrder: 0,
    grossOrders: 0,
    grossRevenue: 0,
    roas: 0,
    cpa: 0,
    promoConversionRate: 0
  });

  // Format number with commas and optional decimal places
  const formatNumber = (num: number, decimals = 0) => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };

  // Format currency
  const formatCurrency = (num: number) => {
    return num.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate percentage change
  const getPercentageChange = (current: number, previous: number | null) => {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
  };

  useEffect(() => {
    const calculateMetrics = () => {
      const totalImpressions = (totalAdSpend / cpm) * 1000;
      const dailyBudget = totalAdSpend / campaignDuration;
      const clicksToVsl = totalImpressions * (adCtr / 100);
      const costPerClick = totalAdSpend / clicksToVsl;
      const clicksToOrder = clicksToVsl * (vslToOfCtr / 100);
      const grossOrders = clicksToOrder * (orderFormConversion / 100);
      const grossRevenue = grossOrders * aov;
      const roas = (grossRevenue / totalAdSpend) * 100;
      const cpa = totalAdSpend / grossOrders;
      const promoConversionRate = (grossOrders / clicksToVsl) * 100;

      return {
        totalImpressions,
        dailyBudget,
        clicksToVsl,
        costPerClick,
        clicksToOrder,
        grossOrders,
        grossRevenue,
        roas,
        cpa,
        promoConversionRate
      };
    };

    const newMetrics = calculateMetrics();
    setPreviousMetrics(derivedMetrics);
    setDerivedMetrics(newMetrics);
  }, [campaignDuration, totalAdSpend, cpm, adCtr, vslToOfCtr, orderFormConversion, aov, derivedMetrics]);

  // Define metric relationships
  const metricImpacts: { [key: string]: string[] } = {
    adCtr: ['clicksToVsl', 'costPerClick', 'clicksToOrder', 'grossOrders', 'grossRevenue', 'roas', 'promoConversionRate'],
    vslToOfCtr: ['clicksToOrder', 'grossOrders', 'grossRevenue', 'roas'],
    orderFormConversion: ['grossOrders', 'grossRevenue', 'roas'],
    aov: ['grossRevenue', 'roas']
  };

  const ImpactIndicator = ({ value, size = "small" }: { value: number | null, size?: string }) => {
    if (!value) return null;
    const abs = Math.abs(value);
    if (abs < 0.1) return null;

    return (
      <div className={`flex items-center ${value > 0 ? 'text-green-500' : 'text-red-500'} ${size === 'large' ? 'text-lg' : 'text-sm'}`}>
        {value > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        <span className="ml-1">{abs.toFixed(1)}%</span>
      </div>
    );
  };

  // New component to show metric relationships
  const MetricRelationship = ({ targetMetrics }: { targetMetrics: string[] }) => (
    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
      <span>Impacts:</span>
      {targetMetrics.map((metric, index) => (
        <React.Fragment key={metric}>
          <span className="font-medium">{metric}</span>
          {index < targetMetrics.length - 1 && <ArrowRight size={12} className="text-gray-400" />}
        </React.Fragment>
      ))}
    </div>
  );

  const MetricInput = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step = 1,
    helpText,
    prefix = "",
    suffix = "",
    metricKey
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    helpText?: string;
    prefix?: string;
    suffix?: string;
    metricKey?: string;
  }) => (
    <div className="mb-12 border-b pb-8">
      <div className="flex justify-between items-baseline mb-2">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{label}</h3>
          {helpText && (
            <p className="text-sm text-gray-500 mt-1">{helpText}</p>
          )}
          {metricKey && metricImpacts[metricKey] && (
            <MetricRelationship
              targetMetrics={metricImpacts[metricKey]}
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">{prefix}</span>
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-24 text-right"
            step={step}
          />
          <span className="text-gray-500">{suffix}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([newVal]) => onChange(newVal)}
        className="mt-4"
      />
      <div className="flex justify-between text-sm text-gray-500 mt-1">
        <span>{prefix}{min}{suffix}</span>
        <span>{prefix}{max}{suffix}</span>
      </div>
    </div>
  );

  const ResultCard = ({ 
    label, 
    value, 
    metric, 
    helpText 
  }: { 
    label: string; 
    value: string; 
    metric: keyof typeof derivedMetrics; 
    helpText?: string; 
  }) => {
    const change = getPercentageChange(
      derivedMetrics[metric],
      previousMetrics?.[metric] ?? null
    );

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between">
          <div className="text-sm text-gray-500">{label}</div>
          <ImpactIndicator value={change} />
        </div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        {helpText && <div className="text-sm text-gray-500 mt-1">{helpText}</div>}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Are Your Ads Worth It?</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Plan for ad spend success by estimating key metrics. Watch how changes ripple through your funnel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <Card className="p-6">
            <CardContent>
              <MetricInput
                label="Campaign Duration"
                value={campaignDuration}
                onChange={setCampaignDuration}
                min={1}
                max={90}
                suffix=" days"
                helpText="How long do you want to run your campaign?"
              />

              <MetricInput
                label="Total Ad Spend"
                value={totalAdSpend}
                onChange={setTotalAdSpend}
                min={1000}
                max={500000}
                step={1000}
                prefix="$"
                helpText="What's your total budget for this campaign?"
              />

              <MetricInput
                label="CPM (Cost Per 1000 Impressions)"
                value={cpm}
                onChange={setCpm}
                min={1}
                max={100}
                step={0.5}
                prefix="$"
                helpText="Average cost to reach 1000 people with your ad"
              />

              <MetricInput
                label="Ad CTR"
                value={adCtr}
                onChange={setAdCtr}
                min={0.1}
                max={10}
                step={0.1}
                suffix="%"
                helpText="What percentage of people click your ad?"
                metricKey="adCtr"
              />

              <MetricInput
                label="VSL to OF CTR"
                value={vslToOfCtr}
                onChange={setVslToOfCtr}
                min={0.1}
                max={20}
                step={0.1}
                suffix="%"
                helpText="What percentage of VSL viewers click through to the order form?"
                metricKey="vslToOfCtr"
              />

              <MetricInput
                label="Order Form Conversion"
                value={orderFormConversion}
                onChange={setOrderFormConversion}
                min={0.1}
                max={40}
                step={0.1}
                suffix="%"
                helpText="What percentage of order form visitors make a purchase?"
                metricKey="orderFormConversion"
              />

              <MetricInput
                label="Average Order Value"
                value={aov}
                onChange={setAov}
                min={1}
                max={1000}
                step={1}
                prefix="$"
                helpText="What's the average amount spent per customer?"
                metricKey="aov"
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Results</h2>
            <div className="grid grid-cols-2 gap-4">
              <ResultCard
                label="Clicks to VSL"
                value={formatNumber(derivedMetrics.clicksToVsl)}
                metric="clicksToVsl"
                helpText="Total visitors to your VSL page"
              />
              
              <ResultCard
                label="Cost Per Click"
                value={formatCurrency(derivedMetrics.costPerClick)}
                metric="costPerClick"
                helpText="Average cost per visitor"
              />

              <ResultCard
                label="Clicks to Order"
                value={formatNumber(derivedMetrics.clicksToOrder)}
                metric="clicksToOrder"
                helpText="People who reach your order form"
              />

              <ResultCard
                label="Gross Orders"
                value={formatNumber(derivedMetrics.grossOrders)}
                metric="grossOrders"
                helpText="Total purchases"
              />

              <ResultCard
                label="Gross Revenue"
                value={formatCurrency(derivedMetrics.grossRevenue)}
                metric="grossRevenue"
                helpText="Total revenue before costs"
              />

              <ResultCard
                label="ROAS"
                value={`${formatNumber(derivedMetrics.roas, 1)}%`}
                metric="roas"
                helpText="Return on ad spend"
              />

              <ResultCard
                label="CAC/CPA"
                value={formatCurrency(derivedMetrics.cpa)}
                metric="cpa"
                helpText="Cost to acquire each customer"
              />

              <ResultCard
                label="Promo Conversion"
                value={`${formatNumber(derivedMetrics.promoConversionRate, 2)}%`}
                metric="promoConversionRate"
                helpText="VSL to purchase rate"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { MediaForecast };
