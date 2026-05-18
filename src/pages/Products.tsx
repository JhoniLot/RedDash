import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Product } from '../context/AppContext';
import { RedTrackService } from '../services/redtrack';
import { motion } from 'framer-motion';
import { Edit2, Package } from 'lucide-react';
import ProductDrawer from '../components/ProductDrawer';
import PageHeader from '../components/PageHeader';

const Products: React.FC = () => {
  const { apiKey, dateRange, refreshKey, products, updateProduct, currency } = useAppContext();
  const [detectedProducts, setDetectedProducts] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchConvs = async () => {
      const convs = await RedTrackService.getConversions(apiKey, dateRange.from, dateRange.to);
      const uniqueNames = Array.from(new Set(convs.map((c: any) => c.offer_name)));
      setDetectedProducts(uniqueNames as string[]);
    };
    fetchConvs();
  }, [apiKey, dateRange, refreshKey]);

  const handleConfigure = (name: string) => {
    const existing = products.find(p => p.name === name);
    setSelectedProduct(existing || {
      id: Math.random().toString(36).substr(2, 9),
      name,
      productCost: 0,
      taxRate: 0,
      platformFee: 0,
      otherFees: 0
    });
    setDrawerOpen(true);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency', currency: currency, maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="p-6"
    >
      <PageHeader
        title="Products"
        description="Set unit costs and fees for accurate profit calculation"
      />

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider font-semibold text-[--color-text-muted]">
              <th className="px-5 py-3 border-b border-border">Product</th>
              <th className="px-5 py-3 border-b border-border text-center">Status</th>
              <th className="px-5 py-3 border-b border-border text-right">Unit Cost</th>
              <th className="px-5 py-3 border-b border-border text-right">Tax %</th>
              <th className="px-5 py-3 border-b border-border text-right">Platform %</th>
              <th className="px-5 py-3 border-b border-border text-right">Fixed Fees</th>
              <th className="px-5 py-3 border-b border-border text-right">Edit</th>
            </tr>
          </thead>
          <tbody>
            {detectedProducts.map((name) => {
              const config = products.find(p => p.name === name);
              return (
                <tr key={name} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <Package size={14} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">{name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {config
                      ? <span className="tag-success">Configured</span>
                      : <span className="tag-neutral">Pending</span>
                    }
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-[--color-text-secondary] font-mono">
                    {config ? formatCurrency(config.productCost) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-[--color-text-secondary] font-mono">
                    {config ? `${config.taxRate}%` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-[--color-text-secondary] font-mono">
                    {config ? `${config.platformFee}%` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right text-xs text-[--color-text-secondary] font-mono">
                    {config ? formatCurrency(config.otherFees) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleConfigure(name)}
                      className="p-1.5 hover:bg-white/8 text-[--color-text-secondary] hover:text-white rounded-md transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {detectedProducts.length === 0 && (
          <div className="py-16 text-center">
            <Package className="mx-auto text-[--color-text-muted] mb-3" size={32} />
            <p className="text-sm text-[--color-text-secondary]">No products detected yet.</p>
            <p className="text-xs text-[--color-text-muted] mt-1">Sync your conversion data to see products here.</p>
          </div>
        )}
      </div>

      <ProductDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={selectedProduct}
        onSave={updateProduct}
      />
    </motion.div>
  );
};

export default Products;
