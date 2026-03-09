import "../styles/register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createUser } from "../utils/api";
import type { User } from "../utils/api";
import { Toast, type ToastData } from "../components/toast";


const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);


interface PasswordRules {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
}


const checkPassword = (v: string): PasswordRules => ({
    minLength: v.length >= 8,
    hasUpper: /[A-Z]/.test(v),
    hasLower: /[a-z]/.test(v),
    hasNumber: /[0-9]/.test(v),
    hasSpecial: /[^A-Za-z0-9]/.test(v),
});


const allValid = (r: PasswordRules) => Object.values(r).every(Boolean);


function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: ok ? "#3b8a55" : "#a0907a", transition: "color 0.2s" }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={ok ? "#3b8a55" : "#c0b0a0"} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                {ok ? <polyline points="20 6 9 17 4 12" /> : <circle cx="12" cy="12" r="10" />}
            </svg>
            {label}
        </div>
    );
}


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


// Wrapper para o campo de senha com botão de olho centralizado
function PasswordInput({
    id,
    placeholder,
    value,
    onChange,
    show,
    onToggleShow,
    inputStyle,
    ariaLabel,
}: {
    id: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    show: boolean;
    onToggleShow: () => void;
    inputStyle: React.CSSProperties;
    ariaLabel: string;
}) {
    return (
        <div className="password-wrapper">
            <input
                id={id}
                type={show ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
                style={inputStyle}
            />
            <button
                type="button"
                onClick={onToggleShow}
                aria-label={ariaLabel}
                className="eye-btn"
            >
                <EyeIcon open={show} />
            </button>
        </div>
    );
}


export default function Register() {
    const navigate = useNavigate();


    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<ToastData | null>(null);


    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [confirmTouched, setConfirmTouched] = useState(false);
    const [submitted, setSubmitted] = useState(false);


    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);


    const emailValid = isValidEmail(email);
    const emailError = (emailTouched || submitted) && email.length > 0 && !emailValid;


    const pwRules = checkPassword(password);
    const showPwRules = passwordTouched && password.length > 0;
    const pwValid = allValid(pwRules);


    const confirmMatch = password === confirmPassword;
    const confirmError = (confirmTouched || submitted) && confirmPassword.length > 0 && !confirmMatch;


    const showToast = (data: ToastData) => setToast(data);
    const closeToast = () => setToast(null);


    const inputStyle = (hasError: boolean, isValid?: boolean): React.CSSProperties => ({
        borderColor: hasError ? "#c0392b" : isValid ? "#3b8a55" : undefined,
        boxShadow: hasError ? "0 0 0 3px rgba(192,57,43,0.12)" : isValid ? "0 0 0 3px rgba(59,138,85,0.12)" : undefined,
        transition: "border-color 0.2s, box-shadow 0.2s",
    });


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);


        if (!emailValid) {
            showToast({ type: "warning", title: "Email inválido", message: "Por favor, insira um email válido." });
            return;
        }
        if (!pwValid) {
            showToast({ type: "warning", title: "Senha fraca", message: "Sua senha não atende todos os requisitos." });
            return;
        }
        if (!confirmMatch) {
            showToast({ type: "warning", title: "Senhas não coincidem", message: "Por favor, verifique se as senhas digitadas são iguais." });
            return;
        }


        const user: User = { firstName, lastName, email, username, password, confirmPassword };


        try {
            setLoading(true);
            await createUser(user);
            showToast({ type: "success", title: "Conta criada com sucesso!", message: "" });
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
            showToast({ type: "error", title: "Erro ao criar conta", message: errorMessage });
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="container register-page">
            {toast && <Toast data={toast} onClose={closeToast} />}


            <div className="logo">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="book-icon"
                    fill="none"
                >
                    <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
                    <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
                </svg>
                <h1>LitPath</h1>
            </div>


            <p className="subtitle">Crie sua conta gratuita</p>


            <section className="card">
                <h2>Cadastrar</h2>
                <p className="card-subtitle">Preencha os dados abaixo para criar sua conta</p>


                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div>
                            <label htmlFor="nome">Nome</label>
                            <input id="nome" type="text" placeholder="João" value={firstName}
                                onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="sobrenome">Sobrenome</label>
                            <input id="sobrenome" type="text" placeholder="Silva" value={lastName}
                                onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                    </div>


                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                        onBlur={() => setEmailTouched(true)}
                        required
                        style={{
                            ...inputStyle(emailError, emailTouched && emailValid),
                            width: "100%",
                            boxSizing: "border-box",
                        }}
                    />
                    {emailError && (
                        <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4, marginBottom: 0 }}>
                            ⚠ Insira um email válido (ex: nome@email.com)
                        </p>
                    )}


                    <label htmlFor="usuario">Nome de usuário</label>
                    <input id="usuario" type="text" placeholder="@seuusuario" value={username}
                        onChange={(e) => setUsername(e.target.value)} required />


                    <label htmlFor="senha">Senha</label>
                    <PasswordInput
                        id="senha"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                        show={showPassword}
                        onToggleShow={() => setShowPassword(p => !p)}
                        inputStyle={inputStyle(!pwValid && passwordTouched && password.length > 0, pwValid && passwordTouched)}
                        ariaLabel="Mostrar senha"
                    />


                    {showPwRules && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8, marginBottom: 4, padding: "10px 12px", background: "#faf6f0", borderRadius: 10, border: "1px solid #ede0ce" }}>
                            <PasswordRule ok={pwRules.minLength} label="Mínimo de 8 caracteres" />
                            <PasswordRule ok={pwRules.hasUpper} label="Pelo menos uma letra maiúscula" />
                            <PasswordRule ok={pwRules.hasLower} label="Pelo menos uma letra minúscula" />
                            <PasswordRule ok={pwRules.hasNumber} label="Pelo menos um número" />
                            <PasswordRule ok={pwRules.hasSpecial} label="Pelo menos um caractere especial (!@#...)" />
                        </div>
                    )}


                    <label htmlFor="confirmar">Confirmar senha</label>
                    <PasswordInput
                        id="confirmar"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setConfirmTouched(true); }}
                        show={showConfirm}
                        onToggleShow={() => setShowConfirm(p => !p)}
                        inputStyle={inputStyle(confirmError, confirmTouched && confirmMatch && confirmPassword.length > 0)}
                        ariaLabel="Mostrar confirmação de senha"
                    />
                    {confirmError && (
                        <p style={{ color: "#c0392b", fontSize: 12, marginTop: 4, marginBottom: 0 }}>
                            ⚠ As senhas não coincidem
                        </p>
                    )}


                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 16 }}>
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
