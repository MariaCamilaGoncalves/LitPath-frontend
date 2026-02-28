import "../styles/cadastro.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUser } from "../api";
import type { User } from "../api";

type ToastType = "success" | "error" | "warning";

interface ToastData {
    type: ToastType;
    title: string;
    message: string;
}

function Toast({ data, onClose }: { data: ToastData; onClose: () => void }) {
    const colors = {
        success: { border: "rgba(59,139,85,0.25)", icon: "#3b2b24", title: "#3b2b24" },
        error: { border: "rgba(180,60,50,0.25)", icon: "#a63228", title: "#a63228" },
        warning: { border: "rgba(180,130,50,0.25)", icon: "#7a5c1e", title: "#7a5c1e" },
    };
    const c = colors[data.type];

    const Icon = () => {
        if (data.type === "success")
            return <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>;
        if (data.type === "warning")
            return <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
        return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
    };

    return (
        <>
            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateY(-24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .toast-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 1000;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 32px;
                    pointer-events: none;
                }
                .toast-card {
                    pointer-events: all;
                    background: #ffffff;
                    border-radius: 16px;
                    padding: 20px 24px 20px 20px;
                    box-shadow:
                        0 2px 0 rgba(255,255,255,0.85) inset,
                        0 16px 48px rgba(59,43,36,0.15),
                        0 2px 10px rgba(59,43,36,0.08);
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    max-width: 360px;
                    width: calc(100% - 40px);
                    animation: toastSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
                }
                .toast-icon-wrap {
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .toast-icon-wrap svg {
                    width: 20px;
                    height: 20px;
                    stroke: #fff;
                    stroke-width: 2.2;
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
                .toast-body { flex: 1; min-width: 0; }
                .toast-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 15px;
                    font-weight: 700;
                    margin-bottom: 3px;
                }
                .toast-message { font-size: 13px; color: #7a6a5a; line-height: 1.5; }
                .toast-close {
                    flex-shrink: 0;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #b0a090;
                    padding: 2px;
                    display: flex;
                    align-items: center;
                    transition: color 0.2s;
                    box-shadow: none;
                    border-radius: 4px;
                }
                .toast-close:hover { color: #3b2b24; transform: none; background: none; border-color: transparent; }
                .toast-close svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; }
            `}</style>
            <div className="toast-overlay">
                <div className="toast-card" role="alert" style={{ border: `1px solid ${c.border}` }}>
                    <div className="toast-icon-wrap" style={{ background: c.icon }}>
                        <Icon />
                    </div>
                    <div className="toast-body">
                        <div className="toast-title" style={{ color: c.title }}>{data.title}</div>
                        <div className="toast-message">{data.message}</div>
                    </div>
                    <button className="toast-close" onClick={onClose} aria-label="Fechar">
                        <svg viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}

export default function Cadastro() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<ToastData | null>(null);

    const showToast = (data: ToastData) => setToast(data);
    const closeToast = () => setToast(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast({
                type: "warning",
                title: "Senhas não coincidem",
                message: "Por favor, verifique se as senhas digitadas são iguais.",
            });
            return;
        }

        const user: User = {
            firstName,
            lastName,
            email,
            username,
            password,
            confirmPassword,
        };

        try {
            setLoading(true);
            await createUser(user);
            showToast({
                type: "success",
                title: "Conta criada com sucesso!",
                message: "",
            });
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            let errorMessage = "Erro ao criar usuário";
            if (err instanceof Error) {
                try {
                    const parsed = JSON.parse(err.message);
                    errorMessage = parsed.error ?? err.message;
                } catch {
                    errorMessage = err.message;
                }
            }
            showToast({
                type: "error",
                title: "Erro ao criar conta",
                message: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container">
            {toast && <Toast data={toast} onClose={closeToast} />}

            <div className="logo">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="32"
                    height="32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
                    <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
                </svg>
                <h1>LitPath</h1>
            </div>

            <p className="subtitle">Crie sua conta gratuita</p>

            <section className="card">
                <h2>Cadastrar</h2>
                <p className="card-subtitle">
                    Preencha os dados abaixo para criar sua conta
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div>
                            <label htmlFor="nome">Nome</label>
                            <input
                                id="nome"
                                type="text"
                                placeholder="João"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="sobrenome">Sobrenome</label>
                            <input
                                id="sobrenome"
                                type="text"
                                placeholder="Silva"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="usuario">Nome de usuário</label>
                    <input
                        id="usuario"
                        type="text"
                        placeholder="@seuusuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <label htmlFor="senha">Senha</label>
                    <input
                        id="senha"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <label htmlFor="confirmar">Confirmar senha</label>
                    <input
                        id="confirmar"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Criando..." : "Criar Conta"}
                    </button>
                </form>

                <p className="register">
                    Já tem uma conta? <Link to="/">Entrar</Link>
                </p>
            </section>
        </main>
    );
}