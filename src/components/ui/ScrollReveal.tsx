"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    /* Add will-animate class first (enables opacity:0), then observe.
       Content is visible by default in CSS — only hidden after JS loads. */
    elements.forEach((el) => {
      el.classList.add("will-animate");
      observer.observe(el);
    });

    /* Trigger immediately for elements already in viewport */
    requestAnimationFrame(() => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add("visible");
        }
      });
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
