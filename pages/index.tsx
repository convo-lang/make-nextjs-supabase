import React, { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import {
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    FileText,
    CheckCircle2,
    Archive,
    Share2,
    Download,
    Users,
    Sparkles,
} from "lucide-react";

type Slide = {
    id: string;
    title: string;
    blurb: string;
    icon: React.ComponentType<{ className?: string }>;
    points: string[];
};

const SLIDES: Slide[] = [
    {
        id: "markdown",
        title: "Capture rich task details with Markdown",
        blurb: "Write clearly with edit and preview modes for every task.",
        icon: FileText,
        points: ["Live preview", "Headings, lists, code", "Readable exports"],
    },
    {
        id: "focus",
        title: "Stay focused with complete and archive workflows",
        blurb: "Finish work and keep dashboards tidy as tasks move forward.",
        icon: CheckCircle2,
        points: ["Mark complete", "Archive for later", "Clear status badges"],
    },
    {
        id: "share",
        title: "Share and export as Markdown",
        blurb: "Send teammates a link or download tasks as .md files.",
        icon: Share2,
        points: ["One-click share link", "Download .md", "Print-friendly prose"],
    },
    {
        id: "multi",
        title: "Multi-tenant accounts with roles and invites",
        blurb: "Bring your org together with roles, invites, and account switching.",
        icon: Users,
        points: ["Admin, manager, default", "Invite via link", "Switch accounts"],
    },
];

function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onChange = () => setReduced(mq.matches);
        onChange();
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, []);
    return reduced;
}

