import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from '../../components/sidebar/Sidebar'
import Topbar from '../../components/topbar/Topbar'
import DashboardPage from '../../pages/dashboard/Dashboard'
import OrdersPage from '../../pages/order/Order'
// import NewOrderPage from '../../pages/order/NewOrder'
import RfqPage from '../../pages/rfq/Rfq'
import RfqNewPage from '../../pages/rfq/RfqNew'
import SuppliersPage from '../../pages/supplier/Supplier'
import SupplierNewPage from '../../pages/supplier/SupplierNew'
import CustomersPage from '../../pages/customer/Customer'
// import NewCustomerPage from '../../pages/customer/NewCustomer'
import PurchasePage from '../../pages/purchase/Purchase'
import PurchaseEditPage from '../../pages/purchase/PurchaseEdit'
// import NewPurchasePage from '../../pages/purchase/NewPurchase'
import InventoryPage from '../../pages/inventory/Inventory'
// import NewInventoryPage from '../../pages/inventory/NewInventory'
import ProfilePage from '../../pages/profile/Profile'
import AdminPage from '../../pages/admin/Admin'

function AppLayout() {
  return (
    <div className="grid h-full w-full grid-cols-[240px_minmax(0,1fr)] overflow-hidden bg-(--bg-container)">
      <Sidebar />

      <div className="grid h-full min-w-0 grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-(--bg-container)">
        <Topbar />

        <main className="scrollbar-thin overflow-auto bg-(--bg-container) p-6 text-(--text) [scrollbar-color:rgba(255,255,255,0.22)_transparent] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb:hover]:bg-white/30">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            {/* <Route path="/inventory/new" element={<NewInventoryPage />} /> */}
            <Route path="/orders" element={<OrdersPage />} />
            {/* <Route path="/orders/new" element={<NewOrderPage />} /> */}
            <Route path="/rfq" element={<RfqPage />} />
            <Route path="/rfq/new" element={<RfqNewPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/suppliers/new" element={<SupplierNewPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            {/* <Route path="/customers/new" element={<NewCustomerPage />} /> */}
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/purchase/edit/:id" element={<PurchaseEditPage />} />
            {/* <Route path="/purchase/new" element={<NewPurchasePage />} /> */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/reports" element={<Navigate to="/purchase" replace />} />
            <Route path="/reports/new" element={<Navigate to="/purchase/new" replace />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
