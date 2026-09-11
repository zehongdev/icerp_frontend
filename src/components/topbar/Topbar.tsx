
import { useState } from 'react'
import { readAuthSession } from '../../features/auth/session'
import { useNavigate } from 'react-router-dom'
import { useConfirm } from '../alert-dialog/ConfirmDialog'
import { useLanguage } from '../../app/providers/useLanguage'
import { logoutUser } from '../../features/auth/api'
import { toast } from 'sonner'
import { DropdownMenu } from 'radix-ui'

import { Languages, LogOut, Search, UserRound, TerminalSquare } from 'lucide-react'
import { NotificationMenu } from "../notification-menu/notificationMenu"

import { GlobalSearch } from '../global-search/GlobalSearch'


function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false)

  const session = readAuthSession()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const handleLogoutClick = async () => {
    const confirmed = await confirm({
      title: '确认退出登录',
      description: '退出后需要重新登录，当前会话将被清除。',
      confirmText: '退出',
      cancelText: '取消',
      tone: 'default',
    })

    if (!confirmed) {
      return
    }

    try {
      await logoutUser()
      toast.success('退出成功', {
        description: '已安全退出当前登录态。',
      })
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error('退出失败', {
        description: error instanceof Error ? error.message : '退出登录失败，请重试。',
      })
    }
  }

  return (
    <header className="flex items-center justify-end bg-(--bg-surface) px-6">
      <div className="flex items-center gap-2 bg-(--bg-panel) h-10 rounded-lg px-4 focus-within:ring-1 mr-4">
        <Search size={16} className="text-(--muted)" />
        <input
          type="text"
          className="placeholder-(--muted) focus:outline-none w-58"
          placeholder={t('searchPlaceholder')}
          onClick={() => setSearchOpen(true)}
          readOnly />
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      </div>

      <div className="flex gap-4 items-center">
        <NotificationMenu />
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-lg bg-(--bg-panel) text-sm font-medium text-(--txt-color-primary) transition-colors hover:bg-(--bg-panel-strong)"
              aria-label="Open user menu"
            >
              {session?.username?.slice(0, 2).toUpperCase() ?? ''}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-44 rounded-lg border border-white/10 bg-(--bg-panel) p-1 shadow-xl outline-none"
            >
              <DropdownMenu.Item
                onSelect={() => navigate('/profile')}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-(--txt-color-primary) outline-none transition-colors hover:bg-white/5 focus:bg-white/5"
              >
                <UserRound className="size-4" aria-hidden="true" />
                个人资料
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-(--txt-color-primary) outline-none transition-colors hover:bg-white/5 focus:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <Languages className="size-4" aria-hidden="true" />
                  切换语言
                </span>
                <span className="text-xs text-(--txt-color-muted)">
                  {language === 'zh' ? 'EN' : '中文'}
                </span>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
              <DropdownMenu.Item
                onSelect={() => {
                  navigate('/admin')
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-(--txt-color-primary) outline-none transition-colors hover:bg-white/5 focus:bg-white/5"
              >
                <TerminalSquare className="size-4" aria-hidden="true" />
                系统管理
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-white/10" />
              <DropdownMenu.Item
                onSelect={() => {
                  void handleLogoutClick()
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-(--destructive) outline-none transition-colors hover:bg-white/5 focus:bg-white/5"
              >
                <LogOut className="size-4" aria-hidden="true" />
                退出登录
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}

export default Topbar
