// Components
import Hero from "../components/Hero";
import ProductsSection from "../components/ProductsSection";
import OrderSection from "../components/order/OrderSection";
import RecipesSection from "../components/RecipesSection";
import MeetingPoints from "../components/MeetingPoints.tsx";
// import CircleCommands from "../adds/CircleCommands.tsx"

export default function HomePage() {
    return (
            <>
                <Hero />
                <ProductsSection />
                <MeetingPoints />
                <OrderSection />
                <RecipesSection />
            </>
    )
}