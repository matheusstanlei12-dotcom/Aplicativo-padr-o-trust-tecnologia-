
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

type UserRole = 'programador' | 'perito' | 'pcp' | 'gestor' | 'cliente' | 'montagem' | 'qualidade' | 'comercial' | null;

interface AuthContextType {
    session: Session | null;
    user: any | null;
    role: UserRole;
    status: string;
    loading: boolean;
    isAdmin: boolean;
    isProgrammer: boolean;
    empresaId: string | null;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    status: '',
    loading: true,
    isAdmin: false,
    isProgrammer: false,
    empresaId: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [status, setStatus] = useState<string>('');
    const [empresaId, setEmpresaId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const userEmail = session?.user?.email?.toLowerCase().trim();
    const isProgrammer = userEmail === 'matheus.stanley12@gmail.com';

    useEffect(() => {
        // 1. Get Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                // Failsafe imediato para Programmer
                if (session.user.email?.toLowerCase().trim() === 'matheus.stanley12@gmail.com') {
                    setRole('programador');
                    setStatus('APROVADO');
                    setLoading(false);
                } else {
                    fetchProfile(session.user.id, session.user.email);
                }
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                // Failsafe imediato para Programmer
                if (session.user.email?.toLowerCase().trim() === 'matheus.stanley12@gmail.com') {
                    setRole('programador');
                    setStatus('APROVADO');
                    setLoading(false);
                } else {
                    fetchProfile(session.user.id, session.user.email);
                }
            } else {
                setRole(null);
                setEmpresaId(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string, email?: string) => {
        console.log('🔍 Fetching profile for user:', userId);

        // 👑 Programmer Override
        const isProg = email?.toLowerCase().trim() === 'matheus.stanley12@gmail.com';
        
        if (isProg) {
            setRole('programador');
            setStatus('APROVADO');
            setLoading(false);
            return;
        }

        try {
            const { data } = await supabase
                .from('profiles')
                .select('role, status, empresa_id')
                .eq('id', userId)
                .single();

            if (data) {
                setRole(data.role as UserRole);
                setStatus(data.status || 'PENDENTE');
                setEmpresaId(data.empresa_id);
            }
        } catch (error) {
            console.error('💥 Exception fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        session,
        user: session?.user ?? null,
        role,
        status,
        loading,
        isProgrammer,
        empresaId,
        isAdmin: ['programador', 'gestor', 'pcp', 'perito', 'montagem', 'qualidade', 'comercial'].includes(role || '')
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
