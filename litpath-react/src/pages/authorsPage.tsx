import "../styles/authorsPage.css";
import { translateGenre } from "../utils/genreTranslations";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);


const UserCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
);


const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
);


// ── Types ──────────────────────────────────────────────────────────────────────
interface GenreDTO {
    id: number;
    name: string;
}


interface AuthorDTO {
    id: number;
    name: string;
    photoUrl: string;
    biography: string;
    nationality: string;
    birthDate: string;
    genres: GenreDTO[];
    books: { id: number }[];
}


const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);


const API_URL = "http://localhost:8080";


const authFetch = (url: string) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
    });


// ── Page ──────────────────────────────────────────────────────────────────────
export default function AuthorsPage() {
    const navigate = useNavigate();


    const [authors, setAuthors] = useState<AuthorDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [authorSearch, setAuthorSearch] = useState("");
    const [activeGenre, setActiveGenre] = useState("Todos");
    const [allGenres, setAllGenres] = useState<string[]>(["Todos"]);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }


        const fetchAuthors = async () => {
            try {
                const res = await authFetch(`${API_URL}/authors`);


                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/");
                    return;
                }


                const data: AuthorDTO[] = await res.json();
                setAuthors(shuffle(data));


                // Monta lista de gêneros únicos a partir dos autores
                const genreSet = new Set<string>();
                data.forEach(a => a.genres?.forEach(g => genreSet.add(translateGenre(g.name))));
                setAllGenres(["Todos", ...Array.from(genreSet).sort()]);


            } catch (err) {
                console.error("Erro ao buscar autores:", err);
            } finally {
                setLoading(false);
            }
        };


        fetchAuthors();
    }, [navigate]);


    const filtered = authors.filter(a => {
        const matchSearch = a.name.toLowerCase().includes(authorSearch.toLowerCase());
        const matchGenre = activeGenre === "Todos" || a.genres?.some(g => translateGenre(g.name) === activeGenre);
        return matchSearch && matchGenre;
    });


    return (
        <div className="authors-page">
            {/* Header */}
            <header className="litpath-header">
                <div className="header-container">
                    <div className="logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
                            fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
                            <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
                        </svg>
                        <span>LitPath</span>
                    </div>
                    <nav className="header-nav">
                        <Link to="/autores" className="nav-link active-nav">Autores</Link>
                        <Link to="/livros" className="nav-link">Livros</Link>
                        <Link to="/perfil" className="nav-link">
                            <UserCircleIcon />
                            <span>Perfil</span>
                        </Link>
                    </nav>
                </div>
            </header>


            <main className="authors-main">
                {/* Hero */}
                <section className="authors-hero">
                    <h1 className="authors-hero-title">Descubra Autores</h1>
                    <p className="authors-hero-subtitle">
                        Explore a rica diversidade da literatura brasileira<br />
                        e mundial através dos seus grandes autores
                    </p>
                </section>


                {/* Search */}
                <div className="authors-controls">
                    <div className="authors-search-bar">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Pesquisar autores..."
                            value={authorSearch}
                            onChange={e => setAuthorSearch(e.target.value)}
                        />
                    </div>
                </div>


                {/* Genre Chips — gerados dinamicamente do banco */}
                <div className="authors-filters">
                    <p className="authors-filters-label">Gêneros</p>
                    <div className="genre-chips">
                        {allGenres.map(g => (
                            <button
                                key={g}
                                className={`genre-chip ${activeGenre === g ? "active" : ""}`}
                                onClick={() => setActiveGenre(g)}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>


                {/* Grid */}
                {loading && <div className="loading-state"><p>Carregando...</p></div>}


                {!loading && filtered.length === 0 && (
                    <div className="empty-state"><p>Nenhum autor encontrado.</p></div>
                )}


                {!loading && filtered.length > 0 && (
                    <div className="authors-grid">
                        {filtered.map(author => (
                            <AuthorCard key={author.id} author={author} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}


// ── Author Card ───────────────────────────────────────────────────────────────
function AuthorCard({ author }: { author: AuthorDTO }) {
    const MAX_GENRES = 2;
    const visible = author.genres?.slice(0, MAX_GENRES) ?? [];
    const extra = (author.genres?.length ?? 0) - MAX_GENRES;


    return (
        <div className="author-card">
            <div className="author-card-cover">
                {author.photoUrl ? (
                    <img
                        src={author.photoUrl}
                        alt={author.name}
                        onError={e => {
                            (e.target as HTMLImageElement).style.display = "none";
                        }}
                    />
                ) : (
                    <div className="author-card-cover-placeholder">
                        <UserCircleIcon />
                    </div>
                )}


            </div>


            <div className="author-card-body">
                <p className="author-card-name-below">{author.name}</p>
                <div className="author-card-meta-below">
                    <span><BookIcon /> {author.books?.length ?? 0} livros</span>
                    {author.nationality && <span>{author.nationality}</span>}
                </div>
                <p className="author-card-description">
                    {author.biography
                        ? author.biography.slice(0, 120) + "..."
                        : "Biografia não disponível."}
                </p>


                <div className="author-card-genres">
                    {visible.map(g => (
                        <span key={g.id} className="genre-tag">{translateGenre(g.name)}</span>
                    ))}
                    {extra > 0 && <span className="genre-tag genre-tag-extra">+{extra}</span>}
                </div>


                <Link to={`/autores/${author.id}`} className="btn-ver-perfil">Ver Perfil</Link>
            </div>
        </div>
    );
}
