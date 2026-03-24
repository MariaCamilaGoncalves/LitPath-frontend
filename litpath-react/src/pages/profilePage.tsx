import "../styles/profilePage.css";
import { translateGenre } from "../utils/genreTranslations";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token") ?? ""}` });
const NOTIF_KEY = "litpath_notif_seen_at";

const SearchIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>);
const UserCircleIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>);
const EditIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
const SettingsIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
const BookIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" /></svg>);
const StarSmall = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="#c05621" stroke="#c05621" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
const HeartIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#c0392b" stroke="#c0392b" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);

const BtnDark = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} style={{ width: "100%", padding: "8px 0", background: "#3b2b24", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Lato', sans-serif", transition: "background 0.2s", marginTop: "auto" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#2a1e19")}
        onMouseLeave={e => (e.currentTarget.style.background = "#3b2b24")}>
        {children}
    </button>
);

interface BookDTO { id: number; title: string; authorName: string; coverUrl: string; }
interface AuthorDTO { id: number; name: string; photoUrl: string; genres: { id: number; name: string }[]; }
interface PersonDTO { id: number; firstName: string; lastName: string; username: string; photoUrl: string; }
interface ProfileDTO { id: number; firstName: string; lastName: string; username: string; email: string; photoUrl: string; bio: string; city: string; birthDate: string; preferences: { id: number; name: string }[]; }
interface ActivityItem {
    type: string; createdAt: string | null;
    bookId?: number; bookTitle?: string; rating?: number; comment?: string;
    authorId?: number; authorName?: string;
    followedUserId?: number; followedUsername?: string;
    reactionType?: string; reviewBookTitle?: string;
    fromUserId?: number; fromUsername?: string;
}

type Tab = "atividade" | "livros" | "favoritos" | "comunidade" | "detalhes";
type BookFilter = "lidos" | "quero";
type ActivitySubTab = "acoes" | "notificacoes";

const STATES_CITIES: Record<string, string[]> = {
    "AC": ["Rio Branco"], "AL": ["Maceió", "Arapiraca"], "AM": ["Manaus", "Parintins"],
    "AP": ["Macapá"], "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista"],
    "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte"], "DF": ["Brasília", "Ceilândia"],
    "ES": ["Vitória", "Vila Velha"], "GO": ["Goiânia", "Aparecida de Goiânia"],
    "MA": ["São Luís", "Imperatriz"], "MG": ["Belo Horizonte", "Uberlândia", "Juiz de Fora"],
    "MS": ["Campo Grande"], "MT": ["Cuiabá"],
    "PA": ["Belém", "Santarém"], "PB": ["João Pessoa", "Campina Grande", "Patos"],
    "PE": ["Recife", "Caruaru", "Olinda"], "PI": ["Teresina"],
    "PR": ["Curitiba", "Londrina", "Maringá"], "RJ": ["Rio de Janeiro", "Niterói", "Duque de Caxias"],
    "RN": ["Natal", "Mossoró"], "RO": ["Porto Velho"], "RR": ["Boa Vista"],
    "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas"], "SC": ["Florianópolis", "Joinville", "Blumenau"],
    "SE": ["Aracaju"], "SP": ["São Paulo", "Guarulhos", "Campinas", "Ribeirão Preto", "Santos"],
    "TO": ["Palmas"],
};
const STATE_NAMES: Record<string, string> = {
    "AC": "Acre", "AL": "Alagoas", "AM": "Amazonas", "AP": "Amapá", "BA": "Bahia", "CE": "Ceará", "DF": "Distrito Federal",
    "ES": "Espírito Santo", "GO": "Goiás", "MA": "Maranhão", "MG": "Minas Gerais", "MS": "Mato Grosso do Sul",
    "MT": "Mato Grosso", "PA": "Pará", "PB": "Paraíba", "PE": "Pernambuco", "PI": "Piauí", "PR": "Paraná",
    "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte", "RO": "Rondônia", "RR": "Roraima", "RS": "Rio Grande do Sul",
    "SC": "Santa Catarina", "SE": "Sergipe", "SP": "São Paulo", "TO": "Tocantins",
};
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function CalendarPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const parseDate = (v: string) => { if (!v) return new Date(); const [d, m, y] = v.split("/").map(Number); if (d && m && y) return new Date(y, m - 1, d); return new Date(); };
    const [current, setCurrent] = useState(() => { const d = parseDate(value); return { month: d.getMonth(), year: d.getFullYear() }; });
    const selected = parseDate(value);
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    const firstDay = new Date(current.year, current.month, 1).getDay();
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
    const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
    const select = (day: number) => { const d = String(day).padStart(2, "0"); const m = String(current.month + 1).padStart(2, "0"); onChange(`${d}/${m}/${current.year}`); };
    const isSelected = (day: number) => selected.getDate() === day && selected.getMonth() === current.month && selected.getFullYear() === current.year;
    return (
        <div className="calendar">
            <div className="calendar-header">
                <button className="cal-nav" onClick={() => setCurrent(c => { const d = new Date(c.year, c.month - 1); return { month: d.getMonth(), year: d.getFullYear() }; })}>‹</button>
                <div className="cal-header-selects">
                    <select className="cal-select" value={current.month} onChange={e => setCurrent(c => ({ ...c, month: Number(e.target.value) }))}>
                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select className="cal-select" value={current.year} onChange={e => setCurrent(c => ({ ...c, year: Number(e.target.value) }))}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <button className="cal-nav" onClick={() => setCurrent(c => { const d = new Date(c.year, c.month + 1); return { month: d.getMonth(), year: d.getFullYear() }; })}>›</button>
            </div>
            <div className="calendar-grid">
                {WEEKDAYS.map(w => <span key={w} className="cal-weekday">{w}</span>)}
                {cells.map((day, i) => <button key={i} className={`cal-day ${day === null ? "empty" : ""} ${day && isSelected(day) ? "selected" : ""}`} onClick={() => day && select(day)} disabled={day === null}>{day}</button>)}
            </div>
        </div>
    );
}

