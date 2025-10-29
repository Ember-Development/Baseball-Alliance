import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash, scroll to that element
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Add a small delay to ensure the page has rendered
        setTimeout(() => {
          const y = element.getBoundingClientRect().top + window.scrollY - 80; // 80 is NAV_HEIGHT
          window.scrollTo({ top: y, behavior: "smooth" });
        }, 100);
      }
    } else {
      // No hash, scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [pathname, hash]);

  return null;
}
