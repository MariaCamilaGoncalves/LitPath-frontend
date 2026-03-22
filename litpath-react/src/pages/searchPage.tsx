import "../styles/searchPage.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` });

const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>);
const UserCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>);
const BookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" /></svg>);
const AuthorIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const UsersIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);

interface BookResult {
    id: number; title: string; authorName: string; coverUrl: string;
    publicationYear?: number; genres?: { id: number; name: string }[];
}
interface AuthorResult {
    id: number; name: string; photoUrl: string;
    genres?: { id: number; name: string }[]; books?: { id: number }[];
}
interface ReaderResult {
    id: number; firstName: string; lastName: string;
    username: string; photoUrl: string; following: boolean;
}

type Tab = "livros" | "autores" | "leitores";

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export default function SearchPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("q") ?? "");
    const [activeTab, setActiveTab] = useState<Tab>("livros");
    const [loading, setLoading] = useState(false);

    const [books, setBooks] = useState<BookResult[]>([]);
    const [authors, setAuthors] = useState<AuthorResult[]>([]);
    const [readers, setReaders] = useState<ReaderResult[]>([]);

    const debouncedQuery = useDebounce(query, 350);

    const search = useCallback(async (q: string) => {
        if (!q.trim()) {
            setBooks([]); setAuthors([]); setReaders([]);
            return;
        }
        setLoading(true);
        try {
            const encoded = encodeURIComponent(q.trim());

            const [booksRes, authorsRes, readersRes] = await Promise.all([
                fetch(`${API}/books/search?title=${encoded}`, { headers: authHeader() }),
                fetch(`${API}/authors/search?name=${encoded}`, { headers: authHeader() }),
                fetch(`${API}/social/search?name=${encoded}`, { headers: authHeader() }),
            ]);

            if (booksRes.ok) setBooks(await booksRes.json());
            else setBooks([]);

            if (authorsRes.ok) setAuthors(await authorsRes.json());
            else setAuthors([]);

            if (readersRes.ok) setReaders(await readersRes.json());
            else setReaders([]);

        } catch (err) {
            console.error("Erro na busca:", err);
            setBooks([]); setAuthors([]); setReaders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        search(debouncedQuery);
        if (debouncedQuery.trim()) {
            setSearchParams({ q: debouncedQuery }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    }, [debouncedQuery, search, setSearchParams]);

    const totalResults = books.length + authors.length + readers.length;
    const tabCounts = { livros: books.length, autores: authors.length, leitores: readers.length };

    return (
        <div className="search-page">
            <header className="litpath-header">
                <div className="header-container">
                    <div className="logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
                            <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
                        </svg>
                        <span>LitPath</span>
                    </div>
                    <div className="search-bar">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Pesquisar livros, autores, leitores..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <nav className="header-nav">
                        <a href="/autores" className="nav-link">Autores</a>
                        <a href="/livros" className="nav-link">Livros</a>
                        <a href="/perfil" className="nav-link"><UserCircleIcon /><span>Perfil</span></a>
                    </nav>
                </div>
            </header>

            <main className="search-main">

                {!query && (
                    <div className="search-empty">
                        <div className="search-empty-icon">🔍</div>
                        <h2 className="search-empty-title">O que você está procurando?</h2>
                        <p className="search-empty-subtitle">Digite para pesquisar livros, autores ou outros leitores</p>
                    </div>
                )}

                {query && (
                    <>
                        <div className="search-results-header">
                            <p className="search-query-label">
                                {loading
                                    ? "Buscando..."
                                    : <>{totalResults} resultado{totalResults !== 1 ? "s" : ""} para <strong>"{query}"</strong></>}
                            </p>
                        </div>

                        <div className="search-tabs">
                            {(["livros", "autores", "leitores"] as Tab[]).map(tab => (
                                <button
                                    key={tab}
                                    className={`search-tab ${activeTab === tab ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab)}>
                                    {tab === "livros" && <BookIcon />}
                                    {tab === "autores" && <AuthorIcon />}
                                    {tab === "leitores" && <UsersIcon />}
                                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                                    <span className="search-tab-count">{tabCounts[tab]}</span>
                                </button>
                            ))}
                        </div>

                        <div className="search-results" key={activeTab}>

                            {activeTab === "livros" && (
                                loading ? <LoadingState /> :
                                    books.length === 0 ? <EmptyResults label="livros" /> :
                                        <div className="results-grid">
                                            {books.map(book => (
                                                <div key={book.id} className="result-book-card" onClick={() => navigate(`/livros/${book.id}`)}>
                                                    <div className="result-book-cover">
                                                        {book.coverUrl
                                                            ? <img src={book.coverUrl} alt={book.title} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                                            : <div className="result-cover-placeholder"><BookIcon /></div>}
                                                    </div>
                                                    <div className="result-book-info">
                                                        <p className="result-book-title">{book.title}</p>
                                                        <p className="result-book-author">{book.authorName}</p>
                                                        <div className="result-book-meta">
                                                            {book.publicationYear && <span className="result-year">{book.publicationYear}</span>}
                                                            {(book.genres ?? []).slice(0, 1).map(g => (
                                                                <span key={g.id} className="result-genre-tag">{g.name}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                            )}

                            {activeTab === "autores" && (
                                loading ? <LoadingState /> :
                                    authors.length === 0 ? <EmptyResults label="autores" /> :
                                        <div className="results-grid">
                                            {authors.map(author => (
                                                <div key={author.id} className="result-author-card" onClick={() => navigate(`/autores/${author.id}`)}>
                                                    <div className="result-author-photo">
                                                        {author.photoUrl
                                                            ? <img src={author.photoUrl} alt={author.name} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                                            : <div className="result-author-placeholder"><UserCircleIcon /></div>}
                                                    </div>
                                                    <div className="result-author-info">
                                                        <p className="result-author-name">{author.name}</p>
                                                        <p className="result-author-books">{author.books?.length ?? 0} livros</p>
                                                        <div className="result-genres">
                                                            {(author.genres ?? []).slice(0, 2).map(g => (
                                                                <span key={g.id} className="result-genre-tag">{g.name}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                            )}

                            {activeTab === "leitores" && (
                                loading ? <LoadingState /> :
                                    readers.length === 0 ? <EmptyResults label="leitores" /> :
                                        <div className="results-readers">
                                            {readers.map(reader => (
                                                <div key={reader.id} className="result-reader-card" onClick={() => navigate(`/usuarios/${reader.id}`)}>
                                                    <div className="result-reader-avatar">
                                                        {reader.photoUrl
                                                            ? <img src={reader.photoUrl} alt={reader.firstName} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                                            : <div className="result-reader-placeholder"><UserCircleIcon /></div>}
                                                    </div>
                                                    <div className="result-reader-info">
                                                        <p className="result-reader-name">{reader.firstName} {reader.lastName}</p>
                                                        <p className="result-reader-username">@{reader.username}</p>
                                                    </div>
                                                    <div className="result-reader-stats">
                                                        <span className="result-reader-books" style={{
                                                            padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                            background: reader.following ? "#f0fff4" : "var(--cream-bg)",
                                                            color: reader.following ? "#2f855a" : "var(--text-muted)",
                                                            border: `1px solid ${reader.following ? "#2f855a" : "var(--border)"}`,
                                                        }}>
                                                            {reader.following ? "✓ Seguindo" : "Seguir"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

function EmptyResults({ label }: { label: string }) {
    return (
        <div className="results-empty">
            <p>Nenhum {label === "leitores" ? "leitor encontrado" : label === "livros" ? "livro encontrado" : "autor encontrado"}.</p>
        </div>
    );
}

function LoadingState() {
    return <div className="results-empty"><p>Buscando...</p></div>;
}