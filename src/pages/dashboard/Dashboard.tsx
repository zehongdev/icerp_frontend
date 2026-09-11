import { useLanguage } from '../../app/providers/useLanguage'

function DashboardPage() {
  const { t, language } = useLanguage()

  const statCards = [
    { label: t('totalOrders'), value: '1,248', hint: '+12.5%' },
    { label: t('revenue'), value: '$86.4K', hint: '+8.1%' },
    { label: t('openTasks'), value: '36', hint: language === 'zh' ? '今天 6 个到期' : '6 due today' },
  ]

  // const recentList = [
  //   { name: 'RFQ-2041', desc: language === 'zh' ? 'PCB 组装的供应商询价' : 'Supplier request for PCB assembly', status: t('inReview') },
  //   { name: 'ORD-8892', desc: language === 'zh' ? '新的采购订单已批准' : 'New purchase order approved', status: t('completed') },
  //   { name: 'SUP-118', desc: language === 'zh' ? '供应商入驻清单' : 'Vendor onboarding checklist', status: t('pending') },
  // ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          {/* <p className="uppercase tracking-[0.08em] text-[0.7rem] text-(--txt-color-muted)">{t('overview')}</p> */}
          <h1 className='text-(--txt-color-primary) text-[clamp(1.8rem,2vw,2.4rem)]'>{t('dashboard')}</h1>
        </div>
        {/* <button type="button" className="dashboard-primary-button">{t('newReport')}</button> */}
      </div>

      <section className="grid grid-cols-3 gap-4.5">
        {statCards.map((item) => (
          <article className="flex flex-col gap-2 p-4 border border-(--border-color) bg-(--bg-panel) rounded-lg shadow-(--shadow)" key={item.label}>
            <span className="text-(--txt-color-muted) text-sm">{item.label}</span>
            <strong className="text-[clamp(1.4rem,2vw,2rem)]">{item.value}</strong>
            <span className="text-green-300/80">{item.hint}</span>
          </article>
        ))}
      </section>

      {/* <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>{t('recentActivity')}</h2>
            <button type="button" className="dashboard-link-button">{t('viewAll')}</button>
          </div>

          <ul className="dashboard-list">
            {recentList.map((item) => (
              <li key={item.name} className="dashboard-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.desc}</p>
                </div>
                <span className="dashboard-badge">{item.status}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>{t('teamNotes')}</h2>
            <button type="button" className="dashboard-link-button">{t('add')}</button>
          </div>

          <div className="dashboard-note">
            <h3>{t('inventoryCheck')}</h3>
            <p>{t('warehouseNote')}</p>
          </div>
          <div className="dashboard-note muted">
            <h3>{t('supplierFollowUp')}</h3>
            <p>{t('deliveryNote')}</p>
          </div>
        </article>
      </section> */}
    </div>
  )
}

export default DashboardPage
