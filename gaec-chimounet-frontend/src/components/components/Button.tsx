// React & React Router
import {Link} from "react-router";

// Types
interface Button {
    textButton: string
    href?: string
}

export default function Button({textButton}: Button) {
    return (
        <Link className="button" to="https://commande.kuupanda.com/producteur/2927/particulier" target="_blank" rel="noopener noreferrer">
            {textButton}
        </Link>
    )
}