export default function LandingPage() {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [focusWithin, setFocusWithin] = useState(false);
    const reduced = usePrefersReducedMotion();
    const hoverRef = useRef(false);
    const total = SLIDES.length;

    const next = () => setIndex((i) => (i + 1) % total);
    const prev = () => setIndex((i) => (i - 1 + total) % total);
    const goto = (i: number) => setIndex(((i % total) + total) % total);

    useEffect(() => {
        if (paused || focusWithin || reduced) return;
        const id = window.setInterval(next, 5000);
        return () => window.clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paused, focusWithin, reduced, total]);

    const onMouseEnter = () => {
        hoverRef.current = true;
        setPaused(true);
    };
    const onMouseLeave = () => {
        hoverRef.current = false;
        setPaused(false);
    };
    const onFocusCapture = () => setFocusWithin(true);
    const onBlurCapture = (e: React.FocusEvent) => {
        // If focus leaves the carousel entirely, resume (unless hovered)
        const currentTarget = e.currentTarget as HTMLElement;
        if (!currentTarget.contains(e.relatedTarget as Node)) {
            setFocusWithin(false);
        }
    };

    const slide = useMemo(() => SLIDES[index], [index]);

    return (
        <div className="page--LandingPage">
            {/* HERO CAROUSEL */}
            <section className="bg-app">
                <div className="app-container section-pad">
                    <div
                        className="relative rounded-xl surface-gradient p-6 md:p-10 overflow-hidden"
                        aria-roledescription="carousel"
                        aria-label="Task Bee value highlights"
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onFocusCapture={onFocusCapture}
                        onBlurCapture={onBlurCapture}
                    >
                        {/* Subtle decorative brand frame */}
                        <div className="absolute inset-0 pointer-events-none opacity-10">
                            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-[color:var(--mustard)] to-[color:var(--light-blue)] blur-3xl" />
                            <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-gradient-to-tr from-[color:var(--forest-green)] to-[color:var(--light-blue)] blur-3xl" />
                        </div>

                        {/* Header row with logo and pause/play */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Logo className="w-8 h-8" />
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                    Task Bee
                                </h1>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="btn-icon"
                                    aria-label="Previous slide"
                                    onClick={prev}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    className="btn-icon"
                                    aria-label={paused ? "Resume autoplay" : "Pause autoplay"}
                                    onClick={() => setPaused((p) => !p)}
                                >
                                    {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                                </button>
                                <button
                                    className="btn-icon"
                                    aria-label="Next slide"
                                    onClick={next}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Slide content */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                            <div>
                                <div className="flex items-center gap-3">
                                    <slide.icon className="w-8 h-8 text-[color:var(--forest-green)]" />
                                    <p className="text-sm text-zinc-600">
                                        Light-hearted task management for teams
                                    </p>
                                </div>
                                <h2
                                    className="mt-3 text-3xl md:text-5xl font-extrabold leading-tight"
                                    aria-live="polite"
                                >
                                    {slide.title}
                                </h2>
                                <p className="mt-3 text-zinc-700 max-w-prose">
                                    {slide.blurb}
                                </p>
                                <ul className="mt-4 text-zinc-700 space-y-1">
                                    {slide.points.map((p, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--forest-green)]" />
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    {/* Primary CTA uses brand background — single most important action */}
                                    <a href="/register" className="btn-primary">
                                        Get started
                                    </a>
                                    <a href="#features" className="btn-secondary">
                                        See features
                                    </a>
                                    <a href="/sign-in" className="btn-ghost">
                                        Sign in
                                    </a>
                                </div>
                            </div>

                            {/* Visual frame */}
                            <div
                                className={[
                                    "brand-frame rounded-xl p-4 md:p-6",
                                    reduced ? "" : "transition-opacity duration-500",
                                ].join(" ")}
                                style={{ opacity: 1 }}
                            >
                                <div className="card bg-surface-soft">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-[color:var(--forest-green)]" />
                                        <span className="text-sm text-zinc-700">
                                            Preview of Task Bee UI
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-2 text-sm text-zinc-600">
                                        <div className="rounded-md border border-zinc-200 p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                <span>Markdown editor</span>
                                            </div>
                                            <span className="badge">Edit</span>
                                        </div>
                                        <div className="rounded-md border border-zinc-200 p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Mark complete</span>
                                            </div>
                                            <span className="badge--success">Done</span>
                                        </div>
                                        <div className="rounded-md border border-zinc-200 p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Archive className="w-4 h-4" />
                                                <span>Archive to tidy</span>
                                            </div>
                                            <span className="badge">Archived</span>
                                        </div>
                                        <div className="rounded-md border border-zinc-200 p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Share2 className="w-4 h-4" />
                                                <span>Share link</span>
                                            </div>
                                            <span className="text-xs text-zinc-500">/task/abc123</span>
                                        </div>
                                        <div className="rounded-md border border-zinc-200 p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Download className="w-4 h-4" />
                                                <span>Export .md</span>
                                            </div>
                                            <span className="text-xs text-zinc-500">task.md</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pagination dots */}
                        <div className="mt-6 flex items-center justify-center gap-2">
                            {SLIDES.map((s, i) => (
                                <button
                                    key={s.id}
                                    className={[
                                        "h-2.5 rounded-full transition-all",
                                        i === index ? "w-6 bg-zinc-800" : "w-2.5 bg-zinc-300 hover:bg-zinc-400",
                                    ].join(" ")}
                                    aria-label={`Go to slide ${i + 1}: ${s.title}`}
                                    aria-current={i === index ? "true" : "false"}
                                    onClick={() => goto(i)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" className="page-container section-pad">
                <div className="app-container">
                    <div className="page-stack items-center text-center">
                        <h3 className="text-2xl md:text-3xl font-bold">What you can do</h3>
                        <p className="text-zinc-600 max-w-2xl">
                            Capture, organize, complete, and archive tasks — with rich Markdown and simple sharing.
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <article className="card card--hover">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[color:var(--forest-green)]" />
                                <h4 className="font-semibold">Add tasks with details</h4>
                            </div>
                            <p className="mt-2 text-zinc-600">
                                Create tasks and write context in Markdown with edit and preview.
                            </p>
                        </article>

                        <article className="card card--hover">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-[color:var(--forest-green)]" />
                                <h4 className="font-semibold">Complete</h4>
                            </div>
                            <p className="mt-2 text-zinc-600">
                                Mark tasks done to keep everyone aligned and move forward.
                            </p>
                        </article>

                        <article className="card card--hover">
                            <div className="flex items-center gap-2">
                                <Archive className="w-5 h-5 text-[color:var(--forest-green)]" />
                                <h4 className="font-semibold">Archive</h4>
                            </div>
                            <p className="mt-2 text-zinc-600">
                                Keep dashboards focused while preserving history.
                            </p>
                        </article>

                        <article className="card card--hover">
                            <div className="flex items-center gap-2">
                                <Download className="w-5 h-5 text-[color:var(--forest-green)]" />
                                <h4 className="font-semibold">Download .md</h4>
                            </div>
                            <p className="mt-2 text-zinc-600">
                                Export tasks as Markdown for docs, reviews, or sharing.
                            </p>
                        </article>

                        <article className="card card--hover">
                            <div className="flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-[color:var(--forest-green)]" />
                                <h4 className="font-semibold">Share links</h4>
                            </div>
                            <p className="mt-2 text-zinc-600">
                                Share a direct link to any task detail page with teammates.
                            </p>
                        </article>

                        <article className="card brand-border-thin card--hover">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-[color:var(--forest-green)]" />
                                <h4 className="font-semibold">Multi-tenant + roles</h4>
                            </div>
                            <p className="mt-2 text-zinc-600">
                                Invite users and manage roles across accounts — switch seamlessly.
                            </p>
                        </article>
                    </div>

                    {/* brand frame testimonial */}
                    <div className="mt-8 card brand-border-thin">
                        <div className="flex items-start gap-3">
                            <div className="avatar w-10 h-10">
                                <div className="w-full h-full rounded-full bg-zinc-100 flex items-center justify-center">
                                    <Logo className="w-5 h-5" />
                                </div>
                            </div>
                            <div>
                                <p className="text-zinc-700">
                                    “Task Bee keeps our tasks clear and readable. Markdown preview is a hit.”
                                </p>
                                <p className="text-sm text-zinc-500 mt-1">— A happy team</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="page-container section-pad">
                <div className="app-container">
                    <div className="page-stack items-center text-center">
                        <h3 className="text-2xl md:text-3xl font-bold">How it works</h3>
                        <p className="text-zinc-600 max-w-2xl">
                            Get started in minutes — register, create tasks, and collaborate.
                        </p>
                    </div>

                    <ol className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <li className="card">
                            <div className="text-sm text-zinc-600">Step 1</div>
                            <h4 className="font-semibold mt-1">Register your account</h4>
                            <p className="mt-2 text-zinc-700">
                                Create your organization and invite teammates via a link.
                            </p>
                            <div className="mt-4">
                                <a className="btn-primary" href="/register">Get started</a>
                            </div>
                        </li>
                        <li className="card">
                            <div className="text-sm text-zinc-600">Step 2</div>
                            <h4 className="font-semibold mt-1">Create tasks in Markdown</h4>
                            <p className="mt-2 text-zinc-700">
                                Use edit and preview to write clear, structured details.
                            </p>
                            <div className="mt-4">
                                <a className="btn-secondary" href="#features">See features</a>
                            </div>
                        </li>
                        <li className="card">
                            <div className="text-sm text-zinc-600">Step 3</div>
                            <h4 className="font-semibold mt-1">Share and collaborate</h4>
                            <p className="mt-2 text-zinc-700">
                                Share task links, complete work, and archive to stay focused.
                            </p>
                            <div className="mt-4">
                                <a className="btn-ghost" href="/sign-in">Sign in</a>
                            </div>
                        </li>
                    </ol>
                </div>
            </section>
        </div>
    );
}