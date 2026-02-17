import "../styles/cadastro.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { createUser } from "../api";
import type { User } from "../api";

export default function Cadastro() {
    // Estados para inputs do formulário
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("As senhas não coincidem!");
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
            alert("Usuário criado com sucesso!");
            // Limpar campos após sucesso
            setFirstName("");
            setLastName("");
            setEmail("");
            setUsername("");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Erro ao criar usuário";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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

            <p className="subtitle">Crie sua conta gratuita</p>

            {/* Card */}
            <section className="card">
                <h2>Cadastrar</h2>
                <p className="card-subtitle">
                    Preencha os dados abaixo para criar sua conta
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Nome e Sobrenome */}
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