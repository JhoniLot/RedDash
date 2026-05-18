import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

import type { ConversionData, ReportRow } from '../services/redtrack';

export const useFinancials = (conversions: ConversionData[], reports: ReportRow[]) => {
  const { products } = useAppContext();

  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalAdSpend = 0;
    let totalConversions = 0;
    let totalProductCosts = 0;
    let totalTaxes = 0;
    let totalPlatformFees = 0;
    let totalOtherFees = 0;

    // From Reports (mostly for Ad Spend)
    reports.forEach(row => {
      totalAdSpend += row.cost;
      if (conversions.length === 0) {
        totalRevenue += row.revenue;
        totalConversions += row.conversions;
      }
    });

    // From Conversions (for detailed revenue and product-specific costs)
    const processedConversions = conversions.map(conv => {
      const product = products.find(p => p.name === conv.offer_name);
      
      const revenue = conv.revenue;
      const productCost = product?.productCost || 0;
      const taxAmount = (revenue * (product?.taxRate || 0)) / 100;
      const platformFeeAmount = (revenue * (product?.platformFee || 0)) / 100;
      const otherFees = product?.otherFees || 0;

      const netProfit = revenue - productCost - taxAmount - platformFeeAmount - otherFees;
      
      totalRevenue += revenue;
      totalConversions += 1;
      totalProductCosts += productCost;
      totalTaxes += taxAmount;
      totalPlatformFees += platformFeeAmount;
      totalOtherFees += otherFees;

      return {
        ...conv,
        productCost,
        netProfit
      };
    });

    const totalFees = totalTaxes + totalPlatformFees + totalOtherFees;
    const netProfit = totalRevenue - totalAdSpend - totalProductCosts - totalFees;
    const roas = totalAdSpend > 0 ? totalRevenue / totalAdSpend : 0;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const cpa = totalConversions > 0 ? totalAdSpend / totalConversions : 0;

    return {
      totalRevenue,
      totalAdSpend,
      totalConversions,
      totalProductCosts,
      totalTaxes,
      totalPlatformFees,
      totalOtherFees,
      totalFees,
      netProfit,
      roas,
      margin,
      cpa,
      processedConversions
    };
  }, [conversions, reports, products]);

  return metrics;
};
