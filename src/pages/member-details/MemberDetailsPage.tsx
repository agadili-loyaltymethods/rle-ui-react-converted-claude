import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft size={16} /> Back to Members
      </button>

      <div className="rounded-xl border bg-white p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {member.firstName} {member.lastName}
            </h1>
            <p className="text-gray-500 mt-1">{member.email}</p>
            <p className="text-gray-500">{member.phone}</p>
          </div>
          <div className="text-right">
            <Badge variant="success">Active</Badge>
            <p className="text-xs text-gray-400 mt-1">ID: {member.id}</p>
            {member.loyaltyId && (
              <p className="text-xs text-gray-400">Loyalty: {member.loyaltyId}</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-b mb-6">
        <nav className="flex overflow-x-auto gap-1 pb-0">
          {memberTabs.map(({ path, label }) => (
            <NavLink
              key={path}
              to={`/details/${id}/${path}`}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
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
