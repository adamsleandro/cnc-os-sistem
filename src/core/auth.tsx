import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../shared/types/auth.types';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (rolePreference?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Sync profile from Firestore
        const profileRef = doc(db, 'profiles', firebaseUser.uid);
        
        // Use onSnapshot for real-time profile updates (like role changes)
        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile({ id: docSnap.id, ...docSnap.data() } as Profile);
          } else {
            setProfile(null);
          }
          setIsLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `profiles/${firebaseUser.uid}`);
          setIsLoading(false);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (rolePreference?: UserRole) => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // If profile doesn't exist, create one
      const profileRef = doc(db, 'profiles', result.user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        const newProfile: Omit<Profile, 'id'> = {
          full_name: result.user.displayName || 'Usuário CNC',
          email: result.user.email || '',
          role: rolePreference || (result.user.email === 'adamsleandro@gmail.com' ? 'admin' : 'operador'),
          company_id: 'default_company', // For MVP
          active: true,
          avatar_url: result.user.photoURL || undefined,
          created_at: new Date().toISOString()
        };
        await setDoc(profileRef, newProfile);
      }
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
