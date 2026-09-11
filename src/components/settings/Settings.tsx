import * as Dialog from '@radix-ui/react-dialog';
import { Bell, Globe, ShieldCheck, Wifi, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLanguage } from '../../app/providers/useLanguage';
type SettingTab = 'general' | 'connection' | 'notification' | 'security';

const tabs: { key: SettingTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'general', label: 'General', icon: Globe },
    { key: 'connection', label: 'Connection', icon: Wifi },
    { key: 'notification', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: ShieldCheck },
];

export function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [activeTab, setActiveTab] = useState<SettingTab>('general');
    const { language, setLanguage } = useLanguage();

    const content = useMemo(() => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="flex flex-col gap-4">
                        {/* <section className="rounded-[10px] border border-white/10 bg-(--bg-panel-alt) p-4">
                            <h3 className="text-sm font-medium text-white">Company profile</h3>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-2 text-xs text-[#dfe3ea]">
                                    <span>Company name</span>
                                    <input
                                        className="h-9 w-full rounded-lg border border-[#2f2f33] bg-[#262325] px-3 text-sm text-white outline-none focus:border-[#5b5b5f]"
                                        defaultValue="ICERP"
                                    />
                                </label>
                                <label className="flex flex-col gap-2 text-xs text-[#dfe3ea]">
                                    <span>Timezone</span>
                                    <select className="h-9 w-full rounded-lg border border-[#2f2f33] bg-[#262325] px-3 text-sm text-white outline-none focus:border-[#5b5b5f]">
                                        <option>Asia/Shanghai</option>
                                        <option>UTC</option>
                                        <option>America/New_York</option>
                                    </select>
                                </label>
                            </div>
                        </section>

                        <section className="rounded-[10px] border border-white/10 bg-(--bg-panel-alt) p-4">
                            <h3 className="text-sm font-medium text-white">Language</h3>
                            <div className="mt-4 flex items-center gap-3 text-xs font-medium">
                                <span className={language === 'en' ? 'text-white' : 'text-[#d8d8db]'}>
                                    English
                                </span>
                                <RadixSwitch.Root
                                    checked={language === 'zh'}
                                    onCheckedChange={(checked) => setLanguage(checked ? 'zh' : 'en')}
                                    aria-label="Switch language"
                                    className="relative h-5 w-10 rounded-full border border-[#3f3f43] bg-white/10 transition-colors data-[state=checked]:border-(--select) data-[state=checked]:bg-(--select)"
                                >
                                    <RadixSwitch.Thumb className="block size-3 translate-x-1 rounded-full bg-white transition-transform data-[state=checked]:translate-x-6" />
                                </RadixSwitch.Root>
                                <span className={language === 'zh' ? 'text-white' : 'text-[#d8d8db]'}>
                                    简体中文
                                </span>
                            </div>
                        </section> */}
                    </div>
                );

            case 'connection':
                return (
                    <div className="flex flex-col gap-4">
                        {/* <section className="rounded-[10px] border border-white/10 bg-[#262325]/40 p-4">
                            <h3 className="text-sm font-medium text-white">API connection</h3>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-2 text-xs text-[#dfe3ea]">
                                    <span>Base URL</span>
                                    <input
                                        className="h-9 w-full rounded-lg border border-[#2f2f33] bg-[#262325] px-3 text-sm text-white outline-none focus:border-[#5b5b5f]"
                                        defaultValue="https://api.icerp.local"
                                    />
                                </label>
                                <label className="flex flex-col gap-2 text-xs text-[#dfe3ea]">
                                    <span>Timeout</span>
                                    <input
                                        className="h-9 w-full rounded-lg border border-[#2f2f33] bg-[#262325] px-3 text-sm text-white outline-none focus:border-[#5b5b5f]"
                                        defaultValue="30s"
                                    />
                                </label>
                            </div>
                        </section>

                        <section className="rounded-[10px] border border-white/10 bg-[#262325]/40 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-medium text-white">Connection test</h3>
                                    <p className="mt-1 text-xs text-gray-400">Check API availability before saving.</p>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-lg border border-[#3b3b40] bg-white/10 px-3 py-2 text-xs font-medium text-slate-100 transition-colors hover:bg-[#323236]"
                                >
                                    Test
                                </button>
                            </div>
                        </section> */}
                    </div>
                );

            case 'notification':
                return (
                    <div className="flex flex-col gap-3">
                        {/* {['System alert', 'RFQ update reminder', 'Supplier data changes'].map((item) => (
                            <div key={item} className="flex items-center justify-between gap-3 rounded-[10px] border border-white/10 bg-[#262325]/40 px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm text-white">{item}</p>
                                    <p className="text-xs text-gray-400">Receive notifications in real time.</p>
                                </div>
                                <button
                                    type="button"
                                    className={`relative h-5 w-10 rounded-full border transition-colors after:absolute after:top-0.75 after:left-1 after:size-3 after:rounded-full after:bg-white after:transition-transform ${item === 'System alert'
                                        ? 'border-blue-500 bg-blue-500 after:translate-x-4.75'
                                        : 'border-[#3f3f43] bg-white/10'
                                        }`}
                                    aria-label={`Toggle ${item}`}
                                >
                                    <span className="sr-only">Toggle</span>
                                </button>
                            </div>
                        ))} */}
                    </div>
                );

            case 'security':
                return (
                    <div className="flex flex-col gap-3">
                        {/* <div className="rounded-[10px] border border-white/10 bg-[#262325]/40 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-gray-200">Auto logout</span>
                                <span className="text-sm text-gray-200">30 min</span>
                            </div>
                        </div>
                        <div className="rounded-[10px] border border-white/10 bg-[#262325]/40 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm text-gray-200">Two-factor auth</span>
                                <span className="inline-flex items-center gap-1 text-xs text-sky-300">
                                    <Check className="size-3.5" /> Enabled
                                </span>
                            </div>
                        </div> */}
                    </div>
                );

            default:
                return null;
        }
    }, [activeTab, language, setLanguage]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" />
                <Dialog.Content
                    aria-describedby={undefined}
                    className="fixed top-1/2 left-1/2 z-50 flex h-[76vh] w-[96vw] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-white/10 bg-(--bg-panel-alt) shadow-2xl outline-none sm:h-[70vh] sm:w-[min(92vw,64rem)]"
                >
                    <div className="flex items-center justify-between border-b border-white/10  px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                            <Dialog.Title className=" font-semibold text-white">Settings</Dialog.Title>
                            <p className="text-xs text-(--txt-color-muted)">Preferences and connectivity</p>
                        </div>

                        <Dialog.Close
                            className="inline-flex size-8 items-center justify-center rounded-lg text-[#d8d7d9] transition-colors hover:bg-white/5 hover:text-white"
                            aria-label="Close settings"
                        >
                            <X className="size-4" aria-hidden="true" />
                        </Dialog.Close>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
                        <nav className="shrink-0 border-b border-white/10 bg-[#2f2c2e] p-3 sm:w-50 sm:border-r sm:border-b-0">
                            <ul className="m-0 flex list-none flex-row gap-1.5 overflow-x-auto p-0 sm:flex-col">
                                {tabs.map(({ key, label, icon: Icon }) => {
                                    const isActive = activeTab === key;

                                    return (
                                        <li key={key}>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab(key)}
                                                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${isActive
                                                    ? 'bg-(--select) text-white'
                                                    : 'text-(--txt-color-secondary) hover:bg-(--select)/30 hover:text-white'
                                                    }`}
                                            >
                                                <Icon className="size-4 shrink-0" />
                                                <span>{label}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>

                        <div className="min-w-0 flex-1 overflow-y-auto p-4">
                            <div className="mb-4">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-[#78777a]">Workspace</p>
                                <h2 className="mt-1 text-xl font-semibold text-white">
                                    {tabs.find((tab) => tab.key === activeTab)?.label}
                                </h2>
                            </div>

                            {content}
                        </div>
                    </div>

                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
