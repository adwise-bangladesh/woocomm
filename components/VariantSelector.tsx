'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Product, ProductVariation } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';
// import { logger } from '@/lib/utils/performance';

interface VariantSelectorProps {
  product: Product;
  onVariantChange: (variation: ProductVariation | null, selectedAttributes: Record<string, string>) => void;
}

const VariantSelector = memo(function VariantSelector({ product, onVariantChange }: VariantSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Memoize expensive data processing
  const { attributes, variations, defaultAttributes } = useMemo(() => ({
    attributes: product.attributes?.nodes || [],
    variations: product.variations?.nodes || [],
    defaultAttributes: product.defaultAttributes?.nodes || []
  }), [product.attributes, product.variations, product.defaultAttributes]);

  // Memoize attribute options for better performance
  const attributeOptions = useMemo(() => {
    return attributes.map(attr => ({
      ...attr,
      options: attr.options || []
    }));
  }, [attributes]);

  // Auto-select default attributes on component mount
  useEffect(() => {
    if (defaultAttributes.length > 0 && Object.keys(selectedAttributes).length === 0) {
      const defaultAttrs: Record<string, string> = {};
      defaultAttributes.forEach((attr) => {
        if (attr.name && attr.value) {
          // Find the matching attribute name (case-insensitive)
          const matchingAttribute = attributes.find(a => 
            a.name.toLowerCase() === attr.name.toLowerCase()
          );
          if (matchingAttribute) {
            defaultAttrs[matchingAttribute.name] = attr.value;
          }
        }
      });
      
      if (Object.keys(defaultAttrs).length > 0) {
        setSelectedAttributes(defaultAttrs);
      }
    }
  }, [defaultAttributes, attributes, selectedAttributes]);

  // Find matching variation based on selected attributes
  useEffect(() => {
    if (Object.keys(selectedAttributes).length === attributes.length && attributes.length > 0) {
      const matchingVariation = variations.find((variation) => {
        const isMatch = variation.attributes.nodes.every((attr) => {
          // Convert attribute name to match variation format (lowercase)
          const attributeKey = Object.keys(selectedAttributes).find(key => 
            key.toLowerCase() === attr.name.toLowerCase()
          );
          const selectedValue = attributeKey ? selectedAttributes[attributeKey] : null;
          const matches = selectedValue && selectedValue.toLowerCase() === attr.value.toLowerCase();
          
          return matches;
        });
        
        return isMatch;
      });

      onVariantChange(matchingVariation || null, selectedAttributes);
    } else {
      onVariantChange(null, selectedAttributes);
    }
  }, [selectedAttributes, variations, attributes.length, onVariantChange]);

  const handleAttributeSelect = (attributeName: string, value: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  };

  // Check if a specific option is available based on current selections
  const isOptionAvailable = (attributeName: string, optionValue: string): boolean => {
    // If no variations exist, allow all options (fallback)
    if (!variations || variations.length === 0) {
      return true;
    }

    // Check if there's any variation that has this attribute value
    const hasVariationWithValue = variations.some(variation => {
      return variation.attributes.nodes.some(attr => 
        attr.name.toLowerCase() === attributeName.toLowerCase() && 
        attr.value.toLowerCase() === optionValue.toLowerCase()
      );
    });
    
    return hasVariationWithValue;
  };

  
  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {attributeOptions.map((attribute) => (
        <div key={attribute.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">
              {attribute.name}
            </label>
            {selectedAttributes[attribute.name] && (
              <span className="text-xs font-medium" style={{ color: '#fe6c06' }}>
                {selectedAttributes[attribute.name]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {attribute.options?.map((option) => {
              const isSelected = selectedAttributes[attribute.name] === option;
              const isAvailable = isOptionAvailable(attribute.name, option);
              const isDisabled = !isAvailable;

              return (
                <button
                  key={option}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAttributeSelect(attribute.name, option);
                  }}
                  disabled={isDisabled}
                  className={`
                    relative min-w-[60px] px-4 py-2 rounded-md border-2 text-sm font-medium
                    transition-all duration-200 cursor-pointer
                    ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:bg-orange-25'
                    }
                  `}
                  style={isSelected ? { borderColor: '#fe6c06', backgroundColor: '#fef3e7', color: '#e55a00' } : {}}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !isSelected) {
                      (e.target as HTMLElement).style.borderColor = '#fe6c06';
                      (e.target as HTMLElement).style.backgroundColor = '#fef3e7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled && !isSelected) {
                      (e.target as HTMLElement).style.borderColor = '';
                      (e.target as HTMLElement).style.backgroundColor = '';
                    }
                  }}
                >
                  {option}
                  {isSelected && (
                    <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full" style={{ color: '#fe6c06' }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}


      {/* Warning if incomplete selection */}
      {Object.keys(selectedAttributes).length < attributes.length && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            Please select all options to continue
          </p>
        </div>
      )}
    </div>
  );
});

export default VariantSelector;

