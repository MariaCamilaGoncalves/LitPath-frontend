import "../styles/author.css";
import { translateGenre } from "../utils/genreTranslations";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
);
const UserCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
);
const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
);
const StarOutlineIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24"
        fill={filled ? "#c05621" : "none"} stroke={filled ? "#c05621" : "currentColor"}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const GlobeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

interface GenreDTO { id: number; name: string; }
interface BookDTO {
    id: number; title: string; synopsis: string;
    publicationYear: number; coverUrl: string; authorName: string; genres: GenreDTO[];
}
interface AuthorDTO {
    id: number; name: string; biography: string;
    nationality: string; birthDate: string; photoUrl: string;
    genres: GenreDTO[]; books: BookDTO[];
}
type Tab = "biografia" | "livros" | "detalhes";

const API_URL = import.meta.env.VITE_API_URL;
const authFetch = (url: string, options?: RequestInit) =>
    fetch(url, { ...options, headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", ...(options?.headers ?? {}) } });

const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    try {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
    } catch { return dateStr; }
};

export default function AuthorPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [author, setAuthor] = useState<AuthorDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("biografia");
    const [favorited, setFavorited] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("token")) { navigate("/"); return; }

        const fetchAll = async () => {
            try {

                const res = await authFetch(`${API_URL}/authors/${id}`);
                if (res.status === 401 || res.status === 403) { localStorage.removeItem("token"); navigate("/"); return; }
                if (!res.ok) { setAuthor(null); return; }
                const data: AuthorDTO = await res.json();
                setAuthor(data);

                const favRes = await authFetch(`${API_URL}/favorites`);
                if (favRes.ok) {
                    const favData = await favRes.json();
                    const isFav = (favData.favoriteAuthors ?? []).some((a: { id: number }) => a.id === Number(id));
                    setFavorited(isFav);
                }
            } catch (err) {
                console.error("Erro ao buscar autor:", err);
                setAuthor(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [id, navigate]);

    const handleFavorite = async () => {
        try {
            if (favorited) {
                await authFetch(`${API_URL}/favorites/authors/${id}`, { method: "DELETE" });
                setFavorited(false);
            } else {
                await authFetch(`${API_URL}/favorites/authors/${id}`, { method: "POST" });
                setFavorited(true);
            }
        } catch (err) { console.error("Erro ao favoritar autor:", err); }
    };

    return (
        <div className="author-page">
            <style>{`
                .btn-ver-detalhes {
                    display: block; width: 100%; margin-top: 12px; padding: 10px;
                    background: #3b2b24; color: #fff; border: none; border-radius: 8px;
                    font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 600;
                    text-align: center; cursor: pointer; transition: background 0.2s, transform 0.15s;
                }
                .btn-ver-detalhes:hover { background: #2a1e19; transform: translateY(-1px); }
            `}</style>

            <header className="litpath-header">
                <div className="header-container">
                    <div className="logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
                            <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
                        </svg>
                        <span>LitPath</span>
                    </div>
                    <div className="search-bar" onClick={() => navigate("/pesquisa")} style={{ cursor: "pointer" }}>
                        <SearchIcon />
                        <input type="text" placeholder="Pesquisar autores, livros..." readOnly style={{ cursor: "pointer" }} />
                    </div>
                    <nav className="header-nav">
                        <a href="/autores" className="nav-link">Autores</a>
                        <a href="/livros" className="nav-link">Livros</a>
                        <a href="/perfil" className="nav-link"><UserCircleIcon /><span>Perfil</span></a>
                    </nav>
                </div>
            </header>

            <main className="author-main">
                {loading && <div className="loading-state"><p>Carregando autor...</p></div>}
                {!loading && !author && (
                    <div className="empty-state">
                        <p>Autor não encontrado.</p>
                        <button onClick={() => navigate("/home")}>Voltar</button>
                    </div>
                )}

                {!loading && author && (
                    <>
                        <section className="author-hero">
                            <div className="author-hero-inner">
                                <div className="author-photo-wrap">
                                    {author.photoUrl
                                        ? <img src={author.photoUrl} alt={author.name} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                        : <div className="author-photo-placeholder"><UserCircleIcon /></div>}
                                </div>

                                <div className="author-hero-info">
                                    <h1 className="author-name">{author.name}</h1>
                                    {author.nationality && <p className="author-fullname">{author.nationality}</p>}
                                    <div className="author-genres">
                                        {author.genres?.map(g => <span key={g.id} className="genre-tag">{translateGenre(g.name)}</span>)}
                                    </div>
                                    <div className="author-actions">
                                        <button className={`btn-action ${favorited ? "favorited" : ""}`} onClick={handleFavorite}>
                                            <StarOutlineIcon filled={favorited} />
                                            {favorited ? "Favoritado" : "Favoritar"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="tabs-bar">
                            {(["biografia", "livros", "detalhes"] as Tab[]).map(tab => (
                                <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="tab-content" key={activeTab}>
                            {activeTab === "biografia" && (
                                <div className="bio-card">
                                    <h3>Sobre o Autor</h3>
                                    <p>{author.biography || "Biografia não disponível para este autor."}</p>
                                </div>
                            )}

                            {activeTab === "livros" && (
                                <>
                                    {author.books?.length === 0
                                        ? <p className="empty-message">Nenhum livro cadastrado.</p>
                                        : (
                                            <div className="books-grid">
                                                {author.books?.map(book => (
                                                    <div key={book.id} className="book-card" style={{ display: "flex", flexDirection: "column" }}>
                                                        <div className="book-cover">
                                                            {book.coverUrl
                                                                ? <img src={book.coverUrl} alt={book.title} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                                                : <div className="cover-placeholder"><BookIcon /></div>}
                                                        </div>
                                                        <div className="book-card-info" style={{ display: "flex", flexDirection: "column", flex: 1, padding: "10px 12px 14px" }}>
                                                            <p className="book-card-title">{book.title}</p>
                                                            <p className="book-card-year" style={{ flex: 1 }}>por {author.name}</p>
                                                            <button className="btn-ver-detalhes" onClick={() => navigate(`/livros/${book.id}`)}>
                                                                Ver Detalhes
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                </>
                            )}

                            {activeTab === "detalhes" && (
                                <div className="details-grid">
                                    <div className="details-card">
                                        <h3>Informações Pessoais</h3>
                                        <ul className="details-list">
                                            {author.birthDate && (
                                                <li><CalendarIcon /><div><span className="detail-label">Nascimento</span><span className="detail-value">{formatDate(author.birthDate)}</span></div></li>
                                            )}
                                            {author.nationality && (
                                                <li><GlobeIcon /><div><span className="detail-label">Nacionalidade</span><span className="detail-value">{author.nationality}</span></div></li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="details-card">
                                        <h3>Gêneros Literários</h3>
                                        <ul className="details-list">
                                            {author.genres?.length > 0
                                                ? author.genres.map(g => (
                                                    <li key={g.id}><BookIcon /><div><span className="detail-value">{translateGenre(g.name)}</span></div></li>
                                                ))
                                                : <li><span className="detail-value">Nenhum gênero cadastrado.</span></li>}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
