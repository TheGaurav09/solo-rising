
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-10">
          <Link to="/" className="text-white hover:text-white/80 flex items-center gap-2 transition-colors bg-black/30 hover:bg-black/50 px-3 py-2 rounded-lg inline-flex">
            <ChevronLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          
          <p className="text-white">Last Updated: June 1, 2023</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Introduction</h2>
              <p className="text-white">
                Solo Rising ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our mobile application, website, and services (collectively, the "Services").
              </p>
              <p className="text-white mt-2">
                By using our Services, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, do not use our Services.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
              <p className="text-white">We collect several types of information from and about users of our Services, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-white">
                <li>
                  <strong>Personal Information:</strong> This includes your name, email address, and any other information you provide when you register for an account, such as your chosen warrior name and country.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you interact with our Services, including your workout history, achievements, points, and in-app activities.
                </li>
                <li>
                  <strong>Device Information:</strong> Information about the device you use to access our Services, including hardware model, operating system, unique device identifiers, and mobile network information.
                </li>
                <li>
                  <strong>Location Information:</strong> With your consent, we may collect and process information about your actual location.
                </li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
              <p className="text-white">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-white">
                <li>Provide, maintain, and improve our Services;</li>
                <li>Process and complete transactions, and send related information including confirmations;</li>
                <li>Create and maintain your account;</li>
                <li>Send technical notices, updates, security alerts, and support and administrative messages;</li>
                <li>Respond to your comments, questions, and requests;</li>
                <li>Track and analyze trends, usage, and activities in connection with our Services;</li>
                <li>Personalize and improve the Services and provide content or features that match user profiles or interests;</li>
                <li>Facilitate contests, sweepstakes, and promotions and process and deliver entries and rewards.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Sharing Your Information</h2>
              <p className="text-white">We may share information about you as follows:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-white">
                <li>With service providers who perform services on our behalf;</li>
                <li>With other users in shared features like leaderboards and user profiles;</li>
                <li>To comply with applicable laws, regulations, or legal process;</li>
                <li>To protect the rights, property, or safety of Solo Rising, our users, or others;</li>
                <li>In connection with a sale, merger, or change of control.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Your Choices</h2>
              <p className="text-white">
                You can access and update certain information about you from within the Services. You can also request deletion of your account by contacting us.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Security</h2>
              <p className="text-white">
                We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Changes to this Privacy Policy</h2>
              <p className="text-white">
                We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
              <p className="text-white">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-white mt-2">
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

export default PrivacyPage;
