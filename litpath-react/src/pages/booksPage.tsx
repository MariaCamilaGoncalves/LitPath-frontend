import { Link, useNavigate } from "react-router-dom";
import "../styles/booksPage.css";
import { translateGenre } from "../utils/genreTranslations";
import { useState, useEffect } from "react";


// ── Icons ──────────────────────────────────────────────────────────────────────
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


const BookOpenIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
);


const StarFilledIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f4a942" stroke="#f4a942" strokeWidth="1">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);


// ── Types ──────────────────────────────────────────────────────────────────────
interface GenreDTO {
    id: number;
    name: string;
}


interface BookDTO {
    id: number;
    title: string;
    synopsis: string;
    publicationYear: number;
    coverUrl: string;
    authorName: string;
    authorId: number;
    genres: GenreDTO[];
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
export default function BooksPage() {
    const navigate = useNavigate();


    const [books, setBooks] = useState<BookDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookSearch, setBookSearch] = useState("");
    const [activeGenre, setActiveGenre] = useState("Todos");
    const [allGenres, setAllGenres] = useState<string[]>(["Todos"]);


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }


        const fetchBooks = async () => {
            try {
                const res = await authFetch(`${API_URL}/books`);


                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem("token");
                    navigate("/");
                    return;
                }


                const data: BookDTO[] = await res.json();
                setBooks(shuffle(data));


                // Monta lista de gêneros únicos a partir dos livros
                const genreSet = new Set<string>();
                data.forEach(b => b.genres?.forEach(g => genreSet.add(translateGenre(g.name))));
                setAllGenres(["Todos", ...Array.from(genreSet).sort()]);


            } catch (err) {
                console.error("Erro ao buscar livros:", err);
            } finally {
                setLoading(false);
            }
        };


        fetchBooks();
    }, [navigate]);


    // Busca por título com Enter
    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && bookSearch.trim()) {
            try {
                const res = await authFetch(`${API_URL}/books/search?title=${bookSearch}`);
                const data: BookDTO[] = await res.json();
                setBooks(shuffle(data));
            } catch (err) {
                console.error("Erro na busca:", err);
            }
        }
        if (e.key === "Escape") {
            setBookSearch("");
        }
    };


    const filtered = books.filter(b => {
        const matchSearch = b.title.toLowerCase().includes(bookSearch.toLowerCase());
        const matchGenre = activeGenre === "Todos" || b.genres?.some(g => translateGenre(g.name) === activeGenre);
        return matchSearch && matchGenre;
    });


    return (
        <div className="books-page">
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
                        <Link to="/autores" className="nav-link">Autores</Link>
                        <Link to="/livros" className="nav-link active-nav">Livros</Link>
                        <Link to="/perfil" className="nav-link">
                            <UserCircleIcon />
                            <span>Perfil</span>
                        </Link>
                    </nav>
                </div>
            </header>


            <main className="books-main">
                {/* Hero */}
                <section className="books-hero">
                    <h1 className="books-hero-title">Biblioteca de Livros</h1>
                    <p className="books-hero-subtitle">
                        Explore nossa vasta coleção de obras literárias, desde<br />
                        clássicos atemporais até lançamentos contemporâneos
                    </p>
                </section>


                {/* Search */}
                <div className="books-controls">
                    <div className="books-search-bar">
                        <SearchIcon />
                        <input
                            type="text"
                            placeholder="Pesquisar livros... (Enter para buscar)"
                            value={bookSearch}
                            onChange={e => setBookSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </div>


                {/* Genre Chips — gerados dinamicamente do banco */}
                <div className="books-filters">
                    <p className="books-filters-label">Gêneros</p>
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
                {loading && <div className="empty-state"><p>Carregando...</p></div>}


                {!loading && filtered.length === 0 && (
                    <div className="empty-state"><p>Nenhum livro encontrado.</p></div>
                )}


                {!loading && filtered.length > 0 && (
                    <div className="books-grid">
                        {filtered.map(book => (
                            <BookCard key={book.id} book={book} onNavigate={() => navigate(`/livros/${book.id}`)} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}


// ── Book Card ─────────────────────────────────────────────────────────────────
function BookCard({ book, onNavigate }: { book: BookDTO; onNavigate: () => void }) {
    return (
        <div className="book-card">
            <div className="book-card-cover">
                {book.coverUrl ? (
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                ) : (
                    <div className="book-card-cover-placeholder">
                        <BookOpenIcon />
                    </div>
                )}
                {book.publicationYear && (
                    <div className="book-card-rating-bar">
                        <StarFilledIcon />
                        <span>{book.publicationYear}</span>
                    </div>
                )}
            </div>


            <div className="book-card-body">
                <p className="book-card-title">{book.title}</p>
                <p className="book-card-author">por {book.authorName}</p>
                {book.genres?.length > 0 && (
                    <span className="book-card-genre-tag">{book.genres[0].name}</span>
                )}
                {book.synopsis && (
                    <p className="book-card-description">{book.synopsis.slice(0, 120)}...</p>
                )}
                <button className="btn-ver-detalhes" onClick={onNavigate}>Ver Detalhes</button>
            </div>
        </div>
    );
}
