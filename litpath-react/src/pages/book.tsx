import { Link, useParams, useNavigate } from "react-router-dom";
import "../styles/book.css";
import { translateGenre } from "../utils/genreTranslations";
import { useState, useEffect } from "react";

const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>);
const UserCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>);
const BookIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" /></svg>);
const HeartIcon = ({ filled }: { filled?: boolean }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#e53e3e" : "none"} stroke={filled ? "#e53e3e" : "currentColor"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
const CheckIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>);
const BookmarkIcon = ({ filled }: { filled?: boolean }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#d69e2e" : "none"} stroke={filled ? "#d69e2e" : "currentColor"} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const StarIcon = ({ filled }: { filled?: boolean }) => (<svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#c05621" : "none"} stroke={filled ? "#c05621" : "currentColor"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const StarSmall = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="#c05621" stroke="#c05621" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const MessageIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const TrashIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>);

interface GenreDTO { id: number; name: string; }
interface AuthorDTO { id: number; name: string; biography: string; photoUrl: string; }
interface BookDTO { id: number; title: string; synopsis: string; publicationYear: number; coverUrl: string; authorName: string; authorId: number; author: AuthorDTO; genres: GenreDTO[]; }
interface CommentDTO { id: number; userId: number; username: string; content: string; createdAt: string; }
interface ReviewDTO { id: number; bookId: number; bookTitle: string; userId: number; username: string; rating: number; comment: string; createdAt: string; likes: number; dislikes: number; myReaction: "LIKE" | "DISLIKE" | null; comments: CommentDTO[]; }
type Tab = "sinopse" | "detalhes" | "avaliacoes" | "autor";

const API_URL = import.meta.env.VITE_API_URL;
const authFetch = (url: string, options?: RequestInit) =>
    fetch(url, { ...options, headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", ...(options?.headers ?? {}) } });

const ReactionBtn = ({ active, color, activeBg, label, count, onClick }: { active: boolean; color: string; activeBg: string; label: string; count: number; onClick: () => void; }) => (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, border: `1px solid ${active ? color : "var(--border)"}`, background: active ? activeBg : "transparent", color: active ? color : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontFamily: "'Lato', sans-serif", fontWeight: active ? 600 : 400, transition: "all 0.15s" }}>{label} {count}</button>
);

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
    const [loggedUserId, setLoggedUserId] = useState<number | null>(null);
    const [reviews, setReviews] = useState<ReviewDTO[]>([]);
    const [avgRating, setAvgRating] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalStars, setModalStars] = useState(0);
    const [modalHover, setModalHover] = useState(0);
    const [modalText, setModalText] = useState("");
    const [openCommentBox, setOpenCommentBox] = useState<number | null>(null);
    const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
    const [confirmDeleteReview, setConfirmDeleteReview] = useState<number | null>(null);
    const [confirmDeleteComment, setConfirmDeleteComment] = useState<number | null>(null);

    const loadReviews = async () => {
        const [rRes, avgRes] = await Promise.all([
            authFetch(`${API_URL}/reviews/books/${id}`),
            authFetch(`${API_URL}/reviews/books/${id}/average`),
        ]);
        if (rRes.ok) setReviews(await rRes.json());
        if (avgRes.ok) setAvgRating(await avgRes.json());
    };

    useEffect(() => {
        if (!localStorage.getItem("token")) { navigate("/"); return; }
        const fetchAll = async () => {
            try {
                const meRes = await authFetch(`${API_URL}/auth/me`);
                if (meRes.ok) { const me = await meRes.json(); setLoggedUserId(me.id ?? null); }

                const res = await authFetch(`${API_URL}/books/${id}`);
                if (res.status === 401 || res.status === 403) { localStorage.removeItem("token"); navigate("/"); return; }
                if (!res.ok) { setBook(null); return; }
                const data: BookDTO = await res.json();
                if (!data.authorId && data.authorName) {
                    try { const ar = await authFetch(`${API_URL}/authors`); const authors: AuthorDTO[] = await ar.json(); const found = authors.find(a => a.name === data.authorName); if (found) { data.authorId = found.id; data.author = found; } } catch { /* ignora */ }
                }
                setBook(data);

                const [favRes, jaLiRes, queroRes, reviewsMeRes] = await Promise.all([
                    authFetch(`${API_URL}/favorites`), authFetch(`${API_URL}/lists/JA_LI`),
                    authFetch(`${API_URL}/lists/QUERO_LER`), authFetch(`${API_URL}/reviews/me`),
                ]);
                if (favRes.ok) { const f = await favRes.json(); setFavorited((f.favoriteBooks ?? []).some((b: { id: number }) => b.id === Number(id))); }
                if (jaLiRes.ok) { const d = await jaLiRes.json(); setAlreadyRead((d.books ?? []).some((b: { id: number }) => b.id === Number(id))); }
                if (queroRes.ok) { const d = await queroRes.json(); setWantRead((d.books ?? []).some((b: { id: number }) => b.id === Number(id))); }
                if (reviewsMeRes.ok) { const my = await reviewsMeRes.json(); setRated(my.some((r: { bookId: number }) => r.bookId === Number(id))); }
                await loadReviews();
            } catch (err) { console.error(err); setBook(null); } finally { setLoading(false); }
        };
        fetchAll();
    }, [id, navigate]);

    const handleFavorite = async () => { if (!book) return; if (favorited) { await authFetch(`${API_URL}/favorites/books/${book.id}`, { method: "DELETE" }); setFavorited(false); } else { await authFetch(`${API_URL}/favorites/books/${book.id}`, { method: "POST" }); setFavorited(true); } };
    const handleAlreadyRead = async () => { if (!book) return; if (alreadyRead) { await authFetch(`${API_URL}/lists/JA_LI/books/${book.id}`, { method: "DELETE" }); setAlreadyRead(false); } else { await authFetch(`${API_URL}/lists/JA_LI/books/${book.id}`, { method: "POST" }); setAlreadyRead(true); if (wantRead) { await authFetch(`${API_URL}/lists/QUERO_LER/books/${book.id}`, { method: "DELETE" }); setWantRead(false); } } };
    const handleWantRead = async () => { if (!book) return; if (wantRead) { await authFetch(`${API_URL}/lists/QUERO_LER/books/${book.id}`, { method: "DELETE" }); setWantRead(false); } else { await authFetch(`${API_URL}/lists/QUERO_LER/books/${book.id}`, { method: "POST" }); setWantRead(true); if (alreadyRead) { await authFetch(`${API_URL}/lists/JA_LI/books/${book.id}`, { method: "DELETE" }); setAlreadyRead(false); } } };
    const handleSubmitReview = async () => { if (!book || modalStars === 0) return; await authFetch(`${API_URL}/reviews/books/${book.id}`, { method: "POST", body: JSON.stringify({ rating: modalStars, comment: modalText || null }) }); setRated(true); setModalOpen(false); setModalStars(0); setModalText(""); await loadReviews(); };
    const handleReaction = async (reviewId: number, type: "LIKE" | "DISLIKE") => { try { const review = reviews.find(r => r.id === reviewId); if (!review) return; if (review.myReaction === type) { await authFetch(`${API_URL}/reviews/${reviewId}/reactions`, { method: "DELETE" }); } else { await authFetch(`${API_URL}/reviews/${reviewId}/reactions`, { method: "POST", body: JSON.stringify({ reactionType: type }) }); } await loadReviews(); } catch (err) { console.error(err); } };
    const handleDeleteReview = async (reviewId: number) => { try { await authFetch(`${API_URL}/reviews/${reviewId}`, { method: "DELETE" }); setRated(false); setConfirmDeleteReview(null); await loadReviews(); } catch (err) { console.error(err); } };
    const handleDeleteComment = async (commentId: number) => { try { await authFetch(`${API_URL}/reviews/comments/${commentId}`, { method: "DELETE" }); setConfirmDeleteComment(null); await loadReviews(); } catch (err) { console.error(err); } };
    const handleSubmitComment = async (reviewId: number) => { try { const text = (commentTexts[reviewId] ?? "").trim(); if (!text) return; const res = await authFetch(`${API_URL}/reviews/${reviewId}/comments`, { method: "POST", body: JSON.stringify({ content: text }) }); if (!res.ok) return; setCommentTexts(prev => ({ ...prev, [reviewId]: "" })); setOpenCommentBox(null); await loadReviews(); } catch (err) { console.error(err); } };

    const formatDate = (s: string) => { try { return new Date(s).toLocaleDateString("pt-BR"); } catch { return ""; } };

    const navigateToProfile = (userId: number) => {
        if (loggedUserId !== null && userId === loggedUserId) {
            navigate("/perfil");
        } else {
            navigate(`/usuarios/${userId}`);
        }
    };

    return (
        <div className="book-page">
            <header className="litpath-header">
                <div className="header-container">
                    <div className="logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}><BookIcon /><span>LitPath</span></div>
                    <div className="search-bar" onClick={() => navigate("/pesquisa")} style={{ cursor: "pointer" }}>
                        <SearchIcon />
                        <input type="text" placeholder="Pesquisar autores, livros, leitores..." readOnly style={{ cursor: "pointer" }} />
                    </div>
                    <nav className="header-nav">
                        <Link to="/autores" className="nav-link">Autores</Link>
                        <Link to="/livros" className="nav-link">Livros</Link>
                        <Link to="/perfil" className="nav-link"><UserCircleIcon /><span>Perfil</span></Link>
                    </nav>
                </div>
            </header>

            <main className="book-main">
                {loading && <div className="loading-state"><p>Carregando...</p></div>}
                {!loading && !book && <div className="empty-state"><p>Livro não encontrado.</p><button onClick={() => navigate("/livros")}>Voltar</button></div>}

                {!loading && book && (
                    <>
                        <section className="book-hero">
                            <div className="book-cover-wrap">
                                {book.coverUrl ? <img src={book.coverUrl} alt={book.title} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div className="cover-placeholder"><BookIcon /></div>}
                            </div>
                            <div className="book-hero-info">
                                <h1 className="book-title">{book.title}</h1>
                                <p className="book-author">por <a onClick={() => navigate(`/autores/${book.authorId}`)} style={{ cursor: "pointer" }}>{book.authorName}</a></p>
                                <div className="book-tags">
                                    {book.genres?.map(g => <span key={g.id} className="tag-genre">{translateGenre(g.name)}</span>)}
                                    {book.publicationYear && <span className="tag-info">{book.publicationYear}</span>}
                                </div>
                                {book.synopsis && <p className="book-description">{book.synopsis.slice(0, 220)}...</p>}
                                <div className="book-actions">
                                    <button className={`btn-secondary ${favorited ? "favorited" : ""}`} onClick={handleFavorite}><HeartIcon filled={favorited} />{favorited ? "Favoritado" : "Favoritar"}</button>
                                    <button className={`btn-secondary ${alreadyRead ? "active-read" : ""}`} onClick={handleAlreadyRead}><CheckIcon />{alreadyRead ? "Lido ✓" : "Já li"}</button>
                                    <button className={`btn-secondary ${wantRead ? "active-want" : ""}`} onClick={handleWantRead}><BookmarkIcon filled={wantRead} />{wantRead ? "Na lista" : "Quero ler"}</button>
                                    <button className={`btn-secondary ${rated ? "active-rated" : ""}`} onClick={() => setModalOpen(true)}><StarIcon filled={rated} />{rated ? "Já avaliado" : "Avaliar"}</button>
                                </div>
                            </div>
                        </section>

                        <div className="tabs-bar">
                            {(["sinopse", "detalhes", "avaliacoes", "autor"] as Tab[]).map(tab => (
                                <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                                    {tab === "avaliacoes" ? "Avaliações" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="tab-content" key={activeTab}>
                            {activeTab === "sinopse" && (
                                <div className="synopsis-card">
                                    <h3>Sinopse</h3>
                                    <p>{book.synopsis || "Sinopse não disponível."}</p>
                                    {book.genres?.length > 0 && <div className="themes-section"><h4>Gêneros</h4><div className="themes-tags">{book.genres.map(g => <span key={g.id} className="tag-genre">{translateGenre(g.name)}</span>)}</div></div>}
                                </div>
                            )}
                            {activeTab === "detalhes" && (
                                <div className="details-grid">
                                    <div className="details-card">
                                        <h3>Informações da Publicação</h3>
                                        <table className="details-table"><tbody>
                                            {book.publicationYear && <tr><td>Ano:</td><td>{book.publicationYear}</td></tr>}
                                            {book.genres?.length > 0 && <tr><td>Gênero:</td><td>{book.genres.map(g => g.name).join(", ")}</td></tr>}
                                            <tr><td>Autor:</td><td>{book.authorName}</td></tr>
                                        </tbody></table>
                                    </div>
                                </div>
                            )}

                            {activeTab === "avaliacoes" && (
                                <div className="reviews-layout">
                                    <div className="rating-summary-card">
                                        <h3>Avaliações dos Leitores</h3>
                                        <div className="big-score">{avgRating !== null ? avgRating.toFixed(1) : "—"}</div>
                                        {avgRating !== null && <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 8 }}>{Array.from({ length: 5 }, (_, i) => <StarSmall key={i} />)}</div>}
                                        <p className="summary-count">{reviews.length === 0 ? "Nenhuma avaliação ainda" : `${reviews.length} avaliação${reviews.length !== 1 ? "ões" : ""}`}</p>
                                    </div>
                                    <div className="reviews-list">
                                        {reviews.length === 0 ? (
                                            <div className="review-card"><p style={{ color: "var(--text-muted)", fontSize: 14 }}>Ainda não há avaliações. Seja o primeiro a avaliar!</p></div>
                                        ) : (
                                            reviews.map(review => {
                                                const isOwner = loggedUserId !== null && review.userId === loggedUserId;
                                                return (
                                                    <div key={review.id} className="review-card">
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                                            <div>
                                                                <span
                                                                    style={{ fontWeight: 600, fontSize: 14, cursor: "pointer", color: "var(--brown-mid)" }}
                                                                    onClick={() => navigateToProfile(review.userId)}>
                                                                    @{review.username}
                                                                </span>
                                                                <span style={{ color: "var(--text-muted)", fontSize: 12, marginLeft: 8 }}>{formatDate(review.createdAt)}</span>
                                                                {isOwner && <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-subtle)", fontStyle: "italic" }}>sua avaliação</span>}
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                <div style={{ display: "flex", gap: 2 }}>{Array.from({ length: review.rating }, (_, i) => <StarSmall key={i} />)}</div>
                                                                {isOwner && (
                                                                    <button onClick={() => setConfirmDeleteReview(review.id)} title="Excluir avaliação"
                                                                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#c0392b", padding: 4, display: "flex", alignItems: "center" }}>
                                                                        <TrashIcon />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {review.comment && <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 10px 0", lineHeight: 1.5 }}>{review.comment}</p>}

                                                        {confirmDeleteReview === review.id && (
                                                            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                                                <span style={{ fontSize: 13, color: "#7f1d1d" }}>Tem certeza que deseja excluir esta avaliação?</span>
                                                                <div style={{ display: "flex", gap: 8 }}>
                                                                    <button onClick={() => setConfirmDeleteReview(null)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #fca5a5", background: "transparent", cursor: "pointer", fontSize: 12, color: "#7f1d1d" }}>Cancelar</button>
                                                                    <button onClick={() => handleDeleteReview(review.id)} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#c0392b", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Excluir</button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
                                                            {!isOwner ? (
                                                                <>
                                                                    <ReactionBtn active={review.myReaction === "LIKE"} color="#2e7d32" activeBg="#e8f5e9" label="👍" count={review.likes} onClick={() => handleReaction(review.id, "LIKE")} />
                                                                    <ReactionBtn active={review.myReaction === "DISLIKE"} color="#c2185b" activeBg="#fce4ec" label="👎" count={review.dislikes} onClick={() => handleReaction(review.id, "DISLIKE")} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span style={{ fontSize: 13, color: "var(--text-muted)", padding: "5px 12px", border: "1px solid var(--border)", borderRadius: 20 }}>👍 {review.likes}</span>
                                                                    <span style={{ fontSize: 13, color: "var(--text-muted)", padding: "5px 12px", border: "1px solid var(--border)", borderRadius: 20 }}>👎 {review.dislikes}</span>
                                                                </>
                                                            )}
                                                            <button onClick={() => setOpenCommentBox(openCommentBox === review.id ? null : review.id)}
                                                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, fontFamily: "'Lato', sans-serif" }}>
                                                                <MessageIcon /> Comentar{(review.comments?.length ?? 0) > 0 ? ` (${review.comments.length})` : ""}
                                                            </button>
                                                        </div>

                                                        {(review.comments?.length ?? 0) > 0 && (
                                                            <div style={{ marginTop: 12, paddingLeft: 14, borderLeft: "2px solid var(--border)" }}>
                                                                {review.comments.map(c => {
                                                                    const isCOwner = loggedUserId !== null && c.userId === loggedUserId;
                                                                    return (
                                                                        <div key={c.id} style={{ marginBottom: 10 }}>
                                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                                <div>
                                                                                    <span
                                                                                        style={{ fontWeight: 700, fontSize: 12, color: "var(--brown-mid)", cursor: "pointer" }}
                                                                                        onClick={() => navigateToProfile(c.userId)}>
                                                                                        @{c.username}
                                                                                    </span>
                                                                                    <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: 6 }}>{formatDate(c.createdAt)}</span>
                                                                                </div>
                                                                                {isCOwner && (
                                                                                    <button onClick={() => setConfirmDeleteComment(c.id)} title="Excluir comentário"
                                                                                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#c0392b", padding: 2, display: "flex", alignItems: "center" }}>
                                                                                        <TrashIcon />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            {confirmDeleteComment === c.id && (
                                                                                <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 12px", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                                                                    <span style={{ fontSize: 12, color: "#7f1d1d" }}>Excluir este comentário?</span>
                                                                                    <div style={{ display: "flex", gap: 6 }}>
                                                                                        <button onClick={() => setConfirmDeleteComment(null)} style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "transparent", cursor: "pointer", fontSize: 11, color: "#7f1d1d" }}>Cancelar</button>
                                                                                        <button onClick={() => handleDeleteComment(c.id)} style={{ padding: "3px 10px", borderRadius: 6, border: "none", background: "#c0392b", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Excluir</button>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "3px 0 0 0", lineHeight: 1.5 }}>{c.content}</p>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {openCommentBox === review.id && (
                                                            <div style={{ marginTop: 10, width: "100%", display: "flex", flexDirection: "row", gap: 8 }}>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Escreva um comentário..."
                                                                    value={commentTexts[review.id] ?? ""}
                                                                    onChange={e => setCommentTexts(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                                    onKeyDown={e => { if (e.key === "Enter") handleSubmitComment(review.id); }}
                                                                    style={{ flex: 1, height: 36, lineHeight: "36px", padding: "0 14px", borderRadius: 20, border: "1px solid var(--border)", fontSize: 13, background: "var(--cream-input)", color: "var(--text)", outline: "none", fontFamily: "'Lato', sans-serif", verticalAlign: "middle" }}
                                                                />
                                                                <button
                                                                    onClick={() => handleSubmitComment(review.id)}
                                                                    style={{ height: 36, lineHeight: "36px", padding: "0 16px", borderRadius: 20, border: "none", background: "#3b2b24", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Lato', sans-serif", whiteSpace: "nowrap", flexShrink: 0, verticalAlign: "middle" }}
                                                                    onMouseEnter={e => (e.currentTarget.style.background = "#2a1e19")}
                                                                    onMouseLeave={e => (e.currentTarget.style.background = "#3b2b24")}>
                                                                    Enviar
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === "autor" && (
                                <div className="author-card">
                                    <h3>Sobre o Autor</h3>
                                    <div className="author-card-inner">
                                        <div className="author-avatar">{book.author?.photoUrl ? <img src={book.author.photoUrl} alt={book.authorName} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div className="author-avatar-placeholder"><UserCircleIcon /></div>}</div>
                                        <div>
                                            <p className="author-card-name">{book.authorName}</p>
                                            <p className="author-card-bio">{book.author?.biography ? book.author.biography.slice(0, 200) + "..." : "Biografia não disponível."}</p>
                                            <button className="btn-primary" style={{ display: "inline-flex", width: "auto", padding: "8px 16px", fontSize: "13px", marginTop: "12px" }} onClick={() => navigate(`/autores/${book.authorId}`)}>
                                                <UserCircleIcon /> Ver Perfil Completo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {modalOpen && book && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Avaliar "{book.title}"</h3>
                        <div className="modal-stars">{Array.from({ length: 5 }, (_, i) => (<button key={i} className={`modal-star ${i < (modalHover || modalStars) ? "selected" : ""}`} onMouseEnter={() => setModalHover(i + 1)} onMouseLeave={() => setModalHover(0)} onClick={() => setModalStars(i + 1)}>★</button>))}</div>
                        <label>Comentário (opcional)</label>
                        <textarea placeholder="Escreva sua opinião sobre o livro..." value={modalText} onChange={e => setModalText(e.target.value)} />
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleSubmitReview} disabled={modalStars === 0}>Publicar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}