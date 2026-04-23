import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {
  const accountNo = "1000757710343";
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 shadow-[0_-1px_20px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-white text-xl font-bold mb-4">TravelWave Agency</h3>
          <p className="text-sm leading-relaxed mb-6">
            Providing reliable and fast travel document processing services in Ethiopia. 
            Your gateway to the world starts here.
          </p>
          <div className="flex space-x-4">
            <button className="p-2 bg-gray-800 rounded-lg hover:bg-blue-600 transition-colors">
              <MessageCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
              <span>Bole Road, Addis Ababa, Ethiopia</span>
            </li>
            <li className="flex items-center gap-3 cursor-pointer hover:text-white transition-colors" onClick={() => copyToClipboard("+251 912 345 678")}>
              <Phone className="h-5 w-5 text-blue-500" />
              <span>+251 912 345 678</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <span>contact@travelwave.com</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">Quick Info</h4>
          <p className="text-sm mb-4">Official Bank Account for Payments:</p>
          <div 
            onClick={() => copyToClipboard(accountNo)}
            className="bg-gray-800 p-4 rounded-xl border border-gray-700 cursor-pointer group hover:border-blue-500 transition-all"
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Commercial Bank of Ethiopia</p>
            <p className="text-white font-mono font-medium">{accountNo}</p>
            <p className="text-[10px] text-blue-400 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to copy account number
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8 text-center text-xs">
        <p>© {new Date().getFullYear()} TravelWave Agency. All rights reserved.</p>
      </div>
    </footer>
  );
}
