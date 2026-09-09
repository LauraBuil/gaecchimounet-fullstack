import { fetchPublishedMeetingPoints } from "../../api/meetingPoints";
import { useAsyncData } from "../../hooks/useAsyncData";

export default function MeetingPoints() {
    const { data, isLoading, error } = useAsyncData(fetchPublishedMeetingPoints);

    const meetingPoints = data ?? [];

    if (!isLoading && !error && meetingPoints.length === 0) {
        return null;
    }

    return (
        <section className="section meeting-section">
            <div className="container">
                <header className="section-heading">
                    <div>
                        <p className="eyebrow eyebrow--dark">
                            Retrouvez-nous aussi sur
                        </p>

                        <h2>Nos points de distribution</h2>
                    </div>

                    <p className="meeting-section__introduction">
                        Plusieurs rendez-vous sont proposés dans la semaine pour
                        récupérer ou acheter nos légumes.
                    </p>
                </header>

                {isLoading && <p className="section-state">Chargement…</p>}

                {error && (
                    <p className="section-state section-state--error">
                        Les points de distribution n’ont pas pu être chargés.
                    </p>
                )}

                {!isLoading && !error && (
                    <div className="meeting-section__grid">
                        {meetingPoints.map((point, index) => (
                            <article className="meeting-card" key={point.id}>
                                <span className="meeting-card__number">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <div>
                                    <h3>{point.title}</h3>
                                    <strong>{point.schedule}</strong>
                                    <p>{point.location}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}