import "../styles/login.css";
import { Link } from "react-router-dom";

export default function Login() {
    return (
        <main className="container">
            {/* Logo */}
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

            <p className="subtitle">Entre na sua conta</p>

            {/* Card */}
            <section className="card">
                <h2>Entrar</h2>

                <p className="card-subtitle">
                    Digite seu email e senha para acessar sua conta
                </p>

                <form>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                    />

                    <label htmlFor="senha">Senha</label>
                    <input
                        id="senha"
                        type="password"
                        placeholder="••••••••"
                    />

                    <div className="options">
                        <a href="#" className="forgot">
                            Esqueceu a senha?
                        </a>
                    </div>

                    <button type="submit" className="btn-primary">
                        Entrar
                    </button>
                </form>

                <p className="register">
                    Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
                </p>

            </section>
        </main>
    );
}
