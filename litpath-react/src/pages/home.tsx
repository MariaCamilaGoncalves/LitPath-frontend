import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import { translateGenre } from "../utils/genreTranslations";

const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>);
const BookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" /></svg>);
const UserCircleIcon = () => (<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>);

interface GenreDTO { id: number; name: string; }
interface BookDTO { id: number; title: string; synopsis: string; publicationYear: number; coverUrl: string; authorName: string; genres: GenreDTO[]; }
interface AuthorDTO { id: number; name: string; biography: string; nationality: string; birthDate: string; photoUrl: string; genres: GenreDTO[]; books: BookDTO[]; }

const API_URL = import.meta.env.VITE_API_URL;
const authFetch = (url: string) => fetch(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" } });
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export default function Home() {
    const navigate = useNavigate();
    const [authors, setAuthors] = useState<AuthorDTO[]>([]);
    const [books, setBooks] = useState<BookDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!localStorage.getItem("token")) { navigate("/"); return; }
        const fetchData = async () => {
            try {
                const [authorsRes, booksRes] = await Promise.all([
                    authFetch(`${API_URL}/authors`),
                    authFetch(`${API_URL}/books`)
                ]);
                if (authorsRes.status === 401 || authorsRes.status === 403) { localStorage.removeItem("token"); navigate("/"); return; }
                const authorsData: AuthorDTO[] = await authorsRes.json();
                const booksData: BookDTO[] = await booksRes.json();
                setAuthors(shuffle(authorsData).slice(0, 6));
                const booksWithCover = booksData.filter(b => b.coverUrl);
                const chosen = shuffle(booksWithCover).slice(0, 12);
                if (chosen.length < 12) {
                    const withoutCover = booksData.filter(b => !b.coverUrl);
                    const extra = shuffle(withoutCover).slice(0, 12 - chosen.length);
                    setBooks([...chosen, ...extra]);
                } else {
                    setBooks(chosen);
                }
            } catch (error) { console.error("Erro ao buscar dados:", error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [navigate]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchTerm.trim()) navigate(`/pesquisa?q=${encodeURIComponent(searchTerm)}`);
    };

    return (
        <div className="litpath-home">
            <header className="litpath-header">
                <div className="header-container">
                    <div className="logo">
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
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                            onClick={() => navigate("/pesquisa")}
                            readOnly
                        />
                    </div>
                    <nav className="header-nav">
                        <a href="/autores" className="nav-link">Autores</a>
                        <a href="/livros" className="nav-link">Livros</a>
                        <a href="/perfil" className="nav-link">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>
                            <span>Perfil</span>
                        </a>
                    </nav>
                </div>
            </header>

            <main className="litpath-main">
                <section className="hero-section">
                    <h1 className="hero-title">Descubra o mundo da <span className="highlight">literatura</span></h1>
                    <p className="hero-subtitle">Explore autores, descubra obras e mergulhe no universo da literatura.</p>
                    <div className="hero-buttons">
                        <button className="btn-hero-primary" onClick={() => navigate("/autores")}>Explorar Autores</button>
                        <button className="btn-hero-secondary" onClick={() => navigate("/livros")}>Ver Livros</button>
                    </div>
                </section>

                <section className="section featured-authors">
                    <div className="section-header">
                        <h2>Autores em Destaque</h2>
                        <p className="section-subtitle">Cada autor carrega um universo. Descubra o deles.</p>
                    </div>
                    {loading ? <p className="loading-text">Carregando autores...</p> : (
                        <div className="authors-grid">
                            {authors.map(author => (
                                <div key={author.id} className="author-card" onClick={() => navigate(`/autores/${author.id}`)}>
                                    <div className="author-image">
                                        {author.photoUrl
                                            ? <img src={author.photoUrl} alt={author.name} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                            : <div className="image-placeholder"><UserCircleIcon /></div>}
                                    </div>
                                    <div className="author-info">
                                        <h3>{author.name}</h3>
                                        <p className="author-description">{author.biography ? author.biography.slice(0, 100) + "..." : author.nationality || "Autor sem descrição"}</p>
                                        <div className="author-stats">
                                            <span className="book-count">{author.books?.length ?? 0} livros</span>
                                            {author.genres?.length > 0 && <span className="author-genre">{translateGenre(author.genres[0].name)}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="section popular-books">
                    <div className="section-header">
                        <h2>Livros Populares</h2>
                        <p className="section-subtitle">Sua próxima leitura favorita está aqui!</p>
                    </div>
                    {loading ? <p className="loading-text">Carregando livros...</p> : (
                        <div className="books-grid-wrapper">
                            <div className="books-grid">
                                {books.map(book => (
                                    <div key={book.id} className="book-card">
                                        <div className="book-cover">
                                            {book.coverUrl
                                                ? <img src={book.coverUrl} alt={book.title} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                                : <div className="cover-placeholder"><BookIcon /></div>}
                                        </div>
                                        <div className="book-info">
                                            <h3>{book.title}</h3>
                                            <p className="book-author">por {book.authorName}</p>
                                            <div className="book-footer">
                                                <button className="btn-details" onClick={() => navigate(`/livros/${book.id}`)}>Ver Detalhes</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="cta-section">
                    <h2>Cada livro é uma viagem.</h2>
                    <p>Aqui, os caminhos da literatura se encontram — autores, obras e leitores reunidos num só lugar. Explore, descubra e deixe as histórias guiarem você.</p>
                    <div className="cta-divider" />
                </section>
            </main>
        </div>
    );
}