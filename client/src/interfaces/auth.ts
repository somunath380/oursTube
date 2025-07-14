export interface AuthContextType {
    user: import('firebase/auth').User | null;
}

export interface AuthProviderProps {
    children: React.ReactNode;
}