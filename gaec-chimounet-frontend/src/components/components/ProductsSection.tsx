import { Link } from "react-router";

import { fetchKuupandaProducts } from "../../api/kuupanda";
import { useAsyncData } from "../../hooks/useAsyncData";
import ProductCard from "./ProductCard";

export default function ProductsSection() {
    const { data, isLoading, error } = useAsyncData(fetchKuupandaProducts);

    const products = data ?? [];

    if (!isLoading && !error && products.length === 0) {
        return null;
    }

    return (
        <section id="legumes" className="section products-section">
            <div className="container">
                <header className="section-heading">
                    <div>
                        <h2>Nos légumes</h2>
                    </div>

                    <div className="section-heading__aside">
                        <p>
                            Des produits frais, cultivés en pleine terre et récoltés à
                            maturité pour préserver leur goût.
                        </p>

                        <Link to="/produits">
                            Voir tous nos produits
                            <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </header>

                {isLoading && <p className="section-state">Chargement des produits…</p>}

                {error && (
                    <p className="section-state section-state--error">
                        Les produits n’ont pas pu être chargés.
                    </p>
                )}

                {!isLoading && !error && (
                    <div className="products-section__grid">
                        {products.filter((product) => product.isAvailable).slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
