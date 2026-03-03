import "../styles/login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Toast, type ToastData } from "../components/toast";

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
) : (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState<ToastData | null>(null);

    const [emailTouched, setEmailTouched] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const emailValid = isValidEmail(email);
    const emailError = (emailTouched || submitted) && email.length > 0 && !emailValid;

    const handleSubmit = async () => {
        setSubmitted(true);
        setToast(null);

        if (!emailValid) {
            setToast({ type: "warning", title: "Email inválido", message: "Por favor, insira um email válido." });
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                setToast({ type: "error", title: "Erro ao entrar", message: data.error || "Email ou senha inválidos." });
                return;
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            navigate("/home");

        } catch (err) {
            const message = err instanceof Error ? err.message : "Não foi possível conectar ao servidor.";
            setToast({ type: "error", title: "Erro de conexão", message });
        }
    };

    return (
        <main className="container">
            {toast && <Toast data={toast} onClose={() => setToast(null)} />}

            <div className="logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="book-icon" fill="none">
                    <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
                    <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
                </svg>
                <h1>LitPath</h1>
            </div>
            <p className="subtitle">Entre na sua conta</p>

            <section className="card">
                <h2>Entrar</h2>
                <p className="card-subtitle">Digite seu email e senha para acessar sua conta</p>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                        onBlur={() => setEmailTouched(true)}
                        style={{
                            borderColor: emailError ? "#c0392b" : emailTouched && emailValid ? "#3b8a55" : undefined,
                            boxShadow: emailError ? "0 0 0 3px rgba(192,57,43,0.12)" : emailTouched && emailValid ? "0 0 0 3px rgba(59,138,85,0.12)" : undefined,
                            transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                    />
                    {emailError && (
                        <p style={{ color: "#c0392b", fontSize: 12, marginTop: -10, marginBottom: 14 }}>
                            ⚠ Insira um email válido (ex: nome@email.com)
                        </p>
                    )}

                    <label htmlFor="senha">Senha</label>
                    <div className="password-wrapper">
                        <input
                            id="senha"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            aria-label="Mostrar senha"
                            className="eye-btn"
                        >
                            <EyeIcon open={showPassword} />
                        </button>
                    </div>

                    <div className="options">
                        <a href="#" className="forgot">Esqueceu a senha?</a>
                    </div>

                    <button type="button" className="btn-primary" onClick={handleSubmit}>
                        Entrar
                    </button>
                </div>

                <p className="register">
                    Não tem uma conta? <Link to="/register">Cadastre-se</Link>
                </p>
            </section>
        </main>
    );
}