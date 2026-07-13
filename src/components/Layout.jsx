import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="bn-app-shell">
      <Navbar />
      <main className="bn-main">{children}</main>
      <Footer />
    </div>
  );
}
