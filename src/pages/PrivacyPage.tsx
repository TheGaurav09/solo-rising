
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AnimatedCard from '@/components/ui/AnimatedCard';

const PrivacyPage = () => {
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
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-white/80">
                  Welcome to Solo Rising ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application and services.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="text-white/80 mb-3">
                  We collect information that you provide directly to us when you:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Create an account or profile</li>
                  <li>Set fitness goals and track workouts</li>
                  <li>Make purchases or donations</li>
                  <li>Communicate with us</li>
                  <li>Participate in our forums or social features</li>
                </ul>
                <p className="text-white/80 mt-3">
                  We may also automatically collect certain information about your device, including IP address, device type, operating system, browser type, app usage data, and fitness activity data.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-white/80 mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Track your fitness progress and provide personalized content</li>
                  <li>Process transactions and manage your account</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Send you technical notices, updates, and promotional messages</li>
                  <li>Monitor and analyze usage patterns</li>
                  <li>Detect, prevent, and address fraud or other illegal activities</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Sharing of Information</h2>
                <p className="text-white/80 mb-3">
                  We may share your information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Service providers who perform services on our behalf</li>
                  <li>Other users (limited to information you choose to make public)</li>
                  <li>Third-party services that you connect to your account</li>
                  <li>Legal authorities when required by law or to protect our rights</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Your Choices</h2>
                <p className="text-white/80 mb-3">
                  You can:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-white/80">
                  <li>Update or correct your account information</li>
                  <li>Opt out of marketing communications</li>
                  <li>Control visibility of your profile and activities</li>
                  <li>Request deletion of your account</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
                <p className="text-white/80">
                  We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no internet or electronic storage system is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Changes to This Privacy Policy</h2>
                <p className="text-white/80">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
                <p className="text-white/80">
                  If you have any questions about this Privacy Policy, please contact us at privacy@solorising.com.
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

export default PrivacyPage;
