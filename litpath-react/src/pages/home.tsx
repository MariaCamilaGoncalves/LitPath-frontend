import "../styles/home.css";

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);

const StarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
);

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
);

const UserCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
);

interface Author {
    id: string;
    name: string;
    image: string;
    description: string;
    booksCount: number;
    rating: number;
}

interface Book {
    id: string;
    title: string;
    author: string;
    cover: string;
    genre: string;
    year: number;
    rating: number;
}

export default function Home() {
    const featuredAuthors: Author[] = [
        {
            id: "1",
            name: "Machado de Assis",
            image: "/authors/machado.jpg",
            description: "Escritor brasileiro, considerado um dos maiores nomes da literatura nacional.",
            booksCount: 15,
            rating: 4.8,
        },
        {
            id: "2",
            name: "Clarice Lispector",
            image: "/authors/clarice.jpg",
            description: "Escritora brasileira nascida na Ucrânia, uma das principais representantes da literatura brasileira.",
            booksCount: 12,
            rating: 4.9,
        },
        {
            id: "3",
            name: "Jorge Amado",
            image: "/authors/jorge.jpg",
            description: "Escritor brasileiro, um dos autores mais adaptados para cinema, teatro e televisão.",
            booksCount: 23,
            rating: 4.7,
        },
    ];

    const popularBooks: Book[] = [
        {
            id: "1",
            title: "Dom Casmurro",
            author: "Machado de Assis",
            cover: "/books/dom-casmurro.jpg",
            genre: "Romance",
            year: 1899,
            rating: 4.6,
        },
        {
            id: "2",
            title: "A Hora da Estrela",
            author: "Clarice Lispector",
            cover: "/books/hora-estrela.jpg",
            genre: "Romance",
            year: 1977,
            rating: 4.8,
        },
        {
            id: "3",
            title: "Gabriela, Cravo e Canela",
            author: "Jorge Amado",
            cover: "/books/gabriela.jpg",
            genre: "Romance",
            year: 1958,
            rating: 4.5,
        },
    ];

    return (
        <div className="litpath-home">
            {/* Header */}
            <header className="litpath-header">
                <div className="header-container">
                    <div className="logo">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
                            fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
                            <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
                        </svg>
                        <span>LitPath</span>
                    </div>

                    <div className="search-bar">
                        <SearchIcon />
                        <input type="text" placeholder="Pesquisar autores, livros..." />
                    </div>

                    <nav className="header-nav">
                        <a href="/autores" className="nav-link">Autores</a>
                        <a href="/livros" className="nav-link">Livros</a>
                        <a href="/perfil" className="nav-link">
                            <UserCircleIcon />
                            <span>Perfil</span>
                        </a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="litpath-main">
                {/* Hero Section */}
                <section className="hero-section">
                    <h1 className="hero-title">
                        Descubra o mundo da <span className="highlight">literatura</span>
                    </h1>
                    <p className="hero-subtitle">
                        Explore autores, descubra novos livros e conecte-se com uma comunidade apaixonada por literatura
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-hero-primary">Explorar Autores</button>
                        <button className="btn-hero-secondary">Ver Livros</button>
                    </div>
                </section>

                {/* Featured Authors Section */}
                <section className="section featured-authors">
                    <div className="section-header">
                        <h2>Autores em Destaque</h2>
                        <p className="section-subtitle">Conheça os grandes nomes da literatura</p>
                    </div>

                    <div className="authors-grid">
                        {featuredAuthors.map((author) => (
                            <div key={author.id} className="author-card">
                                <div className="author-image">
                                    <div className="image-placeholder">
                                        <UserCircleIcon />
                                    </div>
                                </div>
                                <div className="author-info">
                                    <h3>{author.name}</h3>
                                    <p className="author-description">{author.description}</p>
                                    <div className="author-stats">
                                        <span className="book-count">{author.booksCount} livros</span>
                                        <div className="rating">
                                            <StarIcon />
                                            <span>{author.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Popular Books Section */}
                <section className="section popular-books">
                    <div className="section-header">
                        <h2>Livros Populares</h2>
                        <p className="section-subtitle">Os livros mais lidos e bem avaliados</p>
                    </div>

                    <div className="books-grid">
                        {popularBooks.map((book) => (
                            <div key={book.id} className="book-card">
                                <div className="book-cover">
                                    <div className="cover-placeholder">
                                        <BookIcon />
                                    </div>
                                </div>
                                <div className="book-info">
                                    <h3>{book.title}</h3>
                                    <p className="book-author">por {book.author}</p>
                                    <div className="book-meta">
                                        <span className="book-genre">{book.genre}</span>
                                        <span className="book-year">{book.year}</span>
                                    </div>
                                    <div className="book-footer">
                                        <div className="rating">
                                            <StarIcon />
                                            <span>{book.rating}</span>
                                        </div>
                                        <button className="btn-details">Ver Detalhes</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <h2>Cada livro é uma viagem.</h2>
                    <p>
                        Aqui, os caminhos da literatura se encontram — autores, obras e leitores
                        reunidos num só lugar. Explore, descubra e deixe as histórias guiarem você.
                    </p>
                    <div className="cta-divider" />
                </section>
            </main>
        </div>
    );
}