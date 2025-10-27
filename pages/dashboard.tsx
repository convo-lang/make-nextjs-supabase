import React, { useMemo, useState } from "react";
import { useAccount, useCurrentUser, useStoreMatchingItems } from "@/lib/hooks";
import { typeDefs, Task as TaskType, Task_insert as TaskInsert } from "@/lib/schema";
import { store } from "@/lib/store";
import { cn } from "@/lib/util";
import { SignInRequired } from "@/components/SignInRequired";
import {
    Plus,
    Search,
    CheckCircle2,
    Archive,
    Trash2,
    Download,
    ExternalLink,
    ArrowDownAZ,
    ArrowUpAZ,
    RefreshCcw,
    ArchiveRestore,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type TaskStatus = "active" | "completed" | "archived";

function slugify(input: string): string {
    return (input || "task")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60) || "task";
}

function stripMarkdown(md?: string): string {
    if (!md) return "";
    let text = md;
    text = text.replace(/`{1,3}[^`]*`{1,3}/g, " "); // inline/backtick code
    text = text.replace(/```[\s\S]*?```/g, " "); // code blocks
    text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, " "); // images
    text = text.replace(/\[[^\]]*\]\([^)]+\)/g, (m) => m.replace(/\[[^\]]*\]\([^)]+\)/, "")); // links
    text = text.replace(/[*_~>#-]+/g, " "); // markdown tokens
    text = text.replace(/\s+/g, " ");
    return text.trim();
}

function excerpt(text: string, maxLen = 140): string {
    const s = stripMarkdown(text);
    if (s.length <= maxLen) return s;
    return s.slice(0, maxLen - 1).trimEnd() + "…";
}

async function downloadMarkdown(task: TaskType) {
    const headerLines = [
        `# ${task.title || "Untitled task"}`,
        "",
        `Status: ${task.status || "active"}`,
        task.updated_at ? `Updated: ${new Date(task.updated_at).toLocaleString()}` : undefined,
        task.completed_at ? `Completed: ${new Date(task.completed_at).toLocaleString()}` : undefined,
        task.archived_at ? `Archived: ${new Date(task.archived_at).toLocaleString()}` : undefined,
        "",
        "---",
        "",
    ].filter(Boolean) as string[];

    const body = task.description_markdown || "";
    const content = headerLines.join("\n") + body;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(task.title)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DashboardPage() {
    const user = useCurrentUser();
    const account = useAccount();

    const [statusFilter, setStatusFilter] = useState<TaskStatus>("active");
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState<"updated_at" | "created_at">("updated_at");
    const [sortDesc, setSortDesc] = useState(true);

    const tasks = useStoreMatchingItems<TaskType>(
        typeDefs.Task,
        account ? { account_id: account.id } : null,
        { orderBy: sortBy, orderByDesc: sortDesc }
    );

    const isLoadingUser = user === null;
    const isGuest = user === undefined;

    const isLoadingAccount = account === null;
    const noAccount = account === undefined && !isLoadingAccount && !isGuest;

    const allTasks = tasks ?? [];
    const counts = useMemo(() => {
        return {
            active: allTasks.filter((t) => (t.status || "active") === "active").length,
            completed: allTasks.filter((t) => t.status === "completed").length,
            archived: allTasks.filter((t) => t.status === "archived").length,
        };
    }, [allTasks]);

    const visibleTasks = useMemo(() => {
        const list = allTasks.filter((t) => (t.status || "active") === statusFilter);
        if (!query.trim()) return list;
        const q = query.toLowerCase();
        return list.filter((t) => {
            return (
                (t.title || "").toLowerCase().includes(q) ||
                (t.description_markdown || "").toLowerCase().includes(q)
            );
        });
    }, [allTasks, statusFilter, query]);

    const onCreateTaskAsync = async () => {
        if (!account || !user) return;
        const now = new Date().toISOString();
        const id = uuidv4();
        const value: TaskInsert = {
            id,
            created_at: now,
            updated_at: now,
            account_id: account.id,
            created_by_user_id: user.id,
            updated_by_user_id: user.id,
            title: "New task",
            status: "active",
            description_markdown: "",
        };
        await store().insertAsync(typeDefs.Task, value);
        window.location.href = `/task/${id}`;
    };

    const onMarkCompleteAsync = async (task: TaskType) => {
        const now = new Date().toISOString();
        await store().updateAsync(typeDefs.Task, task.id, {
            status: "completed",
            completed_at: now,
            updated_at: now,
            updated_by_user_id: user?.id,
        });
    };

    const onReopenAsync = async (task: TaskType) => {
        const now = new Date().toISOString();
        await store().updateAsync(typeDefs.Task, task.id, {
            status: "active",
            completed_at: undefined,
            updated_at: now,
            updated_by_user_id: user?.id,
        });
        setStatusFilter("active");
    };

    const onArchiveAsync = async (task: TaskType) => {
        const now = new Date().toISOString();
        await store().updateAsync(typeDefs.Task, task.id, {
            status: "archived",
            archived_at: now,
            updated_at: now,
            updated_by_user_id: user?.id,
        });
        setStatusFilter("archived");
    };

    const onUnarchiveAsync = async (task: TaskType) => {
        const now = new Date().toISOString();
        await store().updateAsync(typeDefs.Task, task.id, {
            status: "active",
            archived_at: undefined,
            updated_at: now,
            updated_by_user_id: user?.id,
        });
        setStatusFilter("active");
    };

    const onDeleteAsync = async (task: TaskType) => {
        const ok = window.confirm(`Delete “${task.title}”? This cannot be undone.`);
        if (!ok) return;
        await store().deleteAsync(typeDefs.Task, task.id);
    };

    if (isGuest) {
        return (
            <div className="page--DashboardPage">
                <div className="app-container section-pad">
                    <SignInRequired message="Please sign in to view your dashboard." />
                </div>
            </div>
        );
    }

    if (isLoadingUser || isLoadingAccount) {
        return (
            <div className="page--DashboardPage">
                <div className="app-container section-pad">
                    <div className="page-stack">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <button className="btn-primary" disabled>
                                <Plus className="w-4 h-4 mr-2" />
                                New Task
                            </button>
                        </div>
                        <div className="card">
                            <div className="animate-pulse text-zinc-500">Loading tasks…</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (noAccount) {
        return (
            <div className="page--DashboardPage">
                <div className="app-container section-pad">
                    <div className="page-stack">
                        <div className="card">
                            <h2 className="text-xl font-semibold">No workspace found</h2>
                            <p className="text-zinc-600 mt-2">
                                You don’t seem to be a member of any account. Ask an admin to invite you or create a new account.
                            </p>
                            <div className="mt-4">
                                <a className="btn-secondary" href="/account">Go to Account</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page--DashboardPage">
            <header className="app-container section-pad">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-zinc-600">Manage tasks for your team</p>
                    </div>
                    <button className="btn-primary" onClick={onCreateTaskAsync}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                    </button>
                </div>
            </header>

            <section className="page-container">
                <div className="page-stack">
                    <div className="card">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    className={cn(
                                        "btn-ghost",
                                        statusFilter === "active" && "brand-border-thin"
                                    )}
                                    onClick={() => setStatusFilter("active")}
                                >
                                    Active
                                    <span className="ml-2 text-xs text-zinc-600">{counts.active}</span>
                                </button>
                                <button
                                    className={cn(
                                        "btn-ghost",
                                        statusFilter === "completed" && "brand-border-thin"
                                    )}
                                    onClick={() => setStatusFilter("completed")}
                                >
                                    Completed
                                    <span className="ml-2 text-xs text-zinc-600">{counts.completed}</span>
                                </button>
                                <button
                                    className={cn(
                                        "btn-ghost",
                                        statusFilter === "archived" && "brand-border-thin"
                                    )}
                                    onClick={() => setStatusFilter("archived")}
                                >
                                    Archived
                                    <span className="ml-2 text-xs text-zinc-600">{counts.archived}</span>
                                </button>
                            </div>

                            <div className="flex-1" />

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        className="input pl-9 w-64 max-w-[70vw]"
                                        placeholder="Search tasks…"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as "updated_at" | "created_at")}
                                    aria-label="Sort by"
                                >
                                    <option value="updated_at">Last updated</option>
                                    <option value="created_at">Created date</option>
                                </select>

                                <button
                                    className="btn-icon"
                                    aria-label={sortDesc ? "Sort ascending" : "Sort descending"}
                                    onClick={() => setSortDesc((v) => !v)}
                                    title={sortDesc ? "Descending" : "Ascending"}
                                >
                                    {sortDesc ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpAZ className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {tasks === null ? (
                        <div className="card">
                            <div className="animate-pulse text-zinc-500">Loading tasks…</div>
                        </div>
                    ) : visibleTasks.length === 0 ? (
                        <div className="card brand-border-thin">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">No {statusFilter} tasks</h3>
                                    <p className="text-zinc-600">Create a new task to get started.</p>
                                </div>
                                <button className="btn-primary" onClick={onCreateTaskAsync}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Task
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {visibleTasks.map((t) => {
                                const isCompleted = t.status === "completed";
                                const isArchived = t.status === "archived";
                                return (
                                    <article key={t.id} className="card card--hover">
                                        <div className="flex items-start justify-between gap-3">
                                            <a href={`/task/${t.id}`} className="font-semibold hover:underline">
                                                {t.title || "Untitled task"}
                                            </a>
                                            <span className={cn("badge", isCompleted && "badge--success")}>
                                                {isCompleted ? "Completed" : isArchived ? "Archived" : "Active"}
                                            </span>
                                        </div>

                                        {t.description_markdown ? (
                                            <p className="mt-2 text-zinc-600">
                                                {excerpt(t.description_markdown)}
                                            </p>
                                        ) : (
                                            <p className="mt-2 text-zinc-500 italic">No details yet</p>
                                        )}

                                        <div className="mt-4 flex items-center gap-2">
                                            {!isCompleted && !isArchived && (
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => onMarkCompleteAsync(t)}
                                                    title="Mark complete"
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Complete
                                                </button>
                                            )}

                                            {!isArchived && (
                                                <button
                                                    className="btn-ghost"
                                                    onClick={() => onArchiveAsync(t)}
                                                    title="Archive"
                                                >
                                                    <Archive className="w-4 h-4 mr-2" />
                                                    Archive
                                                </button>
                                            )}

                                            {isArchived && (
                                                <button
                                                    className="btn-ghost"
                                                    onClick={() => onUnarchiveAsync(t)}
                                                    title="Unarchive"
                                                >
                                                    <ArchiveRestore className="w-4 h-4 mr-2" />
                                                    Unarchive
                                                </button>
                                            )}

                                            <div className="flex-1" />

                                            <button
                                                className="btn-icon"
                                                aria-label="Open"
                                                title="Open"
                                                onClick={() => (window.location.href = `/task/${t.id}`)}
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                aria-label="Download as Markdown"
                                                title="Download .md"
                                                onClick={() => downloadMarkdown(t)}
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                aria-label="Delete"
                                                title="Delete"
                                                onClick={() => onDeleteAsync(t)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}