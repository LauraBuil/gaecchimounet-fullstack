const orderSteps = [
    {
        number: "01",
        title: "Commandez en ligne",
        description:
            "Sélectionnez vos légumes disponibles du vendredi au mardi.",
    },
    {
        number: "02",
        title: "Nous préparons",
        description:
            "Nous récoltons et préparons votre commande avec soin.",
    },
    {
        number: "03",
        title: "Récupérez votre panier",
        description:
            "Retirez votre commande directement sur le marché de Trébons ou Laloubère.",
    },
];

function nextFridayLabel(today = new Date()): string {
    const date = new Date(today);
    const daysUntilFriday = (5 - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + daysUntilFriday);

    const formatted = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(date);

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function OrderSection() {
    return (
        <section
            id="commander"
            className="section order-section"
        >
            <div className="container order-section__layout">
                <div className="order-section__content">
                    <p className="eyebrow eyebrow--dark">
                        Simple, local et pratique
                    </p>

                    <h2>Comment commander</h2>

                    <div className="order-section__steps">
                        {orderSteps.map((step) => (
                            <article
                                className="order-step"
                                key={step.number}
                            >
                <span className="order-step__number">
                  {step.number}
                </span>

                                <div>
                                    <h3 className="order-step__title">
                                        {step.title}
                                    </h3>

                                    <p className="order-step__description">
                                        {step.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                <aside className="distribution-card">
          <span className="distribution-card__label">
            Prochaine distribution
          </span>

                    <strong className="distribution-card__date">
                        {nextFridayLabel()}
                    </strong>

                    <p className="distribution-card__description">
                        Les commandes sont ouvertes jusqu’au mardi soir.
                    </p>

                    <a
                        className="button button--primary"
                        href="https://commande.kuupanda.com/producteur/2927/particulier"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Commander maintenant
                    </a>
                </aside>
            </div>
        </section>
    );
}
