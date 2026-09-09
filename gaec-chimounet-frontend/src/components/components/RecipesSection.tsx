import { fetchPublishedRecipes } from "../../api/recipes";
import { useAsyncData } from "../../hooks/useAsyncData";
import RecipeCard from "./RecipeCard";

export default function RecipesSection() {
    const { data, isLoading, error } = useAsyncData(fetchPublishedRecipes);

    const recipes = data ?? [];

    // Une section d'accueil vide n'apporte rien : on la retire complètement
    // plutôt que d'afficher un bloc « aucune recette » au visiteur.
    if (!isLoading && !error && recipes.length === 0) {
        return null;
    }

    return (
        <section id="recettes" className="section recipes-section">
            <div className="container">
                <header className="section-heading">
                    <div>
                        <p className="eyebrow eyebrow--dark">En cuisine !</p>

                        <h2>Nos idées recettes</h2>
                    </div>

                    <div className="section-heading__aside">
                        <p>Des recettes simples, généreuses et de saison.</p>

                        <a href="/recettes">
                            Toutes les recettes
                            <span aria-hidden="true">→</span>
                        </a>
                    </div>
                </header>

                {isLoading && <p className="section-state">Chargement des recettes…</p>}

                {error && (
                    <p className="section-state section-state--error">
                        Les recettes n’ont pas pu être chargées.
                    </p>
                )}

                {!isLoading && !error && (
                    <div className="recipes-section__grid">
                        {recipes.slice(0, 3).map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}