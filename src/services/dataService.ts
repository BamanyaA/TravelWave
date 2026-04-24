import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Application, Payment, User, ApplicationStatus } from '../types';

interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: any[];
  } | null;
}

function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null): never {
  const authInfo = auth.currentUser ? {
    userId: auth.currentUser.uid,
    email: auth.currentUser.email || '',
    emailVerified: auth.currentUser.emailVerified,
    isAnonymous: auth.currentUser.isAnonymous,
    providerInfo: auth.currentUser.providerData
  } : null;

  const errorInfo: FirestoreErrorInfo = {
    error: error.message,
    operationType,
    path,
    authInfo
  };

  throw new Error(JSON.stringify(errorInfo));
}

export const dataService = {
  async getApplications(userId?: string): Promise<Application[]> {
    try {
      let q = collection(db, 'applications');
      const constraints: any[] = [orderBy('createdAt', 'desc')];
      
      if (userId) {
        constraints.push(where('userId', '==', userId));
      }
      
      const finalQuery = query(q, ...constraints);
      const snapshot = await getDocs(finalQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
    } catch (error) {
      handleFirestoreError(error, 'list', 'applications');
    }
  },

  async createApplication(app: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Application> {
    try {
      const appRef = doc(collection(db, 'applications'));
      const timestamp = Date.now(); // rules expect numeric for simplicity in my rule but I'll use request.time in rules
      // Actually my rules used request.time.toMillis()
      const newApp = {
        ...app,
        id: appRef.id,
        status: 'pending' as ApplicationStatus,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      await setDoc(appRef, newApp);
      return newApp as Application;
    } catch (error) {
      handleFirestoreError(error, 'create', 'applications');
    }
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<void> {
    try {
      const appRef = doc(db, 'applications', id);
      await updateDoc(appRef, { 
        status,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, 'update', `applications/${id}`);
    }
  },

  async getPayments(userId?: string): Promise<Payment[]> {
    try {
      let q = collection(db, 'payments');
      const constraints: any[] = [orderBy('createdAt', 'desc')];
      
      if (userId) {
        constraints.push(where('userId', '==', userId));
      }
      
      const finalQuery = query(q, ...constraints);
      const snapshot = await getDocs(finalQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
    } catch (error) {
      handleFirestoreError(error, 'list', 'payments');
    }
  },

  async createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'status'>): Promise<Payment> {
    try {
      const paymentRef = doc(collection(db, 'payments'));
      const newPayment = {
        ...payment,
        id: paymentRef.id,
        status: 'pending' as const,
        createdAt: Date.now()
      };
      await setDoc(paymentRef, newPayment);
      return newPayment as Payment;
    } catch (error) {
      handleFirestoreError(error, 'create', 'payments');
    }
  },

  async uploadReceipt(file: File, applicationId: string): Promise<string> {
    const uploadWithTimeout = async () => {
      try {
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File too large. Max 10MB allowed.");
        }

        console.log(`Starting upload: ${file.name}`);
        const storageRef = ref(storage, `receipts/${applicationId}/${Date.now()}_${file.name}`);
        
        // Use a timeout for the upload
        const uploadTask = uploadBytes(storageRef, file);
        const timeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Upload timed out (60s). This usually happens due to slow internet or a very large file.")), 60000)
        );

        await Promise.race([uploadTask, timeout]);
        
        console.log("Upload finished, getting URL...");
        return await getDownloadURL(storageRef);
      } catch (error: any) {
        console.error("Upload process error:", error);
        throw error;
      }
    };

    try {
      return await uploadWithTimeout();
    } catch (error: any) {
      console.error("Critical Upload Failure:", error);
      const msg = error.message || "Unknown storage error";
      throw new Error(`Receipt upload failed: ${msg}. If this persists, please contact support or check your internet.`);
    }
  }
};

export const authService = {
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        // Recover profile for the main admin if it's missing but they are signed in Correctlty
        if (email === 'bamanejigu112@gmail.com') {
          const newUser: User = { 
            uid: userCredential.user.uid, 
            fullName: 'Admin', 
            email: email, 
            phoneNumber: '', 
            role: 'admin' 
          };
          
          try {
            await setDoc(doc(db, 'admins', userCredential.user.uid), { email: newUser.email });
            await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
          } catch (e) {
            console.error("Admin record recovery failed:", e);
          }
          return newUser;
        }
        throw new Error('User profile not found');
      }

      const userData = userDoc.data() as User;
      
      // Safety check: if email matches admin but role is wrong, correct it
      if (email === 'bamanejigu112@gmail.com' && userData.role !== 'admin') {
        try {
          await updateDoc(doc(db, 'users', userCredential.user.uid), { role: 'admin' });
          userData.role = 'admin';
          // Also ensure admins collection entry exists
          await setDoc(doc(db, 'admins', userCredential.user.uid), { email: email });
        } catch (e) {
          console.error("Failed to sync admin role:", e);
        }
      }
      
      return userData;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  async signup(fullName: string, email: string, phoneNumber: string, password: string): Promise<User> {
    try {
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (authError: any) {
        // If email already in use, try to sign in. 
        // This handles cases where auth was created but firesore profile failed previously.
        if (authError.code === 'auth/email-already-in-use') {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw authError;
        }
      }

      const newUser: User = { 
        uid: userCredential.user.uid, 
        fullName, 
        email, 
        phoneNumber, 
        role: email === 'bamanejigu112@gmail.com' ? 'admin' : 'user' 
      };
      
      if (newUser.role === 'admin') {
        try {
          await setDoc(doc(db, 'admins', userCredential.user.uid), { email: newUser.email });
        } catch (e) {
          console.error("Admin record creation failed, might already exist:", e);
        }
      }
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      return newUser;
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  },

  getCurrentUser(): User | null {
    // This is synchronous in the mock, but Firebase is async. 
    // Usually handled via onAuthStateChanged.
    // For now, I'll try to get it from local cache if available 
    // but better to use the observer in App.tsx
    const user = auth.currentUser;
    if (!user) return null;
    // We would need the profile from DB. 
    // This service needs a refactor to be properly async/observer based.
    return null; 
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        // Admin recovery gate
        if (firebaseUser.email === 'bamanejigu112@gmail.com') {
          const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
          if (!adminDoc.exists()) {
            try {
              await setDoc(doc(db, 'admins', firebaseUser.uid), { email: firebaseUser.email });
              console.log("Admin record reconstructed");
            } catch (e) {
              console.error("Admin record reconstruction failed:", e);
            }
          }

          if (!userDoc.exists()) {
            const newUser: User = { 
              uid: firebaseUser.uid, 
              fullName: 'Admin', 
              email: firebaseUser.email, 
              phoneNumber: '', 
              role: 'admin' 
            };
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            } catch (e) {
              console.error("User profile reconstruction failed:", e);
            }
          } else if (userDoc.data()?.role !== 'admin') {
            // Ensure role is admin if metadata matches
            await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' });
            userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          }
        }

        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },

  async logout() {
    await signOut(auth);
  }
};
