import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import MarkdownIt from "markdown-it";
import { cn } from "@/lib/util";
import {
    useAccount,
    useCurrentUser,
    useUserInfo,
    useFullPage,
    useNoMargins,
    useStoreItem,
} from "@/lib/hooks";
import { store } from "@/lib/store";
import { typeDefs, Task as TaskType, User as UserType } from "@/lib/schema";
import { SignInRequired } from "@/components/SignInRequired";
import {
    Check as CheckIcon,
    Archive as ArchiveIcon,
    Download as DownloadIcon,
    Share2 as ShareIcon,
    Maximize2 as MaximizeIcon,
    Minimize2 as MinimizeIcon,
    Eye as EyeIcon,
    Edit3 as EditIcon,
    Save as SaveIcon,
    Copy as CopyIcon,
    ExternalLink as ExternalLinkIcon,
} from "lucide-react";

type ViewMode = "edit" | "preview";

function formatDate(ts?: string) {
    if (!ts) return "—";
    try {
        const d = new Date(ts);
        return d.toLocaleString();
    } catch {
        return ts;
    }
}

function statusBadge(status?: string) {
    if (!status) return <span className="badge">Unknown</span>;
    if (status === "completed") return <span className="badge--success">Completed</span>;
    if (status === "archived") return <span className="badge">Archived</span>;
    return <span className="badge">Active</span>;
}

