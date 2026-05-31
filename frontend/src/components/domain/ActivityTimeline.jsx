import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui';
import { getActivityConfig } from '../../lib/activityConfig';
import { fadeUpItem } from '../../lib/motion';
import { StaggerGrid } from '../motion';

function formatActivityTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

export function ActivityTimelineItem({ activity, showGroup = true, className = '' }) {
  const conf = getActivityConfig(activity.type);
  const person = activity.triggeredBy;

  return (
    <motion.article
      variants={fadeUpItem}
      className={`relative flex gap-3 pl-1 ${className}`}
    >
      <div className="relative z-10 flex flex-shrink-0 flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ring-2 ring-dark-900 ${conf.bg} ${conf.ring}`}
        >
          {person ? (
            <Avatar src={person.avatar} name={person.fullName} size="sm" className="!h-9 !w-9" />
          ) : (
            <span className="text-base" role="img" aria-hidden>{conf.emoji}</span>
          )}
        </div>
        <span className={`mt-1 text-[10px] ${conf.color}`}>{conf.emoji}</span>
      </div>

      <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.05] bg-dark-800/40 p-3.5 backdrop-blur-sm transition-colors hover:border-white/[0.08]">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${conf.color}`}>
            {conf.label}
          </span>
          {showGroup && activity.groupName && activity.groupId && (
            <Link
              to={`/groups/${activity.groupId}`}
              className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-300 hover:bg-brand-500/20"
            >
              {activity.groupName}
            </Link>
          )}
        </div>
        <p className="text-sm leading-relaxed text-slate-200">{activity.message}</p>
        <div className="mt-2 flex items-center gap-2">
          {person && (
            <span className="text-xs text-slate-500">
              {person.fullName}
            </span>
          )}
          <span className="text-xs text-slate-600">·</span>
          <time className="text-xs text-slate-600" dateTime={activity.timestamp}>
            {formatActivityTime(activity.timestamp)}
          </time>
        </div>
      </div>
    </motion.article>
  );
}

export default function ActivityTimeline({
  activities = [],
  showGroup = true,
  stagger = true,
  className = '',
}) {
  if (activities.length === 0) return null;

  const content = activities.map((a) => (
    <ActivityTimelineItem key={a.id} activity={a} showGroup={showGroup} />
  ));

  return (
    <div className={`relative ${className}`}>
      <div
        className="pointer-events-none absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-brand-500/40 via-white/10 to-transparent"
        aria-hidden
      />

      {stagger ? (
        <StaggerGrid className="space-y-3">{content}</StaggerGrid>
      ) : (
        <div className="space-y-3">{content}</div>
      )}
    </div>
  );
}
