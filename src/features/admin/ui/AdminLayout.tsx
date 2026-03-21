import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router';
import {
  LayoutDashboard,
  Mic,
  Edit3,
  Users,
  UserRound,
  Settings,
  LogOut,
  Menu,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Mic, label: 'Clips', path: '/admin/clips' },
  { icon: Edit3, label: 'Corrections', path: '/admin/corrections' },
  { icon: UserRound, label: 'Users', path: '/admin/users' },
  { icon: Users, label: 'Contributors', path: '/admin/contributors' },
  { icon: ShieldCheck, label: 'Admins', path: '/admin/admins' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { admin, loading, isAuthenticated, logout } = useAdminAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 text-slate-100 transform transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-900">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-3">
            <Shield className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">Admin Portal</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">OpenShikomori</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-1.5">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-primary text-slate-950'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-900 bg-slate-950">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
              {admin.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs truncate text-white">{admin.email}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">{admin.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-destructive/10 hover:text-destructive transition-all group"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-6 ml-auto">
            <Link
              to="/"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background/50">
          <div className="max-w-7xl mx-auto p-6 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
