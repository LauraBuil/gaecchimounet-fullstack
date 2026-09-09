import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

import type { UserRole } from "../../api/users";

export type AuthProfile = {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
};

export type AuthState = {
    session: Session | null;
    profile: AuthProfile | null;
    /** Vrai tant que la session initiale n'a pas été restaurée depuis le stockage local. */
    isLoading: boolean;
    /** Peut modifier le contenu : recettes, photos, produits, points de distribution. */
    isStaff: boolean;
    /** Peut en plus gérer les comptes utilisateurs. */
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth doit être utilisé à l'intérieur d'un <AuthProvider>.",
        );
    }

    return context;
}