const CLOUDINARY_CLOUD = "dhatq5pie";
const CLOUDINARY_PRESET = "litpath_avatars";

function AvatarUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (!file.type.startsWith("image/")) { setError("Selecione uma imagem."); return; }
        if (file.size > 5 * 1024 * 1024) { setError("Máximo 5MB."); return; }
        setError(""); setUploading(true);
        try { const fd = new FormData(); fd.append("file", file); fd.append("upload_preset", CLOUDINARY_PRESET); const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: "POST", body: fd }); const data = await res.json(); if (data.secure_url) onChange(data.secure_url); else setError("Erro no upload."); } catch { setError("Erro de conexão."); } finally { setUploading(false); }
    };
    return (
        <div className="avatar-upload">
            <div className="avatar-preview">{value ? <img src={value} alt="Preview" className="avatar-preview-img" /> : <div className="avatar-preview-placeholder"><UserCircleIcon /></div>}</div>
            <label className={`btn-upload ${uploading ? "uploading" : ""}`}>{uploading ? "Enviando..." : "Escolher foto"}<input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: "none" }} /></label>
            {value && !uploading && <p className="avatar-upload-success">✓ Foto carregada</p>}
            {error && <p className="avatar-upload-error">{error}</p>}
            <p className="avatar-upload-hint">JPG, PNG ou WEBP · Máximo 5MB</p>
        </div>
    );
}

function CityPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const parseValue = (v: string) => { const parts = v.split(", "); if (parts.length === 2) { const stateKey = Object.keys(STATE_NAMES).find(k => STATE_NAMES[k] === parts[1] || k === parts[1]); return { city: parts[0], state: stateKey || "" }; } return { city: "", state: "" }; };
    const parsed = parseValue(value);
    const [selectedState, setSelectedState] = useState(parsed.state);
    const [cityInput, setCityInput] = useState(parsed.city);
    const handleState = (s: string) => { setSelectedState(s); setCityInput(""); onChange(""); };
    const handleCityInput = (c: string) => { setCityInput(c); if (selectedState && c.trim()) onChange(`${c.trim()}, ${STATE_NAMES[selectedState]}`); else onChange(""); };
    const handleSuggestion = (c: string) => { setCityInput(c); onChange(`${c}, ${STATE_NAMES[selectedState]}`); };
    const suggestions = selectedState && cityInput.length >= 2 ? (STATES_CITIES[selectedState] || []).filter(c => c.toLowerCase().includes(cityInput.toLowerCase())).slice(0, 5) : [];
    return (
        <div className="city-picker">
            <div className="edit-field"><label className="edit-label">Estado</label>
                <select className="edit-select" value={selectedState} onChange={e => handleState(e.target.value)}>
                    <option value="">Selecione o estado</option>
                    {Object.entries(STATE_NAMES).sort((a, b) => a[1].localeCompare(b[1])).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
            </div>
            {selectedState && (<div className="edit-field city-input-wrap"><label className="edit-label">Cidade</label>
                <input className="edit-input" type="text" placeholder="Digite o nome da cidade..." value={cityInput} onChange={e => handleCityInput(e.target.value)} autoComplete="off" />
                {suggestions.length > 0 && <div className="city-suggestions">{suggestions.map(c => <button key={c} className="city-suggestion-item" onClick={() => handleSuggestion(c)}>{c}</button>)}</div>}
            </div>)}
        </div>
    );
}

