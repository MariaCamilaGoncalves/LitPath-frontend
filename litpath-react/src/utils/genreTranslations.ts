const genreTranslations: Record<string, string> = {
    // Ficção
    "fiction": "Ficção",
    "american fiction": "Ficção Americana",
    "english fiction": "Ficção Inglesa",
    "juvenile fiction": "Ficção Juvenil",
    "young adult fiction": "Ficção Jovem Adulto",
    "science fiction": "Ficção Científica",
    "literary fiction": "Ficção Literária",

    // Mistério / Suspense
    "detective and mystery stories": "Mistério e Suspense",
    "detective and mystery stories, brazilian": "Mistério e Suspense Brasileiro",
    "mystery": "Mistério",
    "thriller": "Thriller",
    "crime": "Crime",

    // Literatura Brasileira / Portuguesa
    "brazilian literature": "Literatura Brasileira",
    "portuguese language": "Língua Portuguesa",
    "cuentos brasilenhos": "Contos Brasileiros",
    "cuentos brasilenos": "Contos Brasileiros",
    "short stories, brazilian": "Contos Brasileiros",
    "short stories, american": "Contos Americanos",
    "short stories": "Contos",

    // Gêneros clássicos
    "drama": "Drama",
    "romance": "Romance",
    "poetry": "Poesia",
    "classics": "Clássicos",
    "literary collections": "Coleções Literárias",
    "literary criticism": "Crítica Literária",
    "fairy tales": "Contos de Fadas",

    // Não-ficção
    "biography & autobiography": "Biografia e Autobiografia",
    "biography": "Biografia",
    "autobiography": "Autobiografia",
    "history": "História",
    "social science": "Ciências Sociais",
    "political science": "Ciência Política",
    "self-help": "Autoajuda",
    "travel": "Viagem",
    "art": "Arte",
    "music": "Música",
    "philosophy": "Filosofia",
    "psychology": "Psicologia",
    "religion": "Religião",
    "christian science": "Ciência Cristã",
    "science": "Ciência",
    "technology": "Tecnologia",
    "education": "Educação",
    "humor": "Humor",

    // Outros
    "authors, american": "Autores Americanos",
    "antiques & collectibles": "Antiguidades e Colecionáveis",
    "games & activities": "Jogos e Atividades",
    "family & relationships": "Família e Relacionamentos",
    "juvenile nonfiction": "Não-ficção Juvenil",
    "nonfiction": "Não-ficção",
    "women": "Mulheres",
    "entrevistas": "Entrevistas",
    "alchemists": "Alquimistas",
};

export function translateGenre(genre: string): string {
    const key = genre.toLowerCase().trim();
    return genreTranslations[key] ?? genre;
}
