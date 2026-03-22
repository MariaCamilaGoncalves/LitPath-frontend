import "../styles/preferencesPage.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { translateGenre } from "../utils/genreTranslations";

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"
        fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const GENRE_EMOJIS: Record<string, string> = {
    "fiction": "📚",
    "american fiction": "🗽",
    "english fiction": "🎩",
    "juvenile fiction": "🧒",
    "young adult fiction": "🎒",
    "science fiction": "🚀",
    "literary fiction": "🖋️",
    "detective and mystery stories": "🕵️",
    "detective and mystery stories, brazilian": "🌴",
    "mystery": "🔍",
    "thriller": "😰",
    "crime": "🔫",
    "brazilian literature": "🇧🇷",
    "portuguese language": "🗣️",
    "short stories, brazilian": "📖",
    "short stories, american": "📝",
    "short stories": "📝",
    "drama": "🎭",
    "romance": "💕",
    "poetry": "🌿",
    "classics": "🏛️",
    "literary collections": "🗂️",
    "literary criticism": "📋",
    "fairy tales": "🧚",
    "biography & autobiography": "👤",
    "biography": "👤",
    "autobiography": "✍️",
    "history": "🏺",
    "social science": "🌍",
    "political science": "🏛",
    "self-help": "✨",
    "travel": "✈️",
    "art": "🎨",
    "music": "🎵",
    "philosophy": "🧠",
    "psychology": "💭",
    "religion": "🕊️",
    "science": "🔬",
    "technology": "💻",
    "education": "📐",
    "humor": "😄",
    "nonfiction": "📰",
    "family & relationships": "👨‍👩‍👧",
    "juvenile nonfiction": "🎓",
    "women": "👩",
    "entrevistas": "🎤",
    "alchemists": "⚗️",
};

const GROUP_MAP: Record<string, string> = {
    "fiction": "Ficção",
    "literary fiction": "Ficção",
    "science fiction": "Ficção",
    "juvenile fiction": "Ficção",
    "young adult fiction": "Ficção",
    "american fiction": "Ficção",
    "english fiction": "Ficção",
    "mystery": "Mistério & Suspense",
    "thriller": "Mistério & Suspense",
    "crime": "Mistério & Suspense",
    "detective and mystery stories": "Mistério & Suspense",
    "detective and mystery stories, brazilian": "Mistério & Suspense",
    "romance": "Clássicos & Poesia",
    "drama": "Clássicos & Poesia",
    "poetry": "Clássicos & Poesia",
    "classics": "Clássicos & Poesia",
    "fairy tales": "Clássicos & Poesia",
    "literary collections": "Clássicos & Poesia",
    "literary criticism": "Clássicos & Poesia",
    "brazilian literature": "Literatura Brasileira",
    "short stories, brazilian": "Literatura Brasileira",
    "short stories": "Literatura Brasileira",
    "short stories, american": "Literatura Brasileira",
    "portuguese language": "Literatura Brasileira",
    "biography & autobiography": "Não-ficção",
    "biography": "Não-ficção",
    "autobiography": "Não-ficção",
    "history": "Não-ficção",
    "philosophy": "Não-ficção",
    "psychology": "Não-ficção",
    "self-help": "Não-ficção",
    "social science": "Não-ficção",
    "science": "Não-ficção",
    "art": "Não-ficção",
    "music": "Não-ficção",
    "humor": "Não-ficção",
    "travel": "Não-ficção",
    "religion": "Não-ficção",
    "technology": "Não-ficção",
    "education": "Não-ficção",
    "nonfiction": "Outros",
    "juvenile nonfiction": "Outros",
    "family & relationships": "Outros",
    "women": "Outros",
    "entrevistas": "Outros",
    "alchemists": "Outros",
};

const GROUP_ORDER = [
    "Ficção",
    "Mistério & Suspense",
    "Clássicos & Poesia",
    "Literatura Brasileira",
    "Não-ficção",
    "Outros",
];

interface GenreDTO {
    id: number;
    name: string;
}

