import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMessageStore, useActivityStore, useAuthStore } from '../../store';
import { Avatar, EmptyState } from '../ui';
import { getActivityConfig } from '../../lib/activityConfig';

export default function GroupDiscussion({ groupId }) {
  const { messages, loading, fetchMessages, sendMessage } = useMessageStore();
  const { groupActivities, fetchGroupActivities } = useActivityStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages(groupId);
    fetchGroupActivities(groupId);
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(groupId, input.trim());
    setInput('');
  };

  const combined = [
    ...messages.map(m => ({ ...m, _type: 'message' })),
    ...groupActivities.map(a => ({ ...a, _type: 'activity', createdAt: a.timestamp })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="flex min-h-[min(500px,60dvh)] flex-col rounded-2xl border border-white/[0.06] bg-dark-800/20 sm:h-[500px]">
      <div className="border-b border-white/[0.04] px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-white">💬 Group chat</h3>
        <p className="text-xs text-slate-500">Messages & live updates</p>
      </div>

      <div className="mb-4 flex-1 space-y-3 overflow-y-auto p-4 pr-2">
        {combined.length === 0 && !loading && (
          <EmptyState
            emoji="🗣️"
            title="Start the conversation"
            description="Say hi to your group or split the next expense!"
          />
        )}
        {combined.map((item) => {
          if (item._type === 'activity') {
            const conf = getActivityConfig(item.type);
            return (
              <div key={`a-${item.id}`} className="flex justify-center py-1">
                <span
                  className={`inline-flex max-w-[90%] items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs ${conf.bg} ${conf.color} border-white/[0.06]`}
                >
                  <span>{conf.emoji}</span>
                  <span className="text-slate-300">{item.message}</span>
                </span>
              </div>
            );
          }
          const isMe = item.sender?.id === user?.id;
          return (
            <motion.div
              key={`m-${item.id}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <Avatar src={item.sender?.avatar} name={item.sender?.fullName} size="sm" className="mt-1 flex-shrink-0" />
              <div className={`flex max-w-[75%] flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <p className="px-1 text-xs font-medium text-slate-500">{item.sender?.fullName}</p>
                )}
                <div
                  className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                    isMe
                      ? 'rounded-2xl rounded-br-md border border-brand-500/30 bg-gradient-to-br from-brand-500/25 to-brand-600/15 text-white'
                      : 'rounded-2xl rounded-bl-md border border-white/[0.06] bg-dark-700/80 text-slate-200'
                  }`}
                >
                  {item.content}
                </div>
                <p className="px-1 text-[10px] text-slate-600">
                  {item.createdAt && format(new Date(item.createdAt), 'h:mm a')}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky-actions flex gap-2 border-t border-white/[0.04] !bg-dark-900/95 p-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Message your group…"
          className="input-field flex-1 text-sm"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          className="btn-primary px-3 py-2 touch-manipulation"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
