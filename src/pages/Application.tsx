import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, MapPin, Globe, Phone as PhoneIcon, FileUp, PenTool, CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { dataService, authService } from '../services/dataService';
import { useAuth } from '../components/AuthProvider';
import { Application, TravelPurpose } from '../types';

export default function ApplicationForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<Omit<Application, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>>({
    fullName: user?.fullName || '',
    nationality: '',
    dob: '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    region: '',
    city: '',
    kebele: '',
    purpose: 'Tourism',
    destination: '',
    emergencyContact: { name: '', phone: '', relation: '' },
    documents: {},
    signature: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleFileChange = (field: 'passportUrl' | 'photoUrl' | 'additionalUrl', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage. Here we use a fake URL
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [field]: URL.createObjectURL(file) }
      }));
    }
  };

  const handleSignatureClear = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setFormData({ ...formData, signature: '' });
    }
  };

  const getCoordinates = (e: any) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    const ctx = sigCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      const { x, y } = getCoordinates(e);
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: any) => {
    if (e.buttons !== 1 && (!e.touches || e.touches.length === 0)) return;
    
    // Prevent scrolling on touch
    if (e.touches) {
      e.preventDefault();
    }

    const ctx = sigCanvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#000';
      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handleSignatureEnd = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      setFormData({ ...formData, signature: canvas.toDataURL() });
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const app = await dataService.createApplication({
        ...formData,
        userId: user.uid
      });
      navigate(`/payment?appId=${app.id}`);
    } catch (err) {
      alert('Application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to apply</h2>
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-12 px-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div 
                className={`h-10 w-10 flex items-center justify-center rounded-full border-2 transition-all ${
                  step >= i ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-400 bg-white'
                }`}
              >
                {step > i ? <CheckCircle className="h-6 w-6" /> : i}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= i ? 'text-blue-600' : 'text-gray-400'}`}>
                {['Personal', 'Address', 'Travel', 'Emergency', 'Docs', 'Sign'][i-1]}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 overflow-hidden">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User className="h-5 w-5" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white border-transparent focus:border-blue-500 border outline-none transition-all"
                      placeholder="As listed on ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nationality</label>
                    <input 
                      type="text" 
                      value={formData.nationality}
                      onChange={e => setFormData({...formData, nationality: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white border-transparent focus:border-blue-500 border outline-none transition-all"
                      placeholder="Ethiopian"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Date of Birth</label>
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={e => setFormData({...formData, dob: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white border-transparent focus:border-blue-500 border outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white border-transparent focus:border-blue-500 border outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin className="h-5 w-5" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Residential Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Region</label>
                    <input 
                      type="text" 
                      value={formData.region}
                      onChange={e => setFormData({...formData, region: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border-0 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">City</label>
                    <input 
                      type="text" 
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border-0 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Kebele</label>
                    <input 
                      type="text" 
                      value={formData.kebele}
                      onChange={e => setFormData({...formData, kebele: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border-0 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Travel Info */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Globe className="h-5 w-5" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Travel Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Purpose of Travel</label>
                    <select 
                      value={formData.purpose}
                      onChange={e => setFormData({...formData, purpose: e.target.value as TravelPurpose})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border-0 focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Tourism</option>
                      <option>Work</option>
                      <option>Study</option>
                      <option>Business</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Destination Country</label>
                    <input 
                      type="text" 
                      value={formData.destination}
                      onChange={e => setFormData({...formData, destination: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border-0 focus:ring-2 focus:ring-blue-500" 
                      placeholder="e.g. United Arab Emirates"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Emergency Contact */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PhoneIcon className="h-5 w-5" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Emergency Contact</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Name</label>
                    <input 
                      type="text" 
                      value={formData.emergencyContact.name}
                      onChange={e => setFormData({...formData, emergencyContact: {...formData.emergencyContact, name: e.target.value}})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border-0 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Phone</label>
                    <input 
                      type="tel" 
                      value={formData.emergencyContact.phone}
                      onChange={e => setFormData({...formData, emergencyContact: {...formData.emergencyContact, phone: e.target.value}})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border-0 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Relation</label>
                    <input 
                      type="text" 
                      value={formData.emergencyContact.relation}
                      onChange={e => setFormData({...formData, emergencyContact: {...formData.emergencyContact, relation: e.target.value}})}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border-0 focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileUp className="h-5 w-5" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Upload Documents</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6 italic">Clear JPG or PDF images only. Max 5MB per file.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'passportUrl', label: 'Passport / ID' },
                    { id: 'photoUrl', label: 'Recent Photo' },
                    { id: 'additionalUrl', label: 'Additional Docs' },
                  ].map((doc) => (
                    <div key={doc.id} className="relative group">
                      <label 
                        className={`h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                          formData.documents[doc.id as keyof typeof formData.documents] 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <input type="file" className="hidden" onChange={(e) => handleFileChange(doc.id as any, e)} />
                        {formData.documents[doc.id as keyof typeof formData.documents] ? (
                          <>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <span className="text-xs font-bold text-green-700">Selected</span>
                          </>
                        ) : (
                          <>
                            <FileUp className="h-8 w-8 text-gray-400 group-hover:text-blue-600" />
                            <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600">{doc.label}</span>
                          </>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Signature */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PenTool className="h-5 w-5" /></div>
                  <h2 className="text-xl font-bold text-gray-900">Electronic Signature</h2>
                </div>
                <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100">
                  <canvas 
                    ref={sigCanvasRef}
                    width={600}
                    height={200}
                    onMouseUp={handleSignatureEnd}
                    onTouchEnd={handleSignatureEnd}
                    onMouseMove={draw}
                    onTouchMove={draw}
                    onMouseDown={startDrawing}
                    onTouchStart={startDrawing}
                    className="w-full h-48 bg-white rounded-2xl cursor-crosshair shadow-inner touch-none"
                  />
                  <div className="flex justify-between mt-4 px-2">
                    <p className="text-xs text-gray-500 italic">Please sign inside the box using your mouse or touch screen.</p>
                    <button onClick={handleSignatureClear} className="text-xs font-bold text-red-500 hover:underline">Clear</button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-100">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-2 text-gray-500 font-bold disabled:opacity-0"
              >
                <ChevronLeft className="h-5 w-5" /> Previous
              </button>
              
              {step < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100"
                >
                  Continue <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !formData.signature}
                  className="bg-green-600 text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Application'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