function groupGenres(genres: GenreDTO[]) {
    const map: Record<string, GenreDTO[]> = {};
    for (const g of genres) {
        const group = GROUP_MAP[g.name.toLowerCase()] ?? "Outros";
        if (!map[group]) map[group] = [];
        map[group].push(g);
    }
    return GROUP_ORDER
        .filter(g => map[g]?.length)
        .map(g => ({ label: g, genres: map[g] }));
}

export default function PreferencesPage() {
    const navigate = useNavigate();
    const [allGenres, setAllGenres] = useState<GenreDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<number[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await fetch(`${API_URL}/genres`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (!res.ok) throw new Error("Erro ao buscar gêneros");
                const data: GenreDTO[] = await res.json();
                setAllGenres(data);
            } catch (err) {
                setError("Não foi possível carregar os gêneros. Tente novamente.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGenres();
    }, []);

    const toggle = (id: number) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const handleContinue = () => {
        if (selected.length === 0) return;
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("http://localhost:8080/profile/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ genreIds: selected }),
            });

            if (!res.ok) throw new Error("Erro ao salvar preferências");

            navigate("/home");
        } catch (err) {
            setError("Não foi possível salvar suas preferências. Tente novamente.");
            console.error(err);
            setShowConfirm(false);
        } finally {
            setSaving(false);
        }
    };

    const groups = groupGenres(allGenres);
    const selectedGenres = allGenres.filter(g => selected.includes(g.id));

    return (
        <div className="onboarding-page">
            <div className="onboarding-logo">
                <BookIcon />
                <span>LitPath</span>
            </div>

            <div className="onboarding-content">
                <div className="onboarding-header">
                    <h1 className="onboarding-title">Bem-vindo ao LitPath</h1>
                    <p className="onboarding-subtitle">
                        Selecione os gêneros que você gosta de ler.<br />
                        Usaremos suas preferências para recomendar autores e livros.
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="loading-state">
                        <p>Carregando gêneros...</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="genre-groups">
                        {groups.map((group, gi) => (
                            <div key={group.label} className="genre-group">
                                <h3 className="genre-group-label">{group.label}</h3>
                                <div className="genres-grid">
                                    {group.genres.map((genre, i) => (
                                        <button
                                            key={genre.id}
                                            className={`genre-card ${selected.includes(genre.id) ? "selected" : ""}`}
                                            onClick={() => toggle(genre.id)}
                                            style={{ animationDelay: `${(gi * 4 + i) * 30}ms` }}
                                        >
                                            <span className="genre-card-emoji">
                                                {GENRE_EMOJIS[genre.name.toLowerCase()] ?? "📖"}
                                            </span>
                                            <span className="genre-card-label">
                                                {translateGenre(genre.name)}
                                            </span>
                                            {selected.includes(genre.id) && (
                                                <span className="genre-card-check">
                                                    <CheckIcon />
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="onboarding-footer">
                    {selected.length > 0 && (
                        <p className="onboarding-count">
                            {selected.length} gênero{selected.length > 1 ? "s" : ""} selecionado{selected.length > 1 ? "s" : ""}
                        </p>
                    )}
                    <button
                        className={`btn-continuar ${selected.length === 0 ? "disabled" : ""}`}
                        onClick={handleContinue}
                        disabled={selected.length === 0}
                    >
                        Continuar
                        <ArrowRightIcon />
                    </button>
                </div>
            </div>

            {showConfirm && (
                <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <h2 className="confirm-title">Confirmar preferências?</h2>
                        <p className="confirm-subtitle">Você selecionou os seguintes gêneros:</p>

                        <div className="confirm-genres">
                            {selectedGenres.map(genre => (
                                <span key={genre.id} className="confirm-genre-tag">
                                    {translateGenre(genre.name)}
                                </span>
                            ))}
                        </div>

                        <div className="confirm-actions">
                            <button
                                className="btn-voltar"
                                onClick={() => setShowConfirm(false)}
                                disabled={saving}
                            >
                                Voltar
                            </button>
                            <button
                                className="btn-confirmar"
                                onClick={handleConfirm}
                                disabled={saving}
                            >
                                {saving ? "Salvando..." : "Confirmar e continuar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
