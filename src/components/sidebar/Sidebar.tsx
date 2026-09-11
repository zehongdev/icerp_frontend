import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import {
    LayoutGrid,
    Boxes,
    ShoppingCart,
    FileText,
    Building2,
    Users,
    ReceiptText,
    Settings,
} from 'lucide-react'
import { useLanguage } from '../../app/providers/useLanguage'
// import './Sidebar.css'
import { SettingsDialog } from '../settings/Settings'

function Sidebar() {
    const { t } = useLanguage()
    const [settingsOpen, setSettingsOpen] = useState(false)

    const menuItems = [
        { label: t('dashboard'), to: '/', icon: LayoutGrid },
        { label: t('inventory'), to: '/inventory', icon: Boxes },
        { label: t('orders'), to: '/orders', icon: ShoppingCart },
        { label: t('purchase'), to: '/purchase', icon: ReceiptText },
        { label: t('rfq'), to: '/rfq', icon: FileText },
        { label: t('suppliers'), to: '/suppliers', icon: Building2 },
        { label: t('customers'), to: '/customers', icon: Users },

    ]

    return (
        <aside className="flex flex-col justify-between pt-3 pl-4 pr-4 pb-5 bg-linear-to-b from-(--bg-surface) to-(--bg-soft)">
            <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-(--select) text-(--txt-color-primary) cursor-default">I</div>
                <div>
                    <div className="font-bold text-(--txt-color-primary) text-lg">ICERP</div>
                    <div className="text-xs text-(--txt-color-muted)">{t('enterpriseSuite')}</div>
                </div>
            </div>

            <nav className="flex flex-col gap-2.5" aria-label="Sidebar navigation">
                {menuItems.map((item) => {
                    const Icon = item.icon

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 transition-colors ${isActive
                                    ? 'bg-(--select) text-white'
                                    : 'text-(--txt-color-secondary) hover:bg-(--select)/30 hover:text-(--txt-color-primary)'
                                }`
                            }
                        // className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg hover:bg-(--bg-panel) ${isActive ? 'bg-(--bg-panel)' : ''}`}
                        >
                            <span className="nav-item-icon"><Icon size={16} /></span>
                            <span>{item.label}</span>
                        </NavLink>
                    )
                })}
            </nav>

            <div className="flex items-center justify-between gap-2.5 px-2 text-(--txt-color-muted) text-sm">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-(--bg-panel) px-3 py-1.5 hover:text-(--txt-color-primary) transition-colors"
                    aria-label="System settings"
                    onClick={() => setSettingsOpen(true)}>
                    <Settings size={14} />
                    <span>{t('settings') ?? 'Settings'}</span>
                </button>
                <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
                <span>v1.0.0</span>
            </div>
        </aside>
    )
}

export default Sidebar