export default function TaskDetailPage() {
    const router = useRouter();
    const taskId = Array.isArray(router.query.taskId) ? router.query.taskId[0] : router.query.taskId;

    const userInfo = useUserInfo();
    const user = useCurrentUser();
    const account = useAccount();

    const [full, setFull] = useState(false);
    useFullPage(full);
    useNoMargins(full);

    const task = useStoreItem<TaskType>(typeDefs.Task, taskId);
    const createdBy = useStoreItem<UserType>(typeDefs.User, task?.created_by_user_id ?? undefined, {
        resetOnChange: true,
    });
    const updatedBy = useStoreItem<UserType>(typeDefs.User, task?.updated_by_user_id ?? undefined, {
        resetOnChange: true,
    });

    const [viewMode, setViewMode] = useState<ViewMode>("edit");
    const [title, setTitle] = useState("");
    const [markdown, setMarkdown] = useState("");
    const [saving, setSaving] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const md = useMemo(() => {
        const m = new MarkdownIt({ html: false, linkify: true, breaks: true });
        return m;
    }, []);

    useEffect(() => {
        if (task && task !== null) {
            setTitle(task.title ?? "");
            setMarkdown(task.description_markdown ?? "");
        }
    }, [task?.id]);

    const isLoadingUser = userInfo === null;
    const isGuest = userInfo === undefined;

    const isLoadingTask = task === null;
    const notFound = task === undefined && taskId !== undefined;

    const dirty =
        !!task &&
        (title.trim() !== (task.title ?? "").trim() ||
            (markdown ?? "") !== (task.description_markdown ?? ""));

    async function onSaveAsync() {
        if (!task || !taskId || !user) return;
        setSaving(true);
        try {
            await store().updateAsync<TaskType>(typeDefs.Task, taskId, {
                title: title.trim(),
                description_markdown: markdown ?? "",
                updated_by_user_id: user.id,
            } as Partial<TaskType>);
        } finally {
            setSaving(false);
        }
    }

    async function onMarkCompleteAsync() {
        if (!task || !taskId || !user) return;
        setCompleting(true);
        try {
            if (task.status !== "completed") {
                await store().updateAsync<TaskType>(typeDefs.Task, taskId, {
                    status: "completed",
                    completed_at: new Date().toISOString(),
                    updated_by_user_id: user.id,
                } as Partial<TaskType>);
            }
        } finally {
            setCompleting(false);
        }
    }

    async function onArchiveAsync() {
        if (!task || !taskId || !user) return;
        setArchiving(true);
        try {
            if (task.status !== "archived") {
                await store().updateAsync<TaskType>(typeDefs.Task, taskId, {
                    status: "archived",
                    archived_at: new Date().toISOString(),
                    updated_by_user_id: user.id,
                } as Partial<TaskType>);
            }
        } finally {
            setArchiving(false);
        }
    }

    function onDownloadMd() {
        if (!task) return;
        const created = formatDate(task.created_at);
        const updated = formatDate(task.updated_at);
        const status = task.status ?? "active";
        const header =
            `---\n` +
            `title: ${title || task.title}\n` +
            `status: ${status}\n` +
            `created: ${created}\n` +
            `updated: ${updated}\n` +
            `account_id: ${task.account_id}\n` +
            `task_id: ${task.id}\n` +
            `---\n\n`;
        const body = markdown || task.description_markdown || "";
        const content = `# ${title || task.title}\n\n${header}${body}\n`;
        const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const safeTitle = (title || task.title || "task").replace(/[^\w\d-_]+/g, "-");
        a.download = `${safeTitle}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 1200);
    }

    async function onCopyLinkAsync() {
        const link = `${location.origin}/task/${taskId ?? ""}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // fallback
            const input = document.createElement("input");
            input.value = link;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        }
    }

    if (isLoadingUser) {
        return (
            <div className="page--TaskDetailPage page--full">
                <section className="page-container">
                    <div className="page-stack">
                        <div className="card">
                            <div className="animate-pulse h-6 bg-zinc-200 rounded w-52" />
                            <div className="mt-4 space-y-2">
                                <div className="h-4 bg-zinc-200 rounded w-1/2" />
                                <div className="h-4 bg-zinc-200 rounded w-1/3" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (isGuest) {
        return (
            <div className="page--TaskDetailPage">
                <section className="page-container">
                    <SignInRequired message="You need to sign in to view this task." />
                </section>
            </div>
        );
    }

    return (
        <div className="page--TaskDetailPage page--full">
            <section className="page-container">
                <div className="page-stack">
                    {/* Header: title and actions */}
                    <div className="card">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    {statusBadge(task?.status)}
                                    <input
                                        className="input text-xl font-bold md:text-2xl"
                                        placeholder="Task title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        aria-label="Task title"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        className="btn-primary"
                                        onClick={onMarkCompleteAsync}
                                        disabled={!task || task.status === "completed" || task.status === "archived" || completing}
                                        title="Mark complete"
                                    >
                                        <CheckIcon className="w-4 h-4 mr-2" />
                                        {completing ? "Completing…" : "Mark complete"}
                                    </button>

                                    <button
                                        className="btn-secondary"
                                        onClick={onSaveAsync}
                                        disabled={!task || !dirty || saving}
                                        title="Save changes"
                                    >
                                        <SaveIcon className="w-4 h-4 mr-2" />
                                        {saving ? "Saving…" : "Save"}
                                    </button>

                                    <button
                                        className="btn-secondary"
                                        onClick={onDownloadMd}
                                        disabled={!task}
                                        title="Download as Markdown"
                                    >
                                        <DownloadIcon className="w-4 h-4 mr-2" />
                                        {downloaded ? "Downloaded" : "Download .md"}
                                    </button>

                                    <button
                                        className="btn-ghost"
                                        onClick={onArchiveAsync}
                                        disabled={!task || task.status === "archived" || archiving}
                                        title="Archive task"
                                    >
                                        <ArchiveIcon className="w-4 h-4 mr-2" />
                                        {archiving ? "Archiving…" : "Archive"}
                                    </button>

                                    <button
                                        className="btn-ghost"
                                        onClick={() => setFull((v) => !v)}
                                        title={full ? "Exit full screen" : "Enter full screen"}
                                        aria-label={full ? "Exit full screen" : "Enter full screen"}
                                    >
                                        {full ? (
                                            <MinimizeIcon className="w-4 h-4" />
                                        ) : (
                                            <MaximizeIcon className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="text-sm text-zinc-600 flex flex-wrap gap-x-4 gap-y-1">
                                <div>
                                    Created: <span className="text-zinc-800">{formatDate(task?.created_at)}</span>
                                </div>
                                <div>
                                    Updated: <span className="text-zinc-800">{formatDate(task?.updated_at)}</span>
                                </div>
                                <div>
                                    Owner:{" "}
                                    {createdBy ? (
                                        <a className="link" href={`/profile/${createdBy.id}`}>{createdBy.name}</a>
                                    ) : (
                                        "—"
                                    )}
                                </div>
                                <div>
                                    Last editor:{" "}
                                    {updatedBy ? (
                                        <a className="link" href={`/profile/${updatedBy.id}`}>{updatedBy.name}</a>
                                    ) : (
                                        "—"
                                    )}
                                </div>
                                <div>
                                    Account: <span className="text-zinc-800">{account?.name ?? "—"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading and not found states */}
                    {isLoadingTask && (
                        <div className="card">
                            <div className="animate-pulse h-5 bg-zinc-200 rounded w-36" />
                            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="card bg-surface-soft h-72" />
                                <div className="card h-72" />
                            </div>
                        </div>
                    )}
                    {notFound && (
                        <div className="card">
                            <h2 className="text-xl font-semibold">Task not found</h2>
                            <p className="text-zinc-600 mt-1">The task you’re looking for doesn’t exist or you don’t have access.</p>
                        </div>
                    )}

                    {/* Editor and preview */}
                    {!isLoadingTask && task && (
                        <>
                            {/* Mobile/Tablet tabs */}
                            <div className="card lg:hidden">
                                <div className="flex items-center gap-2">
                                    <button
                                        className={cn("btn-ghost", viewMode === "edit" && "brand-border-thin")}
                                        onClick={() => setViewMode("edit")}
                                    >
                                        <EditIcon className="w-4 h-4 mr-2" />
                                        Edit
                                    </button>
                                    <button
                                        className={cn("btn-ghost", viewMode === "preview" && "brand-border-thin")}
                                        onClick={() => setViewMode("preview")}
                                    >
                                        <EyeIcon className="w-4 h-4 mr-2" />
                                        Preview
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Editor */}
                                <div className={cn(viewMode !== "edit" ? "hidden lg:block" : "block")}>
                                    <div className="card bg-surface-soft">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold">Edit</h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="btn-secondary"
                                                    onClick={onSaveAsync}
                                                    disabled={!dirty || saving}
                                                >
                                                    <SaveIcon className="w-4 h-4 mr-2" />
                                                    {saving ? "Saving…" : "Save"}
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            className="textarea h-[60vh] lg:h-[70vh]"
                                            placeholder="# Details

Add task details in markdown…

- Bulleted lists
- Headings
- Code blocks
- Links"
                                            value={markdown}
                                            onChange={(e) => setMarkdown(e.target.value)}
                                            aria-label="Task details in Markdown"
                                        />
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className={cn(viewMode !== "preview" ? "hidden lg:block" : "block")}>
                                    <div className="card">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold">Preview</h3>
                                            <div className="text-sm text-zinc-600">Rendered Markdown</div>
                                        </div>
                                        <article
                                            className="markdown"
                                            dangerouslySetInnerHTML={{ __html: md.render(markdown || "") }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Share section */}
                            <div className="card brand-border-thin">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <p className="text-zinc-700">Share a link to this task with teammates.</p>
                                    <div className="flex items-center gap-2">
                                        <button className="btn-secondary" onClick={onCopyLinkAsync}>
                                            <CopyIcon className="w-4 h-4 mr-2" />
                                            {copied ? "Copied" : "Copy link"}
                                        </button>
                                        <a className="btn-ghost" href={`/task/${taskId}`} target="_blank" rel="noreferrer">
                                            <ExternalLinkIcon className="w-4 h-4 mr-2" />
                                            Open
                                        </a>
                                    </div>
                                </div>
                                <p className="mt-2 text-sm text-zinc-600 break-all">
                                    {typeof window === "undefined"
                                        ? ""
                                        : `${location.origin}/task/${taskId ?? ""}`}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}