function MyActivityItem({ item, onNavigate }: { item: ActivityItem; onNavigate: (path: string) => void }) {
    const fmt = (s: string | null) => { if (!s) return ""; try { return new Date(s).toLocaleDateString("pt-BR"); } catch { return ""; } };
    const link = (label: React.ReactNode, path: string) => (
        <strong style={{ cursor: "pointer", color: "var(--brown-mid)" }} onClick={() => onNavigate(path)}>{label}</strong>
    );
    const configs: Record<string, { icon: string; text: () => React.ReactNode }> = {
        REVIEW: { icon: "⭐", text: () => (<>Avaliou {link(item.bookTitle, `/livros/${item.bookId}`)}{item.rating && <span style={{ marginLeft: 6, display: "inline-flex", gap: 2 }}>{Array.from({ length: item.rating }, (_, i) => <StarSmall key={i} />)}</span>}{item.comment && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, fontStyle: "italic" }}>"{item.comment}"</p>}</>) },
        FAVORITE_BOOK: { icon: "❤️", text: () => (<>Favoritou o livro {link(item.bookTitle, `/livros/${item.bookId}`)}</>) },
        FAVORITE_AUTHOR: { icon: "❤️", text: () => (<>Favoritou o autor {link(item.authorName, `/autores/${item.authorId}`)}</>) },
        READ_BOOK: { icon: "📖", text: () => (<>Marcou como lido {link(item.bookTitle, `/livros/${item.bookId}`)}</>) },
        WANT_BOOK: { icon: "🔖", text: () => (<>Quer ler {link(item.bookTitle, `/livros/${item.bookId}`)}</>) },
        FOLLOW: { icon: "👥", text: () => (<>Começou a seguir {link(`@${item.followedUsername}`, `/usuarios/${item.followedUserId}`)}</>) },
        REVIEW_REACTION: { icon: item.reactionType === "LIKE" ? "👍" : "👎", text: () => (<>{item.reactionType === "LIKE" ? "Curtiu" : "Não curtiu"} avaliação de {link(item.reviewBookTitle, `/livros/${item.bookId}`)}</>) },
        REVIEW_COMMENT: { icon: "💬", text: () => (<>Comentou na avaliação de {link(item.reviewBookTitle, `/livros/${item.bookId}`)} de {link(`@${item.fromUsername}`, `/usuarios/${item.fromUserId}`)}{item.comment && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, fontStyle: "italic" }}>"{item.comment}"</p>}</>) },
    };
    const c = configs[item.type]; if (!c) return null;
    return (
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>{c.text()}</div>
                {item.createdAt && <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>{fmt(item.createdAt)}</div>}
            </div>
        </div>
    );
}

