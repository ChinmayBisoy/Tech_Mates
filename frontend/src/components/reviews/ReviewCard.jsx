import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag, Reply, MessageSquare, Shield, Award } from 'lucide-react';
import RatingStars from './RatingStars';
import useReviewStore from '@/store/reviewStore';

export default function ReviewCard({ review, onReply = null, isOwner = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');

  const markHelpful = useReviewStore((state) => state.markHelpful);
  const isReviewHelpful = useReviewStore((state) => state.isReviewHelpful);
  const addReply = useReviewStore((state) => state.addReply);

  const handleMarkHelpful = () => {
    markHelpful(review.id);
  };

  const handleReply = () => {
    if (replyText.trim()) {
      const reply = {
        id: review.replies.length + 100,
        userId: 1,
        userName: 'You',
        content: replyText,
        date: new Date().toISOString().split('T')[0],
        isSellerReply: true,
      };
      addReply(review.id, reply);
      setReplyText('');
      setShowReplyForm(false);
    }
  };

  const badgeConfig = {
    'verified-buyer': { icon: '✓', label: 'Verified Buyer', color: 'bg-green-500/10 text-green-600' },
    'helpful-reviewer': { icon: '👍', label: 'Helpful Reviewer', color: 'bg-blue-500/10 text-blue-600' },
    'trusted-reviewer': { icon: '⭐', label: 'Trusted Reviewer', color: 'bg-purple-500/10 text-purple-600' },
    'detailed-reviewer': { icon: '📸', label: 'Detailed Reviewer', color: 'bg-orange-500/10 text-orange-600' },
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-800/50 transition">
      {/* Header with User Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-3">
          <img
            src={review.userAvatar}
            alt={review.userName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{review.userName}</h4>
              {review.verifiedPurchase && (
                <Shield className="w-4 h-4 text-green-500" title="Verified Purchase" />
              )}
            </div>
            <p className="text-xs text-slate-400">{review.date}</p>
          </div>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>

      {/* Badges */}
      {review.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {review.badges.map((badge) => (
            <span
              key={badge}
              className={`px-2 py-1 rounded text-xs font-medium ${badgeConfig[badge]?.color || 'bg-slate-700/50 text-slate-300'}`}
              title={badgeConfig[badge]?.label}
            >
              {badgeConfig[badge]?.icon} {badgeConfig[badge]?.label}
            </span>
          ))}
        </div>
      )}

      {/* Title & Content */}
      <h5 className="font-semibold text-white mb-2">{review.title}</h5>
      <p className="text-slate-300 text-sm mb-3 leading-relaxed">{review.content}</p>

      {/* Photos */}
      {review.photos.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {review.photos.map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              alt={`Review photo ${idx + 1}`}
              className="h-20 w-20 rounded-lg object-cover cursor-pointer hover:scale-105 transition"
            />
          ))}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
        <div className="flex gap-4">
          <button
            onClick={handleMarkHelpful}
            className={`flex items-center gap-1 text-xs transition ${
              isReviewHelpful(review.id)
                ? 'text-green-400'
                : 'text-slate-400 hover:text-green-400'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            Helpful ({review.helpfulCount})
          </button>
          <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 transition">
            <ThumbsDown className="w-4 h-4" />
            ({review.unhelpfulCount})
          </button>
        </div>

        <div className="flex gap-2">
          {isOwner && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
          )}
          <button className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition">
            <Flag className="w-4 h-4" />
            Report
          </button>
        </div>
      </div>

      {/* Seller Replies */}
      {review.replies.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-slate-700/30 pt-3">
          {review.replies.map((reply) => (
            <div key={reply.id} className="bg-slate-900/50 rounded p-3 ml-2 border-l-2 border-blue-500/50">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-sm text-white">{reply.userName}</span>
                <span className="text-xs text-slate-400">{reply.date}</span>
              </div>
              <p className="text-slate-300 text-sm">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {showReplyForm && isOwner && (
        <div className="mt-3 border-t border-slate-700/30 pt-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your response..."
            className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
            rows="3"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleReply}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
            >
              Reply
            </button>
            <button
              onClick={() => setShowReplyForm(false)}
              className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
