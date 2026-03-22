import "../styles/userProfilePage.css";
import { translateGenre } from "../utils/genreTranslations";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` });
const jsonFetch = (url: string, options?: RequestInit) =>
    fetch(url, { ...options, headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", ...(options?.headers ?? {}) } });

const UserCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>);
const BookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" /></svg>);
const HeartIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#c0392b" stroke="#c0392b" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
const StarSmall = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="#c05621" stroke="#c05621" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const UserPlusIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>);
const UserCheckIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>);
const MessageIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const TrashIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" /></svg>);

interface UserSummaryDTO { id: number; username: string; firstName: string; lastName: string; photoUrl: string; following: boolean; }
interface SocialDTO { followers: UserSummaryDTO[]; following: UserSummaryDTO[]; followersCount: number; followingCount: number; }
interface BookDTO { id: number; title: string; authorName: string; coverUrl: string; }
interface AuthorDTO { id: number; name: string; photoUrl: string; genres: { id: number; name: string }[]; }
interface ProfileDTO { id: number; firstName: string; lastName: string; username: string; photoUrl: string; bio: string; city: string; birthDate: string; preferences: { id: number; name: string }[]; }
interface CommentDTO { id: number; userId: number; username: string; content: string; createdAt: string; }
interface ReviewDTO { id: number; bookId: number; bookTitle: string; userId: number; username: string; rating: number; comment: string; createdAt: string; likes: number; dislikes: number; myReaction: "LIKE" | "DISLIKE" | null; comments: CommentDTO[]; }

type Tab = "livros" | "favoritos" | "comunidade" | "detalhes";
type BookFilter = "lidos" | "quero";

const ReactionBtn = ({ active, color, activeBg, label, count, onClick }: { active: boolean; color: string; activeBg: string; label: string; count: number; onClick: () => void }) => (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, border: `1px solid ${active ? color : "var(--border)"}`, background: active ? activeBg : "transparent", color: active ? color : "var(--text-muted)", cursor: "pointer", fontSize: 13, fontFamily: "'Lato',sans-serif", fontWeight: active ? 600 : 400, transition: "all 0.15s" }}>{label} {count}</button>
);

const BtnDark = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} style={{ width: "100%", padding: "8px 0", background: "#3b2b24", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Lato',sans-serif", transition: "background 0.2s", marginTop: 8 }}
        onMouseEnter={e => (e.currentTarget.style.background = "#2a1e19")}
        onMouseLeave={e => (e.currentTarget.style.background = "#3b2b24")}>
        {children}
    </button>
);

function PersonItem({ person, onClick }: { person: UserSummaryDTO; onClick: () => void }) {
    return (
        <div className="person-item" style={{ cursor: "pointer" }} onClick={onClick}>
            <div className="person-avatar">{person.photoUrl ? <img src={person.photoUrl} alt={person.firstName} /> : <div className="person-avatar-placeholder"><UserCircleIcon /></div>}</div>
            <div className="person-info"><p className="person-name">{person.firstName} {person.lastName}</p><p className="person-username">@{person.username}</p></div>
        </div>
    );
}

export default function UserProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<ProfileDTO | null>(null);
    const [social, setSocial] = useState<SocialDTO | null>(null);
    const [readBooks, setReadBooks] = useState<BookDTO[]>([]);
    const [wantBooks, setWantBooks] = useState<BookDTO[]>([]);
    const [favoriteBooks, setFavoriteBooks] = useState<BookDTO[]>([]);
    const [favoriteAuthors, setFavoriteAuthors] = useState<AuthorDTO[]>([]);
    const [reviews, setReviews] = useState<ReviewDTO[]>([]);
    const [loggedUserId, setLoggedUserId] = useState<number | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("livros");
    const [bookFilter, setBookFilter] = useState<BookFilter>("lidos");
    const [openCommentBox, setOpenCommentBox] = useState<number | null>(null);
    const [commentTexts, setCommentTexts] = useState<Record<number, string>>({});
    const [confirmDeleteComment, setConfirmDeleteComment] = useState<number | null>(null);

    const loadReviews = async () => {
        const res = await jsonFetch(`${API}/reviews/users/${id}`);
        if (res.ok) setReviews(await res.json());
    };

    useEffect(() => {
        if (!id) return;
        const fetchAll = async () => {
            try {
                setLoading(true);
                const meAuthRes = await jsonFetch(`${API}/auth/me`);
                if (meAuthRes.ok) { const me = await meAuthRes.json(); setLoggedUserId(me.id ?? null); }

                const profileRes = await fetch(`${API}/profile/${id}`, { headers: authHeader() });
                if (!profileRes.ok) throw new Error("Perfil não encontrado");
                setProfile(await profileRes.json());

                const socialRes = await fetch(`${API}/social/users/${id}`, { headers: authHeader() });
                if (socialRes.ok) setSocial(await socialRes.json());

                const meRes = await fetch(`${API}/social/me`, { headers: authHeader() });
                if (meRes.ok) { const d: SocialDTO = await meRes.json(); setIsFollowing((d.following ?? []).some(f => f.id === Number(id))); }

                await loadReviews();

                const favRes = await fetch(`${API}/favorites/user/${id}`, { headers: authHeader() });
                if (favRes.ok) { const d = await favRes.json(); setFavoriteBooks(d.favoriteBooks ?? []); setFavoriteAuthors(d.favoriteAuthors ?? []); }

                const jaLiRes = await fetch(`${API}/lists/user/${id}/JA_LI`, { headers: authHeader() });
                if (jaLiRes.ok) { const d = await jaLiRes.json(); setReadBooks(d.books ?? []); }
                const queroRes = await fetch(`${API}/lists/user/${id}/QUERO_LER`, { headers: authHeader() });
                if (queroRes.ok) { const d = await queroRes.json(); setWantBooks(d.books ?? []); }
            } catch (err) { console.error(err); setError("Não foi possível carregar este perfil."); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [id]);

    const handleFollow = async () => {
        if (!id || followLoading) return;
        setFollowLoading(true);
        const was = isFollowing;
        setIsFollowing(!was);
        setSocial(s => s ? { ...s, followersCount: was ? s.followersCount - 1 : s.followersCount + 1 } : s);
        try {
            const res = await fetch(`${API}/social/follow/${id}`, { method: was ? "DELETE" : "POST", headers: authHeader() });
            if (!res.ok) throw new Error();
            const socialRes = await fetch(`${API}/social/users/${id}`, { headers: authHeader() });
            if (socialRes.ok) setSocial(await socialRes.json());
        } catch { setIsFollowing(was); setSocial(s => s ? { ...s, followersCount: was ? s.followersCount + 1 : s.followersCount - 1 } : s); }
        finally { setFollowLoading(false); }
    };

    const handleReaction = async (reviewId: number, type: "LIKE" | "DISLIKE") => {
        try {
            const review = reviews.find(r => r.id === reviewId);
            if (!review) return;
            if (review.myReaction === type) { await jsonFetch(`${API}/reviews/${reviewId}/reactions`, { method: "DELETE" }); }
            else { await jsonFetch(`${API}/reviews/${reviewId}/reactions`, { method: "POST", body: JSON.stringify({ reactionType: type }) }); }
            await loadReviews();
        } catch (err) { console.error(err); }
    };

    const handleSubmitComment = async (reviewId: number) => {
        const text = (commentTexts[reviewId] ?? "").trim();
        if (!text) return;
        try {
            const res = await jsonFetch(`${API}/reviews/${reviewId}/comments`, { method: "POST", body: JSON.stringify({ content: text }) });
            if (!res.ok) return;
            setCommentTexts(prev => ({ ...prev, [reviewId]: "" }));
            setOpenCommentBox(null);
            await loadReviews();
        } catch (err) { console.error(err); }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await jsonFetch(`${API}/reviews/comments/${commentId}`, { method: "DELETE" });
            setConfirmDeleteComment(null);
            await loadReviews();
        } catch (err) { console.error(err); }
    };

    const formatDate = (s: string) => { try { return new Date(s).toLocaleDateString("pt-BR"); } catch { return ""; } };
    const currentBooks = bookFilter === "lidos" ? readBooks : wantBooks;

    if (loading) return (<div className="profile-page"><PageHeader navigate={navigate} /><main className="profile-main"><div className="loading-state"><p>Carregando perfil...</p></div></main></div>);
    if (error || !profile) return (<div className="profile-page"><PageHeader navigate={navigate} /><main className="profile-main"><div className="loading-state"><p>{error ?? "Usuário não encontrado."}</p></div></main></div>);

    return (
        <div className="profile-page">
            <PageHeader navigate={navigate} />
            <main className="profile-main">

                <section className="profile-hero">
                    <div className="profile-hero-inner">
                        <div className="profile-avatar-wrap">
                            {profile.photoUrl ? <img src={profile.photoUrl} alt={profile.firstName} /> : <div className="profile-avatar-placeholder"><UserCircleIcon /></div>}
                        </div>
                        <div className="profile-hero-info">
                            <div className="profile-name-row">
                                <h1 className="profile-name">{profile.firstName} {profile.lastName}</h1>
                                <span className="profile-username">@{profile.username}</span>
                            </div>
                            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                            <div className="profile-stats">
                                <div className="stat-item"><span className="stat-value">{readBooks.length}</span><span className="stat-label">Livros Lidos</span></div>
                                <div className="stat-divider" />
                                <div className="stat-item"><span className="stat-value">{favoriteBooks.length}</span><span className="stat-label">Favoritos</span></div>
                                <div className="stat-divider" />
                                <div className="stat-item"><span className="stat-value">{social?.followersCount ?? 0}</span><span className="stat-label">Seguidores</span></div>
                                <div className="stat-divider" />
                                <div className="stat-item"><span className="stat-value">{social?.followingCount ?? 0}</span><span className="stat-label">Seguindo</span></div>
                            </div>
                            <button onClick={handleFollow} disabled={followLoading}
                                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", background: isFollowing ? "transparent" : "#3b2b24", color: isFollowing ? "#3b2b24" : "#fff", border: "1.5px solid #3b2b24", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: followLoading ? "not-allowed" : "pointer", fontFamily: "'Lato',sans-serif", transition: "all 0.2s", marginTop: 4 }}
                                onMouseEnter={e => { (e.currentTarget.style.background = isFollowing ? "rgba(59,43,36,0.06)" : "#2a1e19"); }}
                                onMouseLeave={e => { (e.currentTarget.style.background = isFollowing ? "transparent" : "#3b2b24"); }}>
                                {isFollowing ? <><UserCheckIcon /> Seguindo</> : <><UserPlusIcon /> Seguir</>}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="tabs-bar">
                    {(["livros", "favoritos", "comunidade", "detalhes"] as Tab[]).map(tab => (
                        <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                            {tab === "livros" ? "Livros" : tab === "favoritos" ? "Favoritos" : tab === "comunidade" ? "Comunidade" : "Detalhes"}
                        </button>
                    ))}
                </div>

                <div className="tab-content" key={activeTab}>

                    {activeTab === "livros" && (
                        <>
                            {reviews.length > 0 && (
                                <div className="activity-card activity-card-full" style={{ marginBottom: 28 }}>
                                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Avaliações</h3>
                                    {reviews.map(review => {
                                        const isOwner = loggedUserId !== null && review.userId === loggedUserId;
                                        return (
                                            <div key={review.id} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                    <div>
                                                        <span style={{ fontWeight: 600, fontSize: 14, cursor: "pointer", color: "var(--brown-mid)" }} onClick={() => navigate(`/livros/${review.bookId}`)}>{review.bookTitle}</span>
                                                        <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: 8 }}>{formatDate(review.createdAt)}</span>
                                                    </div>
                                                    <div style={{ display: "flex", gap: 2 }}>{Array.from({ length: review.rating }, (_, i) => <StarSmall key={i} />)}</div>
                                                </div>
                                                {review.comment && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10, fontStyle: "italic" }}>"{review.comment}"</p>}

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
                                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, fontFamily: "'Lato',sans-serif" }}>
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
                                                                            <span style={{ fontWeight: 700, fontSize: 12, color: "var(--brown-mid)", cursor: "pointer" }} onClick={() => c.userId === loggedUserId ? navigate("/perfil") : navigate(`/usuarios/${c.userId}`)}>@{c.username}</span>
                                                                            <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: 6 }}>{formatDate(c.createdAt)}</span>
                                                                        </div>
                                                                        {isCOwner && <button onClick={() => setConfirmDeleteComment(c.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#c0392b", padding: 2, display: "flex", alignItems: "center" }}><TrashIcon /></button>}
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
                                                        <input type="text" placeholder="Escreva um comentário..."
                                                            value={commentTexts[review.id] ?? ""}
                                                            onChange={e => setCommentTexts(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                            onKeyDown={e => { if (e.key === "Enter") handleSubmitComment(review.id); }}
                                                            style={{ flex: 1, height: 36, lineHeight: "36px", padding: "0 14px", borderRadius: 20, border: "1px solid var(--border)", fontSize: 13, background: "var(--cream-input)", color: "var(--text)", outline: "none", fontFamily: "'Lato',sans-serif", verticalAlign: "middle" }} />
                                                        <button onClick={() => handleSubmitComment(review.id)}
                                                            style={{ height: 36, lineHeight: "36px", padding: "0 16px", borderRadius: 20, border: "none", background: "#3b2b24", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Lato',sans-serif", whiteSpace: "nowrap", flexShrink: 0, verticalAlign: "middle" }}
                                                            onMouseEnter={e => (e.currentTarget.style.background = "#2a1e19")}
                                                            onMouseLeave={e => (e.currentTarget.style.background = "#3b2b24")}>
                                                            Enviar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="books-filter-bar">
                                <h3 className="books-section-title">Biblioteca</h3>
                                <div className="books-filter-btns">
                                    <button className={`btn-filter-book ${bookFilter === "lidos" ? "active" : ""}`} onClick={() => setBookFilter("lidos")}>Lidos ({readBooks.length})</button>
                                    <button className={`btn-filter-book ${bookFilter === "quero" ? "active" : ""}`} onClick={() => setBookFilter("quero")}>Quer Ler ({wantBooks.length})</button>
                                </div>
                            </div>
                            <div className="books-grid">
                                {currentBooks.length === 0 && <p className="empty-state">Nenhum livro aqui ainda.</p>}
                                {currentBooks.map(book => (
                                    <div key={book.id} className="book-card" style={{ display: "flex", flexDirection: "column" }}>
                                        <div className="book-cover">{book.coverUrl ? <img src={book.coverUrl} alt={book.title} /> : <div className="cover-placeholder"><BookIcon /></div>}</div>
                                        <div className="book-card-info" style={{ display: "flex", flexDirection: "column", flex: 1, padding: "10px 12px 14px" }}>
                                            <p className="book-card-title">{book.title}</p>
                                            <p className="book-card-author" style={{ flex: 1 }}>{book.authorName}</p>
                                            <BtnDark onClick={() => navigate(`/livros/${book.id}`)}>Ver Detalhes</BtnDark>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === "favoritos" && (
                        <>
                            <h3 className="books-section-title">Livros Favoritos</h3>
                            <div className="books-grid favorites-grid">
                                {favoriteBooks.length === 0 && <p className="empty-state">Nenhum livro favorito.</p>}
                                {favoriteBooks.map(book => (
                                    <div key={book.id} className="book-card favorite-card" style={{ display: "flex", flexDirection: "column" }}>
                                        <div className="book-cover">
                                            {book.coverUrl ? <img src={book.coverUrl} alt={book.title} /> : <div className="cover-placeholder"><BookIcon /></div>}
                                            <span className="favorite-heart"><HeartIcon /></span>
                                        </div>
                                        <div className="book-card-info" style={{ display: "flex", flexDirection: "column", flex: 1, padding: "10px 12px 14px" }}>
                                            <p className="book-card-title">{book.title}</p>
                                            <p className="book-card-author" style={{ flex: 1 }}>{book.authorName}</p>
                                            <BtnDark onClick={() => navigate(`/livros/${book.id}`)}>Ver Detalhes</BtnDark>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 className="books-section-title" style={{ marginTop: 36 }}>Autores Favoritos</h3>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                                {favoriteAuthors.length === 0 && <p className="empty-state">Nenhum autor favorito.</p>}
                                {favoriteAuthors.map(author => (
                                    <div key={author.id} style={{ background: "var(--cream-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(59,43,36,0.06)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(59,43,36,0.12)"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(59,43,36,0.06)"; }}>
                                        <div style={{ position: "relative", width: "100%", height: 260, overflow: "hidden", background: "var(--cream-bg)" }}>
                                            {author.photoUrl
                                                ? <img src={author.photoUrl} alt={author.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
                                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#e8d4ba,#d4bfa5)" }}><UserCircleIcon /></div>}
                                            <span style={{ position: "absolute", top: 8, right: 8 }}><HeartIcon /></span>
                                        </div>
                                        <div style={{ padding: "10px 14px 14px" }}>
                                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{author.name}</p>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                                                {(author.genres ?? []).slice(0, 2).map(g => (<span key={g.id} style={{ padding: "3px 10px", background: "var(--green)", color: "#fff", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{translateGenre(g.name)}</span>))}
                                            </div>
                                            <BtnDark onClick={() => navigate(`/autores/${author.id}`)}>Ver Detalhes</BtnDark>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === "comunidade" && (
                        <div className="community-grid">
                            <div className="community-card">
                                <h3>Seguidores <span className="community-count">({social?.followersCount ?? 0})</span></h3>
                                <div className="people-list">
                                    {(social?.followers ?? []).length === 0 && <p className="empty-state">Nenhum seguidor ainda.</p>}
                                    {(social?.followers ?? []).map(person => (<PersonItem key={person.id} person={person} onClick={() => navigate(`/usuarios/${person.id}`)} />))}
                                </div>
                            </div>
                            <div className="community-card">
                                <h3>Seguindo <span className="community-count">({social?.followingCount ?? 0})</span></h3>
                                <div className="people-list">
                                    {(social?.following ?? []).length === 0 && <p className="empty-state">Não segue ninguém ainda.</p>}
                                    {(social?.following ?? []).map(person => (<PersonItem key={person.id} person={person} onClick={() => navigate(`/usuarios/${person.id}`)} />))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "detalhes" && (
                        <div className="activity-card activity-card-full">
                            <h3>Informações</h3>
                            <div className="personal-info-list">
                                {profile.city && <div className="personal-info-item"><span className="personal-info-label">Cidade</span><span className="personal-info-value">{profile.city}</span></div>}
                                {profile.birthDate && <div className="personal-info-item"><span className="personal-info-label">Nascimento</span><span className="personal-info-value">{profile.birthDate}</span></div>}
                                {profile.preferences?.length > 0 && (
                                    <div className="personal-info-item">
                                        <span className="personal-info-label">Gêneros favoritos</span>
                                        <div className="personal-info-genres">{profile.preferences.map(g => <span key={g.id} className="genre-tag-small">{translateGenre(g.name)}</span>)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function PageHeader({ navigate }: { navigate: (path: string) => void }) {
    return (
        <header className="litpath-header">
            <div className="header-container">
                <div className="logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
                    </svg><span>LitPath</span>
                </div>
                <nav className="header-nav">
                    <a href="/autores" className="nav-link">Autores</a>
                    <a href="/livros" className="nav-link">Livros</a>
                    <a href="/perfil" className="nav-link"><UserCircleIcon /><span>Perfil</span></a>
                </nav>
            </div>
        </header>
    );
}
