import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AOS from 'aos';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import OfflineScreen from './components/OfflineScreen';

// --- Core pages ---
const Home = lazy(() => import('./pages/Home'));
const Tools = lazy(() => import('./pages/Tools'));
const Templates = lazy(() => import('./pages/Templates'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BusinessTips = lazy(() => import('./pages/BusinessTips'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NotFound = lazy(() => import('./pages/NotFound'));

// --- New: auth + payments (added, existing pages/routes untouched) ---
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SavedItems = lazy(() => import('./pages/SavedItems'));
const Customers = lazy(() => import('./pages/Customers'));
const Referrals = lazy(() => import('./pages/Referrals'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Support = lazy(() => import('./pages/Support'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const InvoiceDetails = lazy(() => import('./pages/InvoiceDetails'));
const WhatsNew = lazy(() => import('./pages/WhatsNew'));

// --- Tool pages: fully implemented ---
const InvoiceGenerator = lazy(() => import('./pages/InvoiceGenerator'));
const ReceiptGenerator = lazy(() => import('./pages/ReceiptGenerator'));
const ProfitCalculator = lazy(() => import('./pages/ProfitCalculator'));
const VatCalculator = lazy(() => import('./pages/VatCalculator'));
const DiscountCalculator = lazy(() => import('./pages/DiscountCalculator'));
const PricingCalculator = lazy(() => import('./pages/PricingCalculator'));
const BreakEvenCalculator = lazy(() => import('./pages/BreakEvenCalculator'));
const LoanCalculator = lazy(() => import('./pages/LoanCalculator'));
const SalaryCalculator = lazy(() => import('./pages/SalaryCalculator'));
const TaxCalculator = lazy(() => import('./pages/TaxCalculator'));

// --- Tool pages: generic-engine powered (see GenericCalculator) ---
const MarkupCalculator = lazy(() => import('./pages/MarkupCalculator'));
const CurrencyCalculator = lazy(() => import('./pages/CurrencyCalculator'));
const RoiCalculator = lazy(() => import('./pages/RoiCalculator'));
const StartupCostCalculator = lazy(() => import('./pages/StartupCostCalculator'));
const QuotationGenerator = lazy(() => import('./pages/QuotationGenerator'));
const EstimateGenerator = lazy(() => import('./pages/EstimateGenerator'));
const DeliveryNoteGenerator = lazy(() => import('./pages/DeliveryNoteGenerator'));
const BusinessNameGenerator = lazy(() => import('./pages/BusinessNameGenerator'));
const SloganGenerator = lazy(() => import('./pages/SloganGenerator'));
const SwotAnalysis = lazy(() => import('./pages/SwotAnalysis'));
const SocialMediaPostGenerator = lazy(() => import('./pages/SocialMediaPostGenerator'));
const HashtagGenerator = lazy(() => import('./pages/HashtagGenerator'));
const EmailTemplateGenerator = lazy(() => import('./pages/EmailTemplateGenerator'));
const AdCopyGenerator = lazy(() => import('./pages/AdCopyGenerator'));
const ProductDescriptionGenerator = lazy(() => import('./pages/ProductDescriptionGenerator'));
const QrCodeGenerator = lazy(() => import('./pages/QrCodeGenerator'));
const WhatsappQrGenerator = lazy(() => import('./pages/WhatsappQrGenerator'));
const VcardQrGenerator = lazy(() => import('./pages/VcardQrGenerator'));
const UrlQrGenerator = lazy(() => import('./pages/UrlQrGenerator'));
const BarcodeGenerator = lazy(() => import('./pages/BarcodeGenerator'));
const ShippingCalculator = lazy(() => import('./pages/ShippingCalculator'));
const ProfitMarginCalculator = lazy(() => import('./pages/ProfitMarginCalculator'));
const SalesTaxCalculator = lazy(() => import('./pages/SalesTaxCalculator'));
const InventoryCalculator = lazy(() => import('./pages/InventoryCalculator'));
const UnitPriceCalculator = lazy(() => import('./pages/UnitPriceCalculator'));
const LeaveCalculator = lazy(() => import('./pages/LeaveCalculator'));
const OvertimeCalculator = lazy(() => import('./pages/OvertimeCalculator'));
const AttendanceCalculator = lazy(() => import('./pages/AttendanceCalculator'));
const GratuityCalculator = lazy(() => import('./pages/GratuityCalculator'));
const BonusCalculator = lazy(() => import('./pages/BonusCalculator'));
const UnitConverter = lazy(() => import('./pages/UnitConverter'));
const DateCalculator = lazy(() => import('./pages/DateCalculator'));
const TimeCalculator = lazy(() => import('./pages/TimeCalculator'));
const FuelCostCalculator = lazy(() => import('./pages/FuelCostCalculator'));
const AgeCalculator = lazy(() => import('./pages/AgeCalculator'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Give the new page a tick to render before looking for the
      // element — React Router navigates client-side, so there's no
      // native browser hash-scroll like a full page load would give us.
      const id = hash.replace('#', '');
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageLoader() {
  return (
    <div className="bn-page-loader">
      <div className="bn-spinner" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    AOS.init({ duration: 600, once: true, offset: 40 });
  }, []);

  return (
    <>
      <OfflineScreen />
      <Layout>
        <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/business-tips" element={<BusinessTips />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          <Route path="/invoice-generator" element={<InvoiceGenerator />} />
          <Route path="/receipt-generator" element={<ReceiptGenerator />} />
          <Route path="/profit-calculator" element={<ProfitCalculator />} />
          <Route path="/vat-calculator" element={<VatCalculator />} />
          <Route path="/discount-calculator" element={<DiscountCalculator />} />
          <Route path="/pricing-calculator" element={<PricingCalculator />} />
          <Route path="/break-even-calculator" element={<BreakEvenCalculator />} />
          <Route path="/loan-calculator" element={<LoanCalculator />} />
          <Route path="/salary-calculator" element={<SalaryCalculator />} />
          <Route path="/tax-calculator" element={<TaxCalculator />} />

          <Route path="/markup-calculator" element={<MarkupCalculator />} />
          <Route path="/currency-calculator" element={<CurrencyCalculator />} />
          <Route path="/roi-calculator" element={<RoiCalculator />} />
          <Route path="/startup-cost-calculator" element={<StartupCostCalculator />} />
          <Route path="/quotation-generator" element={<QuotationGenerator />} />
          <Route path="/estimate-generator" element={<EstimateGenerator />} />
          <Route path="/delivery-note-generator" element={<DeliveryNoteGenerator />} />
          <Route path="/business-name-generator" element={<BusinessNameGenerator />} />
          <Route path="/slogan-generator" element={<SloganGenerator />} />
          <Route path="/swot-analysis" element={<SwotAnalysis />} />
          <Route path="/social-media-post-generator" element={<SocialMediaPostGenerator />} />
          <Route path="/hashtag-generator" element={<HashtagGenerator />} />
          <Route path="/email-template-generator" element={<EmailTemplateGenerator />} />
          <Route path="/ad-copy-generator" element={<AdCopyGenerator />} />
          <Route path="/product-description-generator" element={<ProductDescriptionGenerator />} />
          <Route path="/qr-code-generator" element={<QrCodeGenerator />} />
          <Route path="/whatsapp-qr-generator" element={<WhatsappQrGenerator />} />
          <Route path="/vcard-qr-generator" element={<VcardQrGenerator />} />
          <Route path="/url-qr-generator" element={<UrlQrGenerator />} />
          <Route path="/barcode-generator" element={<BarcodeGenerator />} />
          <Route path="/shipping-calculator" element={<ShippingCalculator />} />
          <Route path="/profit-margin-calculator" element={<ProfitMarginCalculator />} />
          <Route path="/sales-tax-calculator" element={<SalesTaxCalculator />} />
          <Route path="/inventory-calculator" element={<InventoryCalculator />} />
          <Route path="/unit-price-calculator" element={<UnitPriceCalculator />} />
          <Route path="/leave-calculator" element={<LeaveCalculator />} />
          <Route path="/overtime-calculator" element={<OvertimeCalculator />} />
          <Route path="/attendance-calculator" element={<AttendanceCalculator />} />
          <Route path="/gratuity-calculator" element={<GratuityCalculator />} />
          <Route path="/bonus-calculator" element={<BonusCalculator />} />
          <Route path="/unit-converter" element={<UnitConverter />} />
          <Route path="/date-calculator" element={<DateCalculator />} />
          <Route path="/time-calculator" element={<TimeCalculator />} />
          <Route path="/fuel-cost-calculator" element={<FuelCostCalculator />} />
          <Route path="/age-calculator" element={<AgeCalculator />} />

          {/* New: auth + payments (additive only) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout><Dashboard /></DashboardLayout></PrivateRoute>} />
          <Route path="/ai-assistant" element={<PrivateRoute><DashboardLayout><AIAssistant /></DashboardLayout></PrivateRoute>} />
          <Route path="/invoice/:id" element={<PrivateRoute><DashboardLayout><InvoiceDetails /></DashboardLayout></PrivateRoute>} />
          <Route path="/whats-new" element={<WhatsNew />} />
          <Route path="/saved-items" element={<PrivateRoute><DashboardLayout><SavedItems /></DashboardLayout></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute><DashboardLayout><Customers /></DashboardLayout></PrivateRoute>} />
          <Route path="/referrals" element={<PrivateRoute><DashboardLayout><Referrals /></DashboardLayout></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><DashboardLayout><Favorites /></DashboardLayout></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><DashboardLayout><Analytics /></DashboardLayout></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><DashboardLayout><Settings /></DashboardLayout></PrivateRoute>} />
          <Route path="/support" element={<PrivateRoute><DashboardLayout><Support /></DashboardLayout></PrivateRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </Layout>
    </>
  );
}
