import SEO from '../components/SEO';
import '../styles/LegalPage.css';

export default function TermsOfService() {
  return (
    <div className="bn-container bn-legal-page">
      <SEO title="Terms of Service" description="Read the terms of service for using BizName's free business tools and templates." path="/terms-of-service" />
      <h1>Terms of Service</h1>
      <p className="bn-legal-updated">Last updated: January 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using BizName, you agree to be bound by these Terms of Service. If you do not agree, please do not use this site.</p>

      <h2>2. Use of Tools</h2>
      <p>BizName provides free business tools, calculators, generators and templates for informational and productivity purposes. All calculations (tax, VAT, salary, loan, and similar tools) are estimates only and should not be relied upon as professional financial, legal, tax, or accounting advice. Always consult a qualified professional for decisions that affect your business or finances.</p>

      <h2>3. No Warranty</h2>
      <p>BizName is provided "as is" without warranties of any kind, express or implied. We do not guarantee the accuracy, completeness, or reliability of any tool, calculation, template, or article on this site.</p>

      <h2>4. Local Data Storage</h2>
      <p>Because BizName stores data only in your browser's local storage, you are responsible for backing up any information you wish to keep. We are not liable for data loss resulting from clearing browser storage, using a different device, or browser issues.</p>

      <h2>5. Limitation of Liability</h2>
      <p>In no event shall BizName or its creators be liable for any indirect, incidental, or consequential damages arising from your use of this site or its tools.</p>

      <h2>6. Intellectual Property</h2>
      <p>The BizName name, logo, design and original content are the property of BizName. Templates and generated documents are provided for your business use.</p>

      <h2>7. Changes to These Terms</h2>
      <p>We may revise these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.</p>

      <h2>8. Contact</h2>
      <p>Questions about these terms can be sent via our Contact page.</p>
    </div>
  );
}
