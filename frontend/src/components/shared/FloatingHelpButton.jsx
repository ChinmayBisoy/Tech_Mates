import { useState } from 'react'
import { MessageCircle, X,Phone, Mail, Send } from 'lucide-react'
import { showToast } from '@/lib/toast'

export default function FloatingHelpButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('faq')
  const [messageText, setMessageText] = useState('')

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      showToast.error('Please enter a message')
      return
    }

    showToast.success('Message sent! Our team will respond within 24 hours.')
    setMessageText('')
    setTimeout(() => setIsOpen(false), 1500)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-accent-500 hover:bg-accent-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
        title="Help & Support"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-24px)] rounded-2xl bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-accent-500 text-white p-6 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Help & Support</h3>
              <p className="text-sm text-accent-100">We're here to help!</p>
            </div>
            <MessageCircle className="w-8 h-8 opacity-50" />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
                activeTab === 'faq'
                  ? 'border-b-2 border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex-1 py-3 px-4 font-medium text-sm transition-colors ${
                activeTab === 'contact'
                  ? 'border-b-2 border-accent-500 text-accent-600 dark:text-accent-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'faq' ? (
              <div className="space-y-4">
                <FAQItem
                  question="How do I list a project?"
                  answer="Go to Dashboard → Post Project, fill in the details, and set your budget and timeline."
                />
                <FAQItem
                  question="What's the payment process?"
                  answer="Create a project → Receive proposals → Hire developer → Payment held in escrow → Release after completion."
                />
                <FAQItem
                  question="How do I withdraw earnings?"
                  answer="Go to Earnings → Request Withdrawal → Choose payment method → Funds transferred within 3-5 business days."
                />
                <FAQItem
                  question="Can I cancel my subscription?"
                  answer="Yes! Go to My Subscription → Cancel Plan. You'll retain access until your billing cycle ends."
                />
                <FAQItem
                  question="Is my data secure?"
                  answer="We use industry-standard encryption and security protocols. All payments are PCI DSS compliant."
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-500 outline-none transition resize-none"
                    rows="4"
                  />
                </div>

                <div className="space-y-3 mb-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <a
                    href="mailto:support@tecbmates.com"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-accent-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        support@techmates.com
                      </p>
                    </div>
                  </a>

                  <a
                    href="tel:+1234567890"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-accent-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Phone
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        +1 (234) 567-890
                      </p>
                    </div>
                  </a>
                </div>

                <button
                  onClick={handleSendMessage}
                  className="w-full py-2 px-4 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-600 dark:text-gray-400">
            Average response time: 24 hours 📧
          </div>
        </div>
      )}
    </>
  )
}

function FAQItem({ question, answer }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center justify-between font-medium text-gray-900 dark:text-white"
      >
        {question}
        <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {expanded && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{answer}</p>
      )}
    </div>
  )
}
