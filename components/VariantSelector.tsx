'use client';

import { useState, useEffect } from 'react';
import { Product, ProductVariation, ProductAttribute } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

interface VariantSelectorProps {
  product: Product;
  onVariantChange: (variation: ProductVariation | null, selectedAttributes: Record<string, string>) => void;
}

export default function VariantSelector({ product, onVariantChange }: VariantSelectorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);

  const attributes = product.attributes?.nodes || [];
  const variations = product.variations?.nodes || [];
  const defaultAttributes = product.defaultAttributes?.nodes || [];

  // Auto-select default attributes on component mount
  useEffect(() => {
    console.log('Default attributes:', defaultAttributes);
    console.log('Current selected attributes:', selectedAttributes);
    
    if (defaultAttributes.length > 0 && Object.keys(selectedAttributes).length === 0) {
      const defaultAttrs: Record<string, string> = {};
      defaultAttributes.forEach((attr) => {
        console.log('Processing default attr:', attr);
        if (attr.name && attr.value) {
          // Find the matching attribute name (case-insensitive)
          const matchingAttribute = attributes.find(a => 
            a.name.toLowerCase() === attr.name.toLowerCase()
          );
          console.log('Matching attribute found:', matchingAttribute);
          if (matchingAttribute) {
            defaultAttrs[matchingAttribute.name] = attr.value;
          }
        }
      });
      
      console.log('Setting default attributes:', defaultAttrs);
      if (Object.keys(defaultAttrs).length > 0) {
        setSelectedAttributes(defaultAttrs);
      }
    }
  }, [defaultAttributes, attributes, selectedAttributes]);

  // Find matching variation based on selected attributes
  useEffect(() => {
    console.log('Variation matching debug:', {
      selectedAttributes,
      attributesLength: attributes.length,
      selectedAttributesLength: Object.keys(selectedAttributes).length,
      variations: variations.map(v => ({
        id: v.databaseId,
        name: v.name,
        attributes: v.attributes.nodes.map(a => ({ name: a.name, value: a.value }))
      }))
    });

    if (Object.keys(selectedAttributes).length === attributes.length && attributes.length > 0) {
      const matchingVariation = variations.find((variation) => {
        const isMatch = variation.attributes.nodes.every((attr) => {
          // Convert attribute name to match variation format (lowercase)
          const attributeKey = Object.keys(selectedAttributes).find(key => 
            key.toLowerCase() === attr.name.toLowerCase()
          );
          const selectedValue = attributeKey ? selectedAttributes[attributeKey] : null;
          const matches = selectedValue && selectedValue.toLowerCase() === attr.value.toLowerCase();
          
          console.log('Attribute matching:', {
            variationAttr: { name: attr.name, value: attr.value },
            selectedAttr: { key: attributeKey, value: selectedValue },
            matches
          });
          
          return matches;
        });
        
        console.log('Variation match result:', { variationId: variation.databaseId, isMatch });
        return isMatch;
      });

      console.log('Found matching variation:', matchingVariation);
      setSelectedVariation(matchingVariation || null);
      onVariantChange(matchingVariation || null, selectedAttributes);
    } else {
      console.log('Not enough attributes selected');
      setSelectedVariation(null);
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
    
    console.log('Checking availability:', { attributeName, optionValue, hasVariationWithValue });
    return hasVariationWithValue;
  };

  // Debug logs removed for production
  
  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {attributes.map((attribute) => (
        <div key={attribute.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">
              {attribute.name}
            </label>
            {selectedAttributes[attribute.name] && (
              <span className="text-xs text-teal-600 font-medium">
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
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-teal-500 hover:bg-teal-50'
                    }
                  `}
                >
                  {option}
                  {isSelected && (
                    <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 text-teal-600 bg-white rounded-full" />
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
}

