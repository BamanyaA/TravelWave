import { motion } from 'motion/react';
import { Plane, ShieldCheck, MapPin, Search, ArrowRight, Globe, Hotel, FileText, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  { icon: ShieldCheck, title: 'Passport Processing', desc: 'New passport applications and renewals handled efficiently.' },
  { icon: Globe, title: 'Visa Processing', desc: 'Expert assistance for tourist, business, and transit visas.' },
  { icon: Plane, title: 'Flight Booking', desc: 'Secure the best airfares with our preferred airline partners.' },
  { icon: Hotel, title: 'Hotel Reservation', desc: 'Quality accommodations tailored to your budget and style.' },
  { icon: FileText, title: 'Document Legalization', desc: 'Fast-track authentication for your legal and academic papers.' },
  { icon: GraduationCap, title: 'Student Visa Support', desc: 'Comprehensive support for international student applications.' },
];

const steps = [
  { number: '01', title: 'Fill Application', desc: 'Enter your details in our secure online portal.' },
  { number: '02', title: 'Upload Documents', desc: 'Provide clear copies of IDs and required photos.' },
  { number: '03', title: 'Make Payment', desc: 'Complete payment via bank transfer or mobile money.' },
  { number: '04', title: 'We Process Everything', desc: 'Our team handles the rest and notifies you on every step.' },
];

export default function Home() {
  return (
    <div className="pt-16 overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center bg-gray-50">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109c05d?auto=format&fit=crop&q=80&w=2000" 
            alt="Travel background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-6">
              Fast & Reliable <br /> 
              <span className="text-blue-600 italic">Travel Services</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              Expert assistance for Passport Processing, Visas, Hotel Bookings, and Student Support in Ethiopia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/apply" 
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                Apply Now <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                Learn More
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-12 w-12 rounded-full border-4 border-white overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="text-gray-900 font-bold">500+</span> applications processed <br /> this month in Addis Ababa.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Premium Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto italic">
              We specialize in navigating the complexities of travel documentation so you don't have to.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl border border-gray-100 bg-white hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-50/50 transition-all flex flex-col items-start group"
              >
                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-500 mb-6 leading-relaxed flex-grow">
                  {service.desc}
                </p>
                <Link to="/apply" className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Apply <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Simple Process, <br /> Zero Stress</h2>
              <p className="text-gray-500 mb-12">
                We've simplified the travel application process into four easy steps. 
                Track everything from your personal dashboard.
              </p>
              <div className="space-y-8">
                {steps.map((step) => (
                  <div key={step.number} className="flex gap-6">
                    <span className="text-3xl font-black text-blue-200/50">{step.number}</span>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-gray-500 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-blue-600/5 rounded-full blur-3xl" />
              <img 
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000" 
                alt="Process" 
                className="rounded-3xl shadow-2xl relative z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'How long does passport renewal take?', a: 'Standard processing takes 10-15 business days, while express takes 3-5 days.' },
              { q: 'Which countries do you process visas for?', a: 'We handle visas for US, UK, EU, UAE, Canada, and many other major destinations.' },
              { q: 'Can I track my application status online?', a: 'Yes, once you apply, you can log in to your dashboard to see real-time updates.' },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <h4 className="font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
