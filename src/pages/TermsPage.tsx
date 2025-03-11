
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-10">
          <Link to="/" className="text-white hover:text-white/80 flex items-center gap-2 transition-colors">
            <ChevronLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="space-y-8">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          
          <p className="text-white/90">Last Updated: June 1, 2023</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
              <p className="text-white/90">
                By accessing or using Solo Rising's application, website, or services (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use our Services.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-white/90">
                We may revise these Terms from time to time. If we do, we will update the "Last Updated" date above. By continuing to use the Services after those changes become effective, you agree to be bound by the revised Terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
              <p className="text-white/90">
                Please refer to our <Link to="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link> for information about how we collect, use, and disclose information about you.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Account Registration</h2>
              <p className="text-white/90">
                To use certain features of the Services, you may need to register for an account. You agree to provide accurate, current, and complete information and to update your information as necessary. You are responsible for all activities that occur under your account.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">User Content</h2>
              <p className="text-white/90">
                Our Services may allow you to create, post, or share content. You are solely responsible for your User Content and the consequences of posting it. By posting User Content, you grant us a non-exclusive, transferable, sub-licensable, royalty-free, worldwide license to use, copy, modify, create derivative works based on, distribute, publicly display, and publicly perform your User Content.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Prohibited Activities</h2>
              <p className="text-white/90">You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-white/90">
                <li>Violate any applicable law or regulation;</li>
                <li>Use the Services in any manner that could disable, overburden, or impair the Services;</li>
                <li>Use any robot, spider, or other automated device to access the Services;</li>
                <li>Introduce any viruses, trojan horses, worms, or other harmful materials;</li>
                <li>Attempt to gain unauthorized access to, interfere with, or disrupt any part of the Services;</li>
                <li>Impersonate or attempt to impersonate Solo Rising, a Solo Rising employee, another user, or any other person;</li>
                <li>Engage in any harassing, intimidating, predatory, or stalking conduct;</li>
                <li>Use the Services to advertise or offer to sell goods and services.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">In-App Purchases and Virtual Items</h2>
              <p className="text-white/90">
                Our Services may include virtual items or currency that can be purchased with real money or earned through gameplay. Virtual items and currency are not redeemable for real money and have no monetary value. We reserve the right to manage, regulate, control, modify, or eliminate virtual items or currency at any time.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property Rights</h2>
              <p className="text-white/90">
                The Services and their content, features, and functionality are owned by Solo Rising and are protected by copyright, trademark, and other intellectual property laws. You may not use our trademarks or other intellectual property without our prior written consent.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-white/90">
                We may terminate or suspend your account and access to the Services at any time, without prior notice or liability, for any reason.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
              <p className="text-white/90">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-white/90">
                TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL SOLO RISING BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICES.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p className="text-white/90">
                These Terms and your use of the Services shall be governed by and construed in accordance with the laws of the jurisdiction in which Solo Rising operates, without regard to its conflict of laws principles.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-white/90">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="text-white/90 mt-2">
                Solo Rising Support<br />
                Email: support@solorising.app
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
