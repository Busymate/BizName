import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ReleaseBanner from './ReleaseBanner';
import BottomTabBar from './BottomTabBar';
import '../styles/Sidebar.css';

export default function DashboardLayout({ children }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  // Close the "More" drawer whenever the route changes (tapping a link
  // inside it, or navigating via browser back/forward).
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  return (
    <div className="bn-app-layout">
      {/* On desktop this renders as the permanent left sidebar. Below
          900px it becomes the slide-in "More" drawer, opened from the
          bottom tab bar's More tab — sliding in from the side, not
          dropping down from the top. */}
      <Sidebar open={moreOpen} onClose={() => setMoreOpen(false)} />
      <div className="bn-app-content">
        {children}
      </div>
      <ReleaseBanner />
      <BottomTabBar onMoreClick={() => setMoreOpen((o) => !o)} moreActive={moreOpen} />
    </div>
  );
}
