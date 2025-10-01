import Link from 'next/link';
import { ArrowLeft, AlertCircle, CreditCard, Clock, Package, XCircle } from 'lucide-react';

export const metadata = {
  title: 'Pre-Order Policy | Zonash',
  description: 'Read our pre-order policy for imported products from China.',
};

export default function PreOrderPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 md:p-8 mb-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Pre-Order Policy</h1>
          <p className="text-orange-100">For products imported from China</p>
        </div>

        {/* Important Notice */}
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">Advance Payment Required</h3>
              <p className="text-sm text-orange-800">
                Pre-order products require 50% or full advance payment. Please read this policy carefully before placing your order.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-lg p-6 md:p-8 space-y-6">
          
          {/* What is Pre-Order */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">What is a Pre-Order?</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <p>
                Pre-order products are items that are <strong>not currently in stock in Bangladesh</strong>. These products will be imported from China specifically for your order.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded p-3 mt-3">
                <p className="text-sm text-orange-800">
                  <strong>🇨🇳 Direct Import:</strong> Products are sourced directly from China and shipped to Bangladesh after your order is confirmed.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Payment Terms</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Option 1: 50% Advance</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Pay 50% when placing order</li>
                  <li>Pay remaining 50% upon delivery</li>
                  <li>Recommended for first-time customers</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Option 2: 100% Advance</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Pay full amount when placing order</li>
                  <li>No payment required at delivery</li>
                  <li>Get priority processing</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Delivery Timeline */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Delivery Timeline</h2>
            </div>
            <div className="space-y-3 text-gray-700">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-center mb-4">
                  <span className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-lg font-bold">
                    10-15 Days
                  </span>
                  <p className="text-sm text-blue-800 mt-2">After order confirmation</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">1</div>
                    <div>
                      <strong>Days 1-2:</strong> Order confirmation & payment verification
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">2</div>
                    <div>
                      <strong>Days 3-5:</strong> Product sourced from China supplier
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">3</div>
                    <div>
                      <strong>Days 6-12:</strong> International shipping & customs clearance
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">4</div>
                    <div>
                      <strong>Days 13-15:</strong> Local delivery within Bangladesh
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Timeline may vary based on customs clearance and shipping conditions. We&apos;ll keep you updated via SMS/WhatsApp.
              </p>
            </div>
          </section>

          {/* Cancellation Policy */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Cancellation Policy</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  ⚠️ NO CANCELLATION after payment is confirmed
                </p>
                <p className="text-sm text-red-800">
                  Once your advance payment is received and order is confirmed, the product will be ordered from China. Cancellations are NOT possible as the product is being imported specifically for you.
                </p>
              </div>
              <div className="mt-3">
                <h3 className="font-semibold text-gray-900 mb-2">Exceptions:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Cancellation within 6 hours of payment (before order is placed in China) - 10% processing fee applies</li>
                  <li>If product is unavailable from supplier - full refund issued</li>
                  <li>Significant delay (more than 20 days) - refund or wait for delivery</li>
                </ul>
              </div>
            </div>
          </section>

          {/* What Happens After Order */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">What Happens After You Order?</h2>
            <div className="space-y-2 text-gray-700">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li><strong>Order Confirmation:</strong> You&apos;ll receive SMS/WhatsApp confirmation</li>
                <li><strong>Payment:</strong> Pay 50% or 100% advance via bKash/Nagad/Bank</li>
                <li><strong>Processing:</strong> We order the product from our China supplier</li>
                <li><strong>Shipping Updates:</strong> Regular updates via SMS/WhatsApp</li>
                <li><strong>Customs:</strong> We handle all customs clearance</li>
                <li><strong>Delivery:</strong> Product delivered to your address</li>
                <li><strong>Final Payment:</strong> Pay remaining 50% (if not paid in advance)</li>
              </ol>
            </div>
          </section>

          {/* Quality Assurance */}
          <section className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">✅ Quality Assurance</h3>
            <div className="space-y-1 text-sm text-green-800">
              <p>• All products are inspected before shipping from China</p>
              <p>• Products checked again upon arrival in Bangladesh</p>
              <p>• Secure packaging to prevent damage during shipping</p>
              <p>• Warranty applies (if mentioned in product description)</p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-2">Questions About Pre-Orders?</h3>
            <p className="text-sm text-orange-800 mb-3">
              Contact us before placing your pre-order. We&apos;ll answer all your questions!
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:01926644575" className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
                📞 Call: 01926644575
              </a>
              <a href="https://wa.me/8801926644575" className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
                💬 WhatsApp
              </a>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Last Updated: October 1, 2025</p>
          <p className="mt-1">Zonash reserves the right to update this policy at any time.</p>
        </div>
      </div>
    </div>
  );
}

