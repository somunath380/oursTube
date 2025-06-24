// src/components/LoginButton.tsx
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";

export const LoginButton = () => {
    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            localStorage.setItem("token", token); // optional
        } catch (err) {
            console.error("Login failed:", err);
        }
    };
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
        }}>
            <h1 style={{ color: '#fff', fontWeight: 700, marginBottom: 12, fontSize: 36 }}>Welcome to OursTube</h1>
            <p style={{ color: '#bbb', fontSize: 18, marginBottom: 40, textAlign: 'center', maxWidth: 400 }}>
                Where there are free videos without ads
            </p>
            <button
                onClick={handleLogin}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#fff',
                    color: '#222',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 28px 10px 18px',
                    fontSize: 18,
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    gap: 12,
                }}
            >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png"
                    alt="Google logo"
                    style={{ width: 26, height: 26, marginRight: 8, background: 'transparent' }}
                />
                Sign in with Google
            </button>
        </div>
    );
};
