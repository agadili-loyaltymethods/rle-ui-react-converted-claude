import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink, Outlet } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { membersApi, Member } from '../../api/resources/members.api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../utils/cn';

const memberTabs = [
  { path: 'activities', label: 'Activities' },
  { path: 'rewards', label: 'Rewards' },
  { path: 'purses', label: 'Purses' },
  { path: 'tiers', label: 'Tiers' },
  { path: 'badges', label: 'Badges' },
  { path: 'transactions', label: 'Transactions' },
  { path: 'loyaltyids', label: 'Loyalty IDs' },
  { path: 'referrals', label: 'Referrals' },
  { path: 'segments', label: 'Segments' },
  { path: 'preferences', label: 'Preferences' },
  { path: 'offers', label: 'Offers' },
  { path: 'streaks', label: 'Streaks' },
  { path: 'mergeHistories', label: 'Merge History' },
  { path: 'purseHistories', label: 'Purse History' },
  { path: 'streakHistories', label: 'Streak History' },
  { path: 'aggregates', label: 'Aggregates' },
  { path: 'tc', label: 'T&C' },
];

function getMemberInitials(member: Member): string {
  const first = member.firstName?.[0] || '';
  const last = member.lastName?.[0] || '';
  return (first + last).toUpperCase() || 'M';
}

export function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    membersApi.getById(id)
      .then((res) => setMember(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!member) return null;

  return (
    <div>
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Members
      </button>

      {/* Member summary card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-700 font-semibold text-sm">{getMemberInitials(member)}</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">
                {member.firstName} {member.lastName}
              </h1>
              {member.email && (
                <p className="text-sm text-slate-500 mt-0.5">{member.email}</p>
              )}
              {member.phone && (
                <p className="text-sm text-slate-400">{member.phone}</p>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <Badge variant="success">Active</Badge>
            <p className="text-xs text-slate-400 mt-1.5 font-mono">ID: {member.id}</p>
            {member.loyaltyId && (
              <p className="text-xs text-slate-400 font-mono">Loyalty: {member.loyaltyId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-slate-200 mb-5">
        <nav className="flex overflow-x-auto gap-0 -mb-px">
          {memberTabs.map(({ path, label }) => (
            <NavLink
              key={path}
              to={`/details/${id}/${path}`}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet context={{ member, memberId: id }} />
    </div>
  );
}