function NotificationItem({ item, onNavigate }: { item: ActivityItem; onNavigate: (path: string) => void }) {
    const fmt = (s: string | null) => { if (!s) return ""; try { return new Date(s).toLocaleDateString("pt-BR"); } catch { return ""; } };
    const link = (label: React.ReactNode, path: string) => (
        <strong style={{ cursor: "pointer", color: "var(--brown-mid)" }} onClick={() => onNavigate(path)}>{label}</strong>
    );
    const configs: Record<string, { icon: string; text: () => React.ReactNode }> = {
        RECEIVED_REACTION: { icon: item.reactionType === "LIKE" ? "👍" : "👎", text: () => (<>{link(`@${item.fromUsername}`, `/usuarios/${item.fromUserId}`)} {item.reactionType === "LIKE" ? "curtiu" : "não curtiu"} sua avaliação de {link(item.bookTitle, `/livros/${item.bookId}`)}</>) },
        RECEIVED_COMMENT: { icon: "💬", text: () => (<>{link(`@${item.fromUsername}`, `/usuarios/${item.fromUserId}`)} comentou na sua avaliação de {link(item.bookTitle, `/livros/${item.bookId}`)}{item.comment && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, fontStyle: "italic" }}>"{item.comment}"</p>}</>) },
        NEW_FOLLOWER: { icon: "🫂", text: () => (<>{link(`@${item.fromUsername}`, `/usuarios/${item.fromUserId}`)} começou a te seguir!</>) },
    };
    const c = configs[item.type]; if (!c) return null;
    return (
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>{c.text()}</div>
                {item.createdAt && <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>{fmt(item.createdAt)}</div>}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<ProfileDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [readBooks, setReadBooks] = useState<BookDTO[]>([]);
    const [wantBooks, setWantBooks] = useState<BookDTO[]>([]);
    const [favoriteBooks, setFavoriteBooks] = useState<BookDTO[]>([]);
    const [favoriteAuthors, setFavoriteAuthors] = useState<AuthorDTO[]>([]);
    const [followers, setFollowers] = useState<PersonDTO[]>([]);
    const [following, setFollowing] = useState<PersonDTO[]>([]);
    const [myFeed, setMyFeed] = useState<ActivityItem[]>([]);
    const [receivedFeed, setReceivedFeed] = useState<ActivityItem[]>([]);
    const [newNotifCount, setNewNotifCount] = useState(0);

    const [activeTab, setActiveTab] = useState<Tab>("atividade");
    const [activitySubTab, setActivitySubTab] = useState<ActivitySubTab>("acoes");
    const [bookFilter, setBookFilter] = useState<BookFilter>("lidos");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editField, setEditField] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({ firstName: "", lastName: "", birthDate: "", city: "", bio: "", photoUrl: "" });

    const calcNewNotifs = useCallback((feed: ActivityItem[]) => {
        const lastSeen = localStorage.getItem(NOTIF_KEY);
        if (!lastSeen) { localStorage.setItem(NOTIF_KEY, new Date().toISOString()); setNewNotifCount(0); return; }
        const lastSeenDate = new Date(lastSeen);
        setNewNotifCount(feed.filter(item => item.createdAt && new Date(item.createdAt) > lastSeenDate).length);
    }, []);

    const handleOpenNotifications = () => {
        setActivitySubTab("notificacoes");
        localStorage.setItem(NOTIF_KEY, new Date().toISOString());
        setNewNotifCount(0);
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const profileRes = await fetch(`${API}/profile/me`, { headers: authHeader() });
                if (!profileRes.ok) throw new Error();
                const profileData: ProfileDTO = await profileRes.json();
                setProfile(profileData);
                setEditForm({ firstName: profileData.firstName ?? "", lastName: profileData.lastName ?? "", birthDate: profileData.birthDate ?? "", city: profileData.city ?? "", bio: profileData.bio ?? "", photoUrl: profileData.photoUrl ?? "" });

                const [jaLiRes, queroRes, favRes, socialRes, myFeedRes, receivedRes] = await Promise.all([
                    fetch(`${API}/lists/JA_LI`, { headers: authHeader() }),
                    fetch(`${API}/lists/QUERO_LER`, { headers: authHeader() }),
                    fetch(`${API}/favorites`, { headers: authHeader() }),
                    fetch(`${API}/social/me`, { headers: authHeader() }),
                    fetch(`${API}/activity/me`, { headers: authHeader() }),
                    fetch(`${API}/activity/received`, { headers: authHeader() }),
                ]);
                if (jaLiRes.ok) { const d = await jaLiRes.json(); setReadBooks(d.books ?? []); }
                if (queroRes.ok) { const d = await queroRes.json(); setWantBooks(d.books ?? []); }
                if (favRes.ok) { const d = await favRes.json(); setFavoriteBooks(d.favoriteBooks ?? []); setFavoriteAuthors(d.favoriteAuthors ?? []); }
                if (socialRes.ok) { const d = await socialRes.json(); setFollowers(d.followers ?? []); setFollowing(d.following ?? []); }
                if (myFeedRes.ok) setMyFeed(await myFeedRes.json());
                if (receivedRes.ok) { const d: ActivityItem[] = await receivedRes.json(); setReceivedFeed(d); calcNewNotifs(d); }
            } catch (err) { setError("Não foi possível carregar o perfil."); console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, [calcNewNotifs]);

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            const payload: Record<string, string> = {};
            if (editField === "avatar") payload.photoUrl = editForm.photoUrl;
            if (editField === "birthDate") payload.birthDate = editForm.birthDate;
            if (editField === "city") payload.city = editForm.city;
            if (editField === "bio") payload.bio = editForm.bio;
            if (editField === "name") { payload.firstName = editForm.firstName; payload.lastName = editForm.lastName; }
            const res = await fetch(`${API}/profile/me`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeader() }, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error();
            const updated: ProfileDTO = await res.json();
            setProfile(updated);
            setEditForm({ firstName: updated.firstName ?? "", lastName: updated.lastName ?? "", birthDate: updated.birthDate ?? "", city: updated.city ?? "", bio: updated.bio ?? "", photoUrl: updated.photoUrl ?? "" });
            setEditField(null);
        } catch (err) { console.error(err); } finally { setSaving(false); }
    };

    const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };
    const confirmDeleteAccount = async () => {
        try { await fetch(`${API}/users/me`, { method: "DELETE", headers: authHeader() }); } catch (err) { console.error(err); }
        finally { localStorage.removeItem("token"); localStorage.removeItem(NOTIF_KEY); navigate("/"); }
    };
    const closeAll = () => { setSettingsOpen(false); setEditOpen(false); };
    const currentBooks = bookFilter === "lidos" ? readBooks : wantBooks;

    if (loading) return <div className="loading-state"><p>Carregando perfil...</p></div>;
    if (error || !profile) return <div className="loading-state"><p>{error ?? "Perfil não encontrado."}</p></div>;

    return (
        <div className="profile-page" onClick={closeAll}>
            <header className="litpath-header">
                <div className="header-container">
                    <div className="logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
                        </svg><span>LitPath</span>
                    </div>
                    <div className="search-bar" onClick={() => navigate("/pesquisa")} style={{ cursor: "pointer" }}>
                        <SearchIcon />
                        <input type="text" placeholder="Pesquisar autores, livros, leitores..." readOnly style={{ cursor: "pointer" }} />
                    </div>
                    <nav className="header-nav">
                        <a href="/autores" className="nav-link">Autores</a>
                        <a href="/livros" className="nav-link">Livros</a>
                        <a href="/perfil" className="nav-link active-nav"><UserCircleIcon /><span>Perfil</span></a>
                    </nav>
                </div>
            </header>

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
                                <div className="settings-wrap" onClick={e => e.stopPropagation()}>
                                    <button className="btn-settings" onClick={() => { setSettingsOpen(o => !o); setEditOpen(false); }}><SettingsIcon /></button>
                                    {settingsOpen && (<div className="settings-dropdown">
                                        <button className="settings-item settings-item-logout" onClick={handleLogout}>Sair</button>
                                        <button className="settings-item settings-item-danger" onClick={() => { setSettingsOpen(false); setShowDeleteConfirm(true); }}>Apagar Conta</button>
                                    </div>)}
                                </div>
                            </div>
                            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                            <div className="profile-stats">
                                <div className="stat-item"><span className="stat-value">{readBooks.length}</span><span className="stat-label">Livros Lidos</span></div>
                                <div className="stat-divider" />
                                <div className="stat-item"><span className="stat-value">{favoriteBooks.length}</span><span className="stat-label">Favoritos</span></div>
                                <div className="stat-divider" />
                                <div className="stat-item"><span className="stat-value">{followers.length}</span><span className="stat-label">Seguidores</span></div>
                                <div className="stat-divider" />
                                <div className="stat-item"><span className="stat-value">{following.length}</span><span className="stat-label">Seguindo</span></div>
                            </div>
                            <div className="edit-wrap" onClick={e => e.stopPropagation()}>
                                <button className="btn-edit-profile" onClick={() => { setEditOpen(o => !o); setSettingsOpen(false); }}><EditIcon /> Editar Perfil</button>
                                {editOpen && (<div className="edit-dropdown">
                                    <button className="edit-item" onClick={() => { setEditOpen(false); setEditField("avatar"); }}>Foto de perfil</button>
                                    <button className="edit-item" onClick={() => { setEditOpen(false); setEditField("name"); }}>Nome e sobrenome</button>
                                    <button className="edit-item" onClick={() => { setEditOpen(false); setEditField("birthDate"); }}>Data de nascimento</button>
                                    <button className="edit-item" onClick={() => { setEditOpen(false); setEditField("city"); }}>Cidade</button>
                                    <button className="edit-item" onClick={() => { setEditOpen(false); setEditField("bio"); }}>Bio</button>
                                </div>)}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="tabs-bar">
                    {(["atividade", "livros", "favoritos", "comunidade", "detalhes"] as Tab[]).map(tab => (
                        <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                            {tab === "atividade" ? "Atividade" : tab === "livros" ? "Meus Livros" : tab === "favoritos" ? "Favoritos" : tab === "comunidade" ? "Comunidade" : "Detalhes"}
                        </button>
                    ))}
                </div>

                <div className="tab-content" key={activeTab}>

                    {activeTab === "atividade" && (
                        <div className="activity-card activity-card-full">
                            <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid var(--border)" }}>
                                <button onClick={() => setActivitySubTab("acoes")} style={{ padding: "8px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, fontFamily: "'Lato',sans-serif", fontWeight: activitySubTab === "acoes" ? 700 : 400, color: activitySubTab === "acoes" ? "var(--brown-dark)" : "var(--text-muted)", borderBottom: activitySubTab === "acoes" ? "2px solid var(--brown-dark)" : "2px solid transparent", marginBottom: -2 }}>
                                    Minhas Ações
                                </button>
                                <button onClick={handleOpenNotifications} style={{ padding: "8px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: 14, fontFamily: "'Lato',sans-serif", fontWeight: activitySubTab === "notificacoes" ? 700 : 400, color: activitySubTab === "notificacoes" ? "var(--brown-dark)" : "var(--text-muted)", borderBottom: activitySubTab === "notificacoes" ? "2px solid var(--brown-dark)" : "2px solid transparent", marginBottom: -2, display: "flex", alignItems: "center", gap: 6 }}>
                                    Notificações
                                    {newNotifCount > 0 && (<span style={{ background: "#c0392b", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{newNotifCount > 9 ? "9+" : newNotifCount}</span>)}
                                </button>
                            </div>
                            {activitySubTab === "acoes" && (myFeed.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma atividade ainda.</p> : myFeed.map((item, i) => <MyActivityItem key={i} item={item} onNavigate={navigate} />))}
                            {activitySubTab === "notificacoes" && (receivedFeed.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma notificação ainda.</p> : receivedFeed.map((item, i) => <NotificationItem key={i} item={item} onNavigate={navigate} />))}
                        </div>
                    )}

                    {activeTab === "livros" && (
                        <>
                            <div className="books-filter-bar">
                                <h3 className="books-section-title">Minha Biblioteca</h3>
                                <div className="books-filter-btns">
                                    <button className={`btn-filter-book ${bookFilter === "lidos" ? "active" : ""}`} onClick={() => setBookFilter("lidos")}>Lidos ({readBooks.length})</button>
                                    <button className={`btn-filter-book ${bookFilter === "quero" ? "active" : ""}`} onClick={() => setBookFilter("quero")}>Quero Ler ({wantBooks.length})</button>
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
                                {favoriteBooks.length === 0 && <p className="empty-state">Nenhum livro favorito ainda.</p>}
                                {favoriteBooks.map(book => (
                                    <div key={book.id} className="book-card favorite-card" style={{ display: "flex", flexDirection: "column" }}>
                                        <div className="book-cover">{book.coverUrl ? <img src={book.coverUrl} alt={book.title} /> : <div className="cover-placeholder"><BookIcon /></div>}<span className="favorite-heart"><HeartIcon /></span></div>
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
                                {favoriteAuthors.length === 0 && <p className="empty-state">Nenhum autor favorito ainda.</p>}
                                {favoriteAuthors.map(author => (
                                    <div key={author.id} style={{ background: "var(--cream-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 12px rgba(59,43,36,0.06)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(59,43,36,0.12)"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(59,43,36,0.06)"; }}>
                                        <div style={{ position: "relative", width: "100%", height: 260, overflow: "hidden", background: "var(--cream-bg)" }}>
                                            {author.photoUrl ? <img src={author.photoUrl} alt={author.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#e8d4ba,#d4bfa5)" }}><UserCircleIcon /></div>}
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
                                <h3>Seguidores <span className="community-count">({followers.length})</span></h3>
                                <div className="people-list">
                                    {followers.length === 0 && <p className="empty-state">Nenhum seguidor ainda.</p>}
                                    {followers.map(person => (
                                        <div key={person.id} className="person-item" style={{ cursor: "pointer" }} onClick={() => navigate(`/usuarios/${person.id}`)}>
                                            <div className="person-avatar">{person.photoUrl ? <img src={person.photoUrl} alt={person.firstName} /> : <div className="person-avatar-placeholder"><UserCircleIcon /></div>}</div>
                                            <div className="person-info"><p className="person-name">{person.firstName} {person.lastName}</p><p className="person-username">@{person.username}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="community-card">
                                <h3>Seguindo <span className="community-count">({following.length})</span></h3>
                                <div className="people-list">
                                    {following.length === 0 && <p className="empty-state">Você não segue ninguém ainda.</p>}
                                    {following.map(person => (
                                        <div key={person.id} className="person-item" style={{ cursor: "pointer" }} onClick={() => navigate(`/usuarios/${person.id}`)}>
                                            <div className="person-avatar">{person.photoUrl ? <img src={person.photoUrl} alt={person.firstName} /> : <div className="person-avatar-placeholder"><UserCircleIcon /></div>}</div>
                                            <div className="person-info"><p className="person-name">{person.firstName} {person.lastName}</p><p className="person-username">@{person.username}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "detalhes" && (
                        <div className="activity-card activity-card-full">
                            <h3>Informações Pessoais</h3>
                            <div className="personal-info-list">
                                {profile.birthDate && <div className="personal-info-item"><span className="personal-info-label">Data de nascimento</span><span className="personal-info-value">{profile.birthDate}</span></div>}
                                {profile.city && <div className="personal-info-item"><span className="personal-info-label">Cidade</span><span className="personal-info-value">{profile.city}</span></div>}
                                {profile.preferences?.length > 0 && (<div className="personal-info-item"><span className="personal-info-label">Gêneros favoritos</span><div className="personal-info-genres">{profile.preferences.map(g => <span key={g.id} className="genre-tag-small">{translateGenre(g.name)}</span>)}</div></div>)}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {editField && (
                <div className="confirm-overlay" onClick={() => setEditField(null)}>
                    <div className="confirm-modal edit-modal" onClick={e => e.stopPropagation()}>
                        <h2 className="confirm-title">{editField === "avatar" && "Foto de perfil"}{editField === "name" && "Nome e sobrenome"}{editField === "birthDate" && "Data de nascimento"}{editField === "city" && "Cidade"}{editField === "bio" && "Bio"}</h2>
                        <div className="edit-form">
                            {editField === "avatar" && <AvatarUpload value={editForm.photoUrl} onChange={url => setEditForm(f => ({ ...f, photoUrl: url }))} />}
                            {editField === "name" && (<><div className="edit-field"><label className="edit-label">Nome</label><input className="edit-input" type="text" value={editForm.firstName} onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} /></div><div className="edit-field"><label className="edit-label">Sobrenome</label><input className="edit-input" type="text" value={editForm.lastName} onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} /></div></>)}
                            {editField === "birthDate" && (<div className="edit-field"><label className="edit-label">Data de nascimento</label><CalendarPicker value={editForm.birthDate} onChange={v => setEditForm(f => ({ ...f, birthDate: v }))} />{editForm.birthDate && <p className="edit-date-selected">Selecionado: {editForm.birthDate}</p>}</div>)}
                            {editField === "city" && <CityPicker value={editForm.city} onChange={v => setEditForm(f => ({ ...f, city: v }))} />}
                            {editField === "bio" && (<div className="edit-field"><label className="edit-label">Bio</label><textarea className="edit-textarea" rows={4} placeholder="Fale um pouco sobre você..." value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} /></div>)}
                        </div>
                        <div className="confirm-actions">
                            <button className="btn-cancel-delete" onClick={() => setEditField(null)} disabled={saving}>Cancelar</button>
                            <button className="btn-save-edit" onClick={handleSaveEdit} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <h2 className="confirm-title">Apagar conta?</h2>
                        <p className="confirm-subtitle">Esta ação é <strong>irreversível</strong>. Todos os seus dados serão permanentemente removidos.</p>
                        <div className="confirm-actions">
                            <button className="btn-cancel-delete" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
                            <button className="btn-confirm-delete" onClick={confirmDeleteAccount}>Sim, apagar minha conta</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
