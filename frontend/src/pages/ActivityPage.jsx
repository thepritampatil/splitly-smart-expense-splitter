import { useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useActivityStore } from '../store';
import { EmptyState } from '../components/ui';
import { PageContainer } from '../components/shell';
import PageTitle from '../components/ui/PageTitle';
import { ActivityTimeline } from '../components/domain';

export default function ActivityPage() {
  const { activities, loading, fetchMyActivities } = useActivityStore();
  useEffect(() => { fetchMyActivities(); }, []);

  return (
    <PageContainer maxWidth="2xl">
      <PageTitle title="Activity Feed" subtitle="Everything happening across your groups" emoji="⚡" />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          emoji="⚡"
          title="No activity yet"
          description="Join a group and add expenses — your feed will come alive here."
        />
      ) : (
        <ActivityTimeline activities={activities} showGroup />
      )}
    </PageContainer>
  );
}
