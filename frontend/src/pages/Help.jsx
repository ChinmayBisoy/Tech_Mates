import { ArrowLeft, Mail, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function HelpPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const faqs = [
    {
      question: 'How do I post a project?',
      answer: 'Navigate to the Projects section and click "Post a Project". Fill in the details and publish.',
    },
    {
      question: 'How do I apply for a project?',
      answer: 'Browse available projects, click on one, and submit your proposal through the application form.',
    },
    {
      question: 'How are payments processed?',
      answer: 'Payments are processed securely through our integrated payment gateway. Funds are held in escrow until project completion.',
    },
    {
      question: 'How do I contact support?',
      answer: 'Use the contact form on this page, or email support@techmates.com for urgent issues.',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! Our support team will get back to you soon.');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary dark:text-accent hover:underline mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Help & Support</h1>

      {/* FAQs */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white hover:text-primary dark:hover:text-accent">
                {faq.question}
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Contact Support
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          <a
            href="mailto:support@techmates.com"
            className="rounded-lg border border-gray-300 p-4 hover:border-primary dark:border-gray-600 dark:hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-primary dark:text-accent" />
              <span className="font-semibold text-gray-900 dark:text-white">Email</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              support@techmates.com
            </p>
          </a>

          <div className="rounded-lg border border-gray-300 p-4 dark:border-gray-600">
            <div className="flex items-center gap-3 mb-2">
              <Send className="w-5 h-5 text-primary dark:text-accent" />
              <span className="font-semibold text-gray-900 dark:text-white">Live Chat</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Available 9 AM - 6 PM IST
            </p>
          </div>
        </div>

        {/* Support Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue or question..."
            required
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
