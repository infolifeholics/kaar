import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAIL } from '../firebase';

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

// Sign in with Google and enforce strictly info.lifeholics@gmail.com
export async function loginAdminWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const email = user.email?.toLowerCase().trim();
    if (email === ADMIN_EMAIL.toLowerCase().trim()) {
      return { success: true, user };
    } else {
      // Reject unauthorized user immediately and sign out from Firebase session
      await firebaseSignOut(auth);
      return {
        success: false,
        error: 'Access denied. You are not authorized to access the admin dashboard.',
      };
    }
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in window closed before completing.' };
    }
    return {
      success: false,
      error: err.message || 'Failed to authenticate with Google. Please check your credentials.',
    };
  }
}

export async function logoutAdmin(): Promise<void> {
  await firebaseSignOut(auth);
}

// Listener for Admin authentication state
export function subscribeToAdminAuth(callback: (state: AdminAuthState) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user && user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()) {
      callback({
        user,
        isAdmin: true,
        loading: false,
        error: null,
      });
    } else {
      callback({
        user: null,
        isAdmin: false,
        loading: false,
        error: null,
      });
    }
  });
}
