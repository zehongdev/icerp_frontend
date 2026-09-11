import * as Popover from "@radix-ui/react-popover"
import { Bell, CheckCheck } from "lucide-react"

export function NotificationMenu() {
    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex size-10 items-center justify-center rounded-lg text-(--txt-color-secondary) transition-colors hover:bg-(--bg-panel) hover:text-(--txt-color-primary)"
                >
                    <Bell size={17} aria-hidden="true" />
                    <span className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-(--destructive) ring-2 ring-(--bg-surface)" />
                </button>
            </Popover.Trigger>
            <Popover.Content
                side="bottom"
                align="end"
                sideOffset={8}
                className="z-50 w-100 overflow-hidden rounded-xl border border-white/10 bg-(--bg-panel) shadow-xl outline-none"
            >
                <div className="flex items-center justify-between border-b border-(--border-color) px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-(--txt-color-primary)">通知</span>
                        <span className="rounded-full bg-(--destructive)/10 px-2 py-0.5 text-[11px] font-medium text-(--color-destructive)">
                            1 未读
                        </span>
                    </div>
                    <button
                        type="button"
                        className="flex items-center gap-1 px-1.5 py-1 text-(--txt-color-muted) transition-colors  hover:text-(--txt-color-primary)"
                    >
                        <CheckCheck size={15} aria-hidden="true" />
                        <span className="text-xs">全部已读</span>
                    </button>
                </div>
                <div className="max-h-[20vh] overflow-y-auto p-2">
                    <p className="px-3 py-10 text-center text-sm text-(--muted)">暂无通知</p>
                </div>
            </Popover.Content>
        </Popover.Root>
    )
}