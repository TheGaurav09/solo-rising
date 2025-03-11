
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';

const TermsPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <AnimatedCard>
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                <p className="text-white/80">
                  By accessing or using Solo Rising, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Account Registration</h2>
                <p className="text-white/80">
                  To use certain features of Solo Rising, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Conduct</h2>
                <p className="text-white/80 mb-3">
                  You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Use our services for any illegal purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt our services or servers</li>
                  <li>Attempt to gain unauthorized access to any part of our services</li>
                  <li>Use our services to collect or harvest personal information about others</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
                <p className="text-white/80">
                  Solo Rising and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. You may not modify, reproduce, distribute, create derivative works or adaptations of, publicly display or in any way exploit any of our content in whole or in part except as expressly authorized by us.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Purchases and Subscriptions</h2>
                <p className="text-white/80">
                  We offer various virtual items, premium features, and subscription services for purchase. All purchases are final and non-refundable except as required by law. Prices and availability of services are subject to change without notice.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">6. User Content</h2>
                <p className="text-white/80">
                  By submitting content to Solo Rising, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display such content in connection with providing our services. You represent and warrant that you own or have the necessary rights to the content you submit.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
                <p className="text-white/80">
                  Solo Rising is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that our services will be uninterrupted, secure, or error-free, or that defects will be corrected.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p className="text-white/80">
                  In no event shall Solo Rising, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Health and Fitness Disclaimer</h2>
                <p className="text-white/80">
                  Solo Rising provides fitness information and suggestions. This information is not medical advice and should not be treated as such. Before starting any exercise program, consult with a healthcare professional. We are not responsible for any injuries or health problems that may result from training programs, exercises, or information accessed through our services.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
                <p className="text-white/80">
                  We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason, including breach of these Terms of Service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">11. Governing Law</h2>
                <p className="text-white/80">
                  These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
                <p className="text-white/80">
                  We reserve the right to modify or replace these Terms at any time. Your continued use of our services after any such changes constitutes your acceptance of the new Terms.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
                <p className="text-white/80">
                  If you have any questions about these Terms, please contact us at terms@solorising.com.
                </p>
              </section>
              
              <div className="text-sm text-white/60 pt-6 border-t border-white/10">
                Last Updated: June 15, 2023
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};

export default TermsPage;
