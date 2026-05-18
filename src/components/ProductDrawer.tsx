import React, { useState, useEffect } from 'react';
import { X, Save, Info } from 'lucide-react';
import type { Product } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (product: Product) => void;
}

const inputClass = 
  'w-full bg-[--color-background] border border-border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-[--color-text-muted] focus:border-white/20 outline-none transition-all font-mono';

const labelClass = 'block text-xs font-medium text-[--color-text-secondary] mb-1.5';

const ProductDrawer: React.FC<ProductDrawerProps> = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    productCost: 0,
    taxRate: 0,
    platformFee: 0,
    otherFees: 0
  });

  useEffect(() => {
    if (product) setFormData(product);
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const field = (
    label: string,
    key: keyof Product,
    step = '0.01',
    placeholder = '0.00'
  ) => (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="number"
        step={step}
        value={formData[key] as number}
        onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
        className={inputClass}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-surface border-l border-border z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-white">Configure Product</h2>
                <p className="text-xs text-[--color-text-secondary] truncate max-w-[260px] mt-0.5">{formData.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/5 rounded-md text-[--color-text-secondary] hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Info banner */}
              <div className="flex gap-3 p-3.5 bg-[--color-background] border border-border rounded-lg">
                <Info size={15} className="text-primary shrink-0 mt-px" />
                <p className="text-xs text-[--color-text-secondary] leading-relaxed">
                  These values calculate your <strong className="text-white">real net profit</strong> and margins across all dashboards.
                </p>
              </div>

              {field('Unit Product Cost', 'productCost', '0.01', '0.00')}

              <div className="grid grid-cols-2 gap-3">
                {field('Tax Rate (%)', 'taxRate', '0.1', '0')}
                {field('Platform Fee (%)', 'platformFee', '0.1', '0')}
              </div>

              {field('Other Fixed Fees', 'otherFees', '0.01', '0.00')}
            </form>

            {/* Footer */}
            <div className="p-5 border-t border-border shrink-0">
              <button
                onClick={handleSubmit}
                className="w-full bg-primary text-white font-semibold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Save size={15} />
                Save Configuration
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDrawer;
