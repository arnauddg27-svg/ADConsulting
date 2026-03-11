import { Quote } from "lucide-react";
import Container from "@/components/ui/Container";
import { TESTIMONIALS } from "@/lib/constants";

export default function Testimonials() {
  if (TESTIMONIALS.length === 0) {
    return null;
  }

  return (
    <section className="section-space">
      <Container>
        <div className="text-center">
          <span className="eyebrow">Results</span>
          <h2 className="mx-auto mt-5 max-w-3xl font-heading text-4xl leading-[0.95] tracking-[0.04em] text-slate-50 sm:text-5xl">
            What clients say once the numbers get easier to trust.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.quote}
              className="panel-soft relative overflow-hidden p-7 md:p-8"
            >
              <div className="absolute -right-2 -top-2 text-accent-500/10">
                <Quote size={80} />
              </div>
              <div className="relative">
                <p className="text-lg leading-8 text-slate-100">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 border-t border-white/[0.06] pt-5">
                  <div className="text-sm font-semibold text-slate-50">
                    {testimonial.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {testimonial.title}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
