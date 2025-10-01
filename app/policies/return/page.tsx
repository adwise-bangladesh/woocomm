import Link from 'next/link';
import { ArrowLeft, AlertCircle, XCircle, CheckCircle, Clock } from 'lucide-react';

export const metadata = {
  title: 'Return & Refund Policy | Zonash',
  description: 'Read our return and refund policy before placing your order.',
};

export default function ReturnPolicyPage() {
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
        <div className="bg-white rounded-lg p-6 md:p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Return & Refund Policy</h1>
          <p className="text-gray-600">Please read this policy carefully before placing your order</p>
        </div>

        {/* Important Notice */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Order Confirmation Required</h3>
              <p className="text-sm text-red-800">
                Please make sure you are 100% certain before placing an order. Once confirmed, all sales are final unless the product is defective or significantly different from the description.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-lg p-6 md:p-8 space-y-6">
          
          {/* Delivery Rejection */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Delivery Rejection</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <p>
                If you refuse to accept a delivered product for any reason other than defect or mismatch:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>You must pay the delivery charge</strong> (Tk 80-130) directly to the delivery person</li>
                <li>Product must be returned immediately in original packaging</li>
                <li>Refund will be processed minus delivery charges (both ways)</li>
                <li>Processing time: 7-14 business days</li>
              </ul>
            </div>
          </section>

          {/* Valid Return Cases */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Valid Return Cases</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <p>Returns are accepted ONLY if:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Defective Product:</strong> Manufacturing defect or damaged during shipping</li>
                <li><strong>Wrong Product:</strong> Received completely different item than ordered</li>
                <li><strong>Significant Mismatch:</strong> Product significantly differs from description/photos</li>
              </ul>
              <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                <p className="text-sm text-green-800">
                  <strong>Note:</strong> Minor color variations due to lighting or screen settings are not valid return reasons.
                </p>
              </div>
            </div>
          </section>

          {/* Return Timeframe */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Return Timeframe</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Immediate Inspection Required:</strong> Check product at delivery time</li>
                <li><strong>Complaint Window:</strong> Report issues within 24 hours of delivery</li>
                <li><strong>No Later Returns:</strong> Returns requested after 24 hours will NOT be accepted</li>
                <li><strong>Return Window:</strong> Product must be returned within 3 days after complaint approval</li>
              </ul>
            </div>
          </section>

          {/* Non-Returnable Items */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Non-Returnable Items</h2>
            <div className="space-y-2 text-gray-700">
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Opened/used products (unless defective)</li>
                <li>Products without original packaging</li>
                <li>Customized or personalized items</li>
                <li>Hygiene products (earphones, underwear, etc.)</li>
                <li>Sale/clearance items marked as &quot;Final Sale&quot;</li>
              </ul>
            </div>
          </section>

          {/* Important Information */}
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Important Information</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Data Collection:</strong> Your mobile number, delivery address, and device IP address are recorded with each order for security and fraud prevention purposes.
              </p>
              <p>
                <strong>Unnecessary Orders:</strong> Repeated order cancellations or rejections may result in your number being blocked from future orders.
              </p>
              <p>
                <strong>Inspection Required:</strong> Always inspect the product thoroughly before accepting delivery. Once accepted without complaint, the sale is final.
              </p>
            </div>
          </section>

          {/* Refund Process */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Refund Process</h2>
            <div className="space-y-2 text-gray-700">
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Contact customer support within 24 hours: <strong>01926644575</strong></li>
                <li>Provide order number and photos/video of the issue</li>
                <li>Wait for return approval (1-2 business days)</li>
                <li>Return product in original packaging with all accessories</li>
                <li>Refund processed after product inspection (5-7 business days)</li>
                <li>Refund issued via bKash/Nagad or original payment method</li>
              </ol>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <h3 className="font-semibold text-teal-900 mb-2">Have Questions?</h3>
            <p className="text-sm text-teal-800 mb-3">
              Contact our customer support before placing your order if you have any concerns.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:01926644575" className="text-sm text-teal-600 hover:text-teal-700 font-semibold">
                📞 Call: 01926644575
              </a>
              <a href="https://wa.me/8801926644575" className="text-sm text-teal-600 hover:text-teal-700 font-semibold">
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

