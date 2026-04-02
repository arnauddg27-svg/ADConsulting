"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    /* Fallback: if IntersectionObserver hasn't fired after 1.5s, show everything */
    const fallback = setTimeout(() => {
      elements.forEach((el) => el.classList.add("visible"));
    }, 1500);

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

    elements.forEach((el) => observer.observe(el));

    return () => {
      clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return null;
}
