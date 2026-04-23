import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Landmark, Copy, UploadCloud, CheckCircle, Loader2, Info } from 'lucide-react';
import { dataService, authService } from '../services/dataService';
import { useAuth } from '../components/AuthProvider';
import confetti from 'canvas-confetti';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const appId = searchParams.get('appId');
  
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const bankDetails = {
    bank: "Commercial Bank of Ethiopia",
    name: "TravelWave Agency PLC",
    account: "1000757710343"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReceipt(URL.createObjectURL(selectedFile));
    }
  };

  const handleConfirm = async () => {
    if (!user || !appId || !file) return;
    setLoading(true);
    try {
      const uploadedUrl = await dataService.uploadReceipt(file, appId);
      
      await dataService.createPayment({
        applicationId: appId,
        userId: user.uid,
        amount: 2000, // Fixed for demo
        bankName: bankDetails.bank,
        accountNumber: bankDetails.account,
        receiptUrl: uploadedUrl
      });
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#f59e0b']
      });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      alert('Payment confirmation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Final Step: Payment</h1>
          <p className="text-gray-500 italic">Please complete the bank transfer to start processing</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-8 text-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold opacity-80 uppercase tracking-widest">Application ID</span>
              <span className="font-mono font-bold">#{appId?.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm opacity-80 mb-1">Service Fee</p>
                <p className="text-4xl font-black">2,000 <span className="text-lg">ETB</span></p>
              </div>
              <p className="text-xs bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">Visa Processing</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Bank Info */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-bold">
                <Landmark className="h-5 w-5 text-blue-600" />
                <h3>Transfer to:</h3>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative group">
                <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-tighter">{bankDetails.bank}</p>
                <p className="text-xl font-bold text-gray-900 mb-1">{bankDetails.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-mono text-blue-600 tracking-tighter">{bankDetails.account}</p>
                  <button 
                    onClick={() => copyToClipboard(bankDetails.account)}
                    className="p-2 bg-white text-blue-600 rounded-lg shadow-sm border border-gray-100 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute -top-3 -right-3 p-2 bg-yellow-100 text-yellow-700 rounded-lg shadow-sm border border-yellow-200 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span className="text-[10px] font-bold">Verify before transfer</span>
                </div>
              </div>
            </section>

            {/* Upload Receipt */}
            <section className="space-y-4">
              <h3 className="text-gray-900 font-bold">Upload Transfer Receipt</h3>
              <label 
                className={`h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                  receipt ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <input type="file" className="hidden" onChange={handleReceiptUpload} />
                {receipt ? (
                  <>
                    <div className="h-24 w-24 bg-white p-2 rounded-xl shadow-sm border border-green-200">
                      <img src={receipt} className="h-full w-full object-cover rounded-lg" alt="Receipt" />
                    </div>
                    <span className="text-sm font-bold text-green-700">Receipt Attached</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-gray-400" />
                    <div className="text-center">
                      <p className="font-bold text-gray-700">Click to upload screenshot</p>
                      <p className="text-xs text-gray-500 italic mt-1">Proof of payment is required</p>
                    </div>
                  </>
                )}
              </label>
            </section>

            <button
              onClick={handleConfirm}
              disabled={!receipt || loading}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-6 w-6" />
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
