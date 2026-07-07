import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function Home() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-edu-50 via-blue-50/60 to-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-edu-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
      >
        <p className="edu-label">Digital Forensic Education</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-edu-900 sm:text-5xl lg:text-6xl">
          Interactive Timeline Reconstruction Tool
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
          Learn to reconstruct browser activity timelines from synthetic forensic
          evidence through hands-on exercises.
        </p>
        <div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <Button to="/cases" variant="primary">
            Start Learning
          </Button>
          <Button variant="secondary" onClick={scrollToAbout}>
            About
          </Button>
          <Button to="/dashboard" variant="secondary">
            Dashboard
          </Button>
        </div>
      </main>

      <section
        id="about"
        className="border-t border-edu-100 bg-white/70 px-4 py-16 backdrop-blur-sm sm:px-6"
        aria-labelledby="about-heading"
      >
        <Card className="mx-auto max-w-2xl text-center">
          <h2 id="about-heading" className="text-2xl font-semibold text-edu-900">
            About
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            This educational tool helps students practice digital forensic
            skills by rebuilding browser timelines from realistic synthetic
            datasets—without handling real case material.
          </p>
        </Card>
      </section>
    </div>
  );
}
