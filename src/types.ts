export type ApplicationStatus = 'pending' | 'processing' | 'approved' | 'rejected';

export type TravelPurpose = 'Tourism' | 'Work' | 'Study' | 'Business';

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Application {
  id: string;
  userId: string;
  fullName: string;
  nationality: string;
  dob: string;
  phone: string;
  email: string;
  region: string;
  city: string;
  kebele: string;
  purpose: TravelPurpose;
  destination: string;
  emergencyContact: EmergencyContact;
  documents: {
    passportUrl?: string;
    photoUrl?: string;
    additionalUrl?: string;
  };
  signature: string; // Base64 or path
  status: ApplicationStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Payment {
  id: string;
  applicationId: string;
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  receiptUrl: string;
  status: 'pending' | 'confirmed';
  createdAt: number;
}

export interface User {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
}
