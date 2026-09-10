import { useEffect } from "react";
import { useLocation } from "react-router";

import { trackPageView } from "../../lib/analytics";

export default function PageViewTracker() {
    const location = useLocation();

    useEffect(() => {
        void trackPageView(location.pathname);
    }, [location.pathname]);

    return null;
}
