import { Link, useParams, useNavigate } from "react-router-dom";
import "../styles/book.css";
import { translateGenre } from "../utils/genreTranslations";
import { useState, useEffect } from "react";


// ── Icons ────────────────────────────────────────────────────────────────────
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
);
const HeartIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#e53e3e" : "none"} stroke={filled ? "#e53e3e" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);
const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#d69e2e" : "none"} stroke={filled ? "#d69e2e" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);
const StarIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#c05621" : "none"} stroke={filled ? "#c05621" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);


// ── Types ─────────────────────────────────────────────────────────────────────
interface GenreDTO {
    id: number;
    name: string;
}


interface AuthorDTO {
    id: number;
    name: string;
    biography: string;
    photoUrl: string;
}


interface BookDTO {
    id: number;
    title: string;
    synopsis: string;
    publicationYear: number;
    coverUrl: string;
    authorName: string;
    authorId: number;
    author: AuthorDTO;
    genres: GenreDTO[];
}


type Tab = "sinopse" | "detalhes" | "avaliacoes" | "autor";


const API_URL = "http://localhost:8080";


const authFetch = (url: string) =>
    fetch(url, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
        },
    });

// ── Component ─────────────────────────────────────────────────────────────────
export default function Book() {
    const { id } = useParams();
    const navigate = useNavigate();


    const [book, setBook] = useState<BookDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("sinopse");
    const [favorited, setFavorited] = useState(false);
    const [alreadyRead, setAlreadyRead] = useState(false);
    const [wantRead, setWantRead] = useState(false);
    const [rated, setRated] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalStars, setModalStars] = useState(0);
    const [modalHover, setModalHover] = useState(0);
    const [modalText, setModalText] = useState("");


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }


        const fetchBook = async () => {
            try {
                const res = await authFetch(`${API_URL}/books/${id}`);


                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/");
                    return;
                }


                if (!res.ok) {
                    setBook(null);
                    return;
                }


                const data: BookDTO = await res.json();


                // Se authorId não veio no DTO, busca pelo nome nos autores
                if (!data.authorId && data.authorName) {
                    try {
                        const authorsRes = await authFetch(`${API_URL}/authors`);
                        const authors: AuthorDTO[] = await authorsRes.json();
                        const found = authors.find(a => a.name === data.authorName);
                        if (found) {
                            data.authorId = found.id;
                            data.author = found;
                        }
                    } catch {
                        //
                    }
                }


                setBook(data);
            } catch (err) {
                console.error("Erro ao buscar livro:", err);
                setBook(null);
            } finally {
                setLoading(false);
            }
        };


        fetchBook();
    }, [id, navigate]);


    const handleSubmitReview = () => {
        setRated(true);
        setModalOpen(false);
        setModalStars(0);
        setModalText("");
    };


    return (
        <div className="book-page">
            {/* Header */}
            <header className="litpath-header">
                <div className="header-container">
                    <div className="logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
                        <BookIcon />
                        <span>LitPath</span>
                    </div>
                    <div className="search-bar">
                        <SearchIcon />
                        <input type="text" placeholder="Pesquisar autores, livros..." />
                    </div>
                    <nav className="header-nav">
                        <Link to="/autores" className="nav-link">Autores</Link>
                        <Link to="/livros" className="nav-link">Livros</Link>
                        <Link to="/perfil" className="nav-link">
                            <UserCircleIcon /><span>Perfil</span>
                        </Link>
                    </nav>
                </div>
            </header>


            <main className="book-main">
                {loading && <div className="loading-state"><p>Carregando...</p></div>}
                {!loading && !book && (
                    <div className="empty-state">
                        <p>Livro não encontrado.</p>
                        <button onClick={() => navigate("/livros")}>Voltar</button>
                    </div>
                )}


                {!loading && book && (
                    <>
                        {/* Hero */}
                        <section className="book-hero">
                            <div className="book-cover-wrap">
                                {book.coverUrl ? (
                                    <img
                                        src={book.coverUrl}
                                        alt={book.title}
                                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                ) : (
                                    <div className="cover-placeholder"><BookIcon /></div>
                                )}
                            </div>


                            <div className="book-hero-info">
                                <h1 className="book-title">{book.title}</h1>
                                <p className="book-author">
                                    por{" "}
                                    <a onClick={() => navigate(`/autores/${book.authorId}`)}
                                        style={{ cursor: "pointer" }}>
                                        {book.authorName}
                                    </a>
                                </p>


                                <div className="book-tags">
                                    {book.genres?.map(g => (
                                        <span key={g.id} className="tag-genre">{translateGenre(g.name)}</span>
                                    ))}
                                    {book.publicationYear && (
                                        <span className="tag-info">{book.publicationYear}</span>
                                    )}
                                </div>


                                {book.synopsis && (
                                    <p className="book-description">{book.synopsis.slice(0, 220)}...</p>
                                )}


                                <div className="book-actions">
                                    <button
                                        className={`btn-secondary ${favorited ? "favorited" : ""}`}
                                        onClick={() => setFavorited(f => !f)}
                                    >
                                        <HeartIcon filled={favorited} />
                                        {favorited ? "Favoritado" : "Favoritar"}
                                    </button>


                                    <button
                                        className={`btn-secondary ${alreadyRead ? "active-read" : ""}`}
                                        onClick={() => { setAlreadyRead(r => !r); if (wantRead) setWantRead(false); }}
                                    >
                                        <CheckIcon />
                                        Já li
                                    </button>


                                    <button
                                        className={`btn-secondary ${wantRead ? "active-want" : ""}`}
                                        onClick={() => { setWantRead(r => !r); if (alreadyRead) setAlreadyRead(false); }}
                                    >
                                        <BookmarkIcon filled={wantRead} />
                                        {wantRead ? "Na lista" : "Quero ler"}
                                    </button>


                                    <button
                                        className={`btn-secondary ${rated ? "active-rated" : ""}`}
                                        onClick={() => setModalOpen(true)}
                                    >
                                        <StarIcon filled={rated} />
                                        {rated ? "Já avaliado" : "Avaliar"}
                                    </button>
                                </div>
                            </div>
                        </section>


                        {/* Tabs */}
                        <div className="tabs-bar">
                            {(["sinopse", "detalhes", "avaliacoes", "autor"] as Tab[]).map(tab => (
                                <button
                                    key={tab}
                                    className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === "avaliacoes" ? "Avaliações" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>


                        {/* Tab Content */}
                        <div className="tab-content" key={activeTab}>


                            {/* Sinopse */}
                            {activeTab === "sinopse" && (
                                <div className="synopsis-card">
                                    <h3>Sinopse</h3>
                                    <p>{book.synopsis || "Sinopse não disponível."}</p>
                                    {book.genres?.length > 0 && (
                                        <div className="themes-section">
                                            <h4>Gêneros</h4>
                                            <div className="themes-tags">
                                                {book.genres.map(g => (
                                                    <span key={g.id} className="tag-genre">{translateGenre(g.name)}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}


                            {/* Detalhes */}
                            {activeTab === "detalhes" && (
                                <div className="details-grid">
                                    <div className="details-card">
                                        <h3>Informações da Publicação</h3>
                                        <table className="details-table">
                                            <tbody>
                                                {book.publicationYear && (
                                                    <tr><td>Ano de Publicação:</td><td>{book.publicationYear}</td></tr>
                                                )}
                                                {book.genres?.length > 0 && (
                                                    <tr><td>Gênero:</td><td>{book.genres.map(g => g.name).join(", ")}</td></tr>
                                                )}
                                                <tr><td>Autor:</td><td>{book.authorName}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}


                            {/* Avaliações */}
                            {activeTab === "avaliacoes" && (
                                <div className="reviews-layout">
                                    <div className="rating-summary-card">
                                        <h3>Avaliações dos Leitores</h3>
                                        <div className="big-score">—</div>
                                        <p className="summary-count">Nenhuma avaliação ainda</p>
                                    </div>
                                    <div className="reviews-list">
                                        <div className="review-card">
                                            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                                                Ainda não há avaliações para este livro. Seja o primeiro a avaliar!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* Autor */}
                            {activeTab === "autor" && (
                                <div className="author-card">
                                    <h3>Sobre o Autor</h3>
                                    <div className="author-card-inner">
                                        <div className="author-avatar">
                                            {book.author?.photoUrl ? (
                                                <img
                                                    src={book.author.photoUrl}
                                                    alt={book.authorName}
                                                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                            ) : (
                                                <div className="author-avatar-placeholder">
                                                    <UserCircleIcon />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="author-card-name">{book.authorName}</p>
                                            <p className="author-card-bio">
                                                {book.author?.biography
                                                    ? book.author.biography.slice(0, 200) + "..."
                                                    : "Biografia não disponível."}
                                            </p>
                                            <button
                                                className="btn-primary"
                                                style={{ display: "inline-flex", width: "auto", padding: "8px 16px", fontSize: "13px", marginTop: "12px", alignSelf: "flex-start" }}
                                                onClick={() => navigate(`/autores/${book.authorId}`)}
                                            >
                                                <UserCircleIcon />
                                                Ver Perfil Completo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>


            {/* Modal de Avaliação */}
            {modalOpen && book && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Avaliar "{book.title}"</h3>
                        <div className="modal-stars">
                            {Array.from({ length: 5 }, (_, i) => (
                                <button
                                    key={i}
                                    className={`modal-star ${i < (modalHover || modalStars) ? "selected" : ""}`}
                                    onMouseEnter={() => setModalHover(i + 1)}
                                    onMouseLeave={() => setModalHover(0)}
                                    onClick={() => setModalStars(i + 1)}
                                >★</button>
                            ))}
                        </div>
                        <label>Comentário (opcional)</label>
                        <textarea
                            placeholder="Escreva sua opinião sobre o livro..."
                            value={modalText}
                            onChange={e => setModalText(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleSubmitReview} disabled={modalStars === 0}>
                                Publicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
