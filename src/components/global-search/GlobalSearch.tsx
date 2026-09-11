import * as Dialog from '@radix-ui/react-dialog';
import { ArrowDown, ArrowUp, CornerDownLeft, Search, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchGlobalQuery } from '../../features/search/query';

type SearchRecord = {
    id: string | number;
    title: string;

    subtitle: string;
    index: number;
    path: string;

    tag: string;

};
const totalMap = {
    RFQ: {
        key: "inquiries",
        path: "/rfq"
    },
    Supplier: {
        key: "suppliers",
        path: "/suppliers"
    },
} as const;

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const { data, isLoading } = useSearchGlobalQuery(query);
    const searchResults = useMemo<SearchRecord[]>(() => {
        if (!data) {
            return [];
        }
        const records: SearchRecord[] = [];
        data.results.inquiries.forEach(item => {
            records.push({
                id: item.id,
                title: item.part_number,
                subtitle:
                    `${item.brand || ""}
                 ${item.package || ""}`,
                index: records.length,
                path: `/rfq`,
                tag: "RFQ"
            });
        });
        // 供应商
        data.results.suppliers.forEach(item => {
            records.push({
                id: item.id,
                title: item.name,
                subtitle: ` ${item.status}`,
                index: records.length,
                path: `/suppliers`,
                tag: "Supplier"
            });
        });
        return records;
    }, [data]);


    const filteredResults = useMemo(() => {
        // return searchResults.slice(0, 20);
        return searchResults;
    }, [
        searchResults
    ]);

    useEffect(() => {
        setActiveIndex((current) => {
            if (!filteredResults.length) {
                return 0;
            }
            return Math.min(current, filteredResults.length - 1);
        });
    }, [filteredResults]);

    const groupedResults = useMemo(() => {
        const groups = new Map<string, SearchRecord[]>();

        filteredResults.forEach((item) => {
            const bucket = groups.get(item.tag) ?? [];
            bucket.push(item);
            groups.set(item.tag, bucket);
        });

        return [...groups.entries()];
    }, [filteredResults]);

    const handleNavigate = useCallback((path: string) => {
        onOpenChange(false);
        navigate(path);
    }, [onOpenChange, navigate]);

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                onOpenChange(true);
            }
        };

        window.addEventListener('keydown', handleShortcut);
        return () => {
            window.removeEventListener('keydown', handleShortcut);
        };
    }, [onOpenChange]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setActiveIndex(0);
            return;
        }

        const timer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 80);

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onOpenChange(false);
                return;
            }

            if (!filteredResults.length) {
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((current) => (current + 1) % filteredResults.length);
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((current) => (current - 1 + filteredResults.length) % filteredResults.length);
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                const selected = filteredResults[activeIndex];
                if (selected) {
                    handleNavigate(selected.path);
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onOpenChange, filteredResults, activeIndex, handleNavigate]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs" />

                <Dialog.Content
                    className="fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] min-h-45 w-[min(94vw,680px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-white/10 bg-(--bg-panel-alt) shadow-2xl outline-none"
                    aria-describedby={undefined}
                >
                    <div className="flex h-12 items-center gap-3 border-b border-white/10 px-4">
                        <Search className="size-4 shrink-0 text-white/70" aria-hidden="true" />
                        <input
                            ref={inputRef}
                            className="min-w-0 flex-1 border-0 bg-transparent text-xs text-white/95 outline-none placeholder:text-white/50"
                            type="text"
                            placeholder="搜索订单、客户、供应商、库存、采购..."
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        <kbd className="inline-flex h-5.5 min-w-9.5 items-center justify-center rounded-md border border-white/10 bg-white/5 px-2 text-[10px] leading-none text-white/75">
                            ESC
                        </kbd>
                    </div>

                    <div className="scrollbar-none flex min-h-30 max-h-122.5 flex-1 items-start justify-center overflow-y-auto px-4 py-4">
                        {
                            isLoading && query.trim().length >= 2 ? (
                                <div className="flex min-h-25 w-full items-center justify-center text-center text-[13px] leading-6 tracking-wide text-(--txt-color-muted)">
                                    搜索中...
                                </div>
                            ) : groupedResults.length > 0 ? (
                                <div className="flex w-full flex-col gap-3">
                                    {groupedResults.map(([tag, items]) => (
                                        <div key={tag} className="flex flex-col gap-2">
                                            <div className="px-1 text-[9px] uppercase tracking-[0.14em] text-white/55">{tag}</div>
                                            <ul className="m-0 flex w-full list-none flex-col gap-2 p-0">
                                                {items.map((item) => {
                                                    const itemIndex = item.index;
                                                    const isActive = itemIndex === activeIndex;

                                                    return (
                                                        <li
                                                            key={`${item.tag}-${item.id}`}
                                                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors ${isActive
                                                                ? 'border-(--select)/60 bg-(--select) text-(--txt-color-primary)'
                                                                : 'border-transparent bg-white/2 hover:border-(--border) hover:bg-white/5'
                                                                }`}
                                                            onClick={() => handleNavigate(item.path)}
                                                            onMouseEnter={() => setActiveIndex(itemIndex)}
                                                        >
                                                            <div className="min-w-0 overflow-hidden">
                                                                <strong className="block text-[13px] font-semibold text-(--text)">{item.title}</strong>
                                                                <small className="mt-0.5 block truncate text-[11px] text-(--muted)">{item.subtitle}</small>
                                                            </div>
                                                            <span className="inline-flex h-5.5 min-w-12.5 shrink-0 items-center justify-center rounded-full border border-(--border) bg-white/5 px-2 text-[10px] text-white/70">
                                                                {item.tag}
                                                            </span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            {data && (() => {
                                                const key = totalMap[tag as keyof typeof totalMap]?.key;
                                                const path = totalMap[tag as keyof typeof totalMap]?.path;
                                                if (!key) return null;
                                                const total = data.totals[key];
                                                if (total > items.length) {
                                                    return (
                                                        <div className="flex cursor-pointer items-center gap-1 px-3 py-2 text-xs text-slate-400 transition-colors hover:text-(--accent)" onClick={() => {
                                                            handleNavigate(`/${path}`);
                                                        }}>
                                                            <span>查看全部 {total} 条</span> <ArrowRight size={12} />
                                                        </div>
                                                    )
                                                } return null
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            ) : query.trim().length >= 2 ? (
                                <div className="flex min-h-25 w-full items-center justify-center text-center text-[13px] leading-6 tracking-wide text-(--txt-color-muted)">
                                    没有找到 "{query}" 相关结果
                                </div>
                            ) : (
                                <div className="flex min-h-25 w-full items-center justify-center text-center text-[13px] leading-6 tracking-wide text-(--txt-color-muted)">
                                    输入关键字以搜索型号、单号、客户、供应商等
                                </div>
                            )}
                    </div>

                    <div className="flex h-8.5 items-center justify-between gap-3 border-t border-white/10 px-3 text-[10px] text-white/70">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex min-h-5.5 items-center justify-center gap-1.5 px-2 text-[10px] leading-none text-white/70" aria-label="Move selection up and down">
                                <ArrowUp size={11} />
                                <ArrowDown size={11} />
                                <span>切换</span>
                            </span>
                            <span className="inline-flex min-h-5.5 items-center justify-center gap-1.5 px-2 text-[10px] leading-none text-white/70" aria-label="Open selected item">
                                <CornerDownLeft size={11} />
                                <span>打开</span>
                            </span>
                        </div>

                        <div className="text-[10px] text-white/60">{filteredResults.length} 条结果</div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}