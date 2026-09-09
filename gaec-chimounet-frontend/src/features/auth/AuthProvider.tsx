import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { describeError } from "../../api/errors";
import { supabase } from "../../lib/supabase";
import { AuthContext, type AuthProfile, type AuthState } from "./AuthContext";

type AuthProviderProps = {
    children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<AuthProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Invalide une lecture devenue obsolète après une déconnexion ou un
    // changement de compte.
    const profileRequestId = useRef(0);

    const loadProfile = useCallback(
        async (userId: string, email: string): Promise<void> => {
            const requestId = ++profileRequestId.current;
            const { data, error } = await supabase
                .from("profiles")
                .select("id, email, full_name, role")
                .eq("id", userId)
                .maybeSingle();

            if (requestId !== profileRequestId.current) {
                return;
            }

            if (error) {
                console.error("Lecture du profil impossible :", error.message);
                setProfile(null);
                setIsLoading(false);
                return;
            }

            if (!data) {
                // Cas limite : compte auth existant sans profil (trigger absent
                // au moment de l'inscription). On le signale plutôt que de
                // laisser l'utilisateur devant une interface muette.
                console.warn(
                    `Aucun profil pour le compte ${email}. ` +
                        "Vérifiez que le trigger handle_new_user est bien installé.",
                );
                setProfile(null);
                setIsLoading(false);
                return;
            }

            setProfile({
                id: data.id,
                email: data.email ?? email,
                fullName: data.full_name,
                role: data.role,
            });
            setIsLoading(false);
        },
        [],
    );

    useEffect(() => {
        let isActive = true;

        // Restaure la session persistée avant le premier rendu utile, sinon un
        // rafraîchissement de page renverrait l'utilisateur vers la connexion.
        supabase.auth.getSession().then(({ data }) => {
            if (!isActive) {
                return;
            }

            setSession(data.session);

            if (data.session?.user) {
                void loadProfile(
                    data.session.user.id,
                    data.session.user.email ?? "",
                );
            } else {
                profileRequestId.current += 1;
                setProfile(null);
                setIsLoading(false);
            }
        });

        const { data: subscription } = supabase.auth.onAuthStateChange(
            (_event, nextSession) => {
                if (!isActive) {
                    return;
                }

                setSession(nextSession);

                const userId = nextSession?.user?.id ?? null;

                if (!userId) {
                    profileRequestId.current += 1;
                    setProfile(null);
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                void loadProfile(userId, nextSession?.user?.email ?? "");
            },
        );

        return () => {
            isActive = false;
            profileRequestId.current += 1;
            subscription.subscription.unsubscribe();
        };
    }, [loadProfile]);

    const signIn = useCallback(
        async (email: string, password: string): Promise<void> => {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (error) {
                // Supabase renvoie un message générique par sécurité : on ne
                // distingue pas « mot de passe faux » de « compte inexistant ».
                throw new Error(
                    error.message === "Invalid login credentials"
                        ? "Adresse e-mail ou mot de passe incorrect."
                        : describeError(error),
                );
            }
        },
        [],
    );

    const signOut = useCallback(async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new Error(describeError(error));
        }

        profileRequestId.current += 1;
        setProfile(null);
    }, []);

    const sendPasswordReset = useCallback(
        async (email: string): Promise<void> => {
            const { error } = await supabase.auth.resetPasswordForEmail(
                email.trim().toLowerCase(),
                { redirectTo: `${window.location.origin}/admin/mot-de-passe` },
            );

            if (error) {
                throw new Error(describeError(error));
            }
        },
        [],
    );

    const updatePassword = useCallback(async (password: string): Promise<void> => {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            throw new Error(describeError(error));
        }
    }, []);

    const refreshProfile = useCallback(async (): Promise<void> => {
        if (!session?.user) {
            return;
        }

        await loadProfile(session.user.id, session.user.email ?? "");
    }, [loadProfile, session]);

    const value = useMemo<AuthState>(
        () => ({
            session,
            profile,
            isLoading,
            isStaff:
                profile?.role === "admin" || profile?.role === "exploitant",
            isAdmin: profile?.role === "admin",
            signIn,
            signOut,
            sendPasswordReset,
            updatePassword,
            refreshProfile,
        }),
        [
            session,
            profile,
            isLoading,
            signIn,
            signOut,
            sendPasswordReset,
            updatePassword,
            refreshProfile,
        ],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
