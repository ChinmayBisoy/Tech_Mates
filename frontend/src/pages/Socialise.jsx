import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Link2, UserPlus, Check, X, MessageSquare, Trophy, Briefcase } from 'lucide-react';
import { socialAPI } from '@/api/social.api';
import { chatAPI } from '@/api/chat.api';
import { useAuth } from '@/hooks/useAuth';
import showToast from '@/lib/toast';

export default function SocialisePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [achievementsInput, setAchievementsInput] = useState('');
  const [recentWorksInput, setRecentWorksInput] = useState('');
  const [pendingConnectUserId, setPendingConnectUserId] = useState(null);

  const getErrorMessage = (error, fallback) => {
    const responseData = error?.response?.data;
    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      return responseData.errors[0]?.message || fallback;
    }

    return responseData?.message || error?.message || fallback;
  };

  const { data: discoverUsers = [], isLoading: discoverLoading } = useQuery({
    queryKey: ['social-discover'],
    queryFn: socialAPI.getDiscoverUsers,
  });

  const { data: requestData = { incoming: [], sent: [] } } = useQuery({
    queryKey: ['social-requests'],
    queryFn: socialAPI.getRequests,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['social-connections'],
    queryFn: socialAPI.getConnections,
  });

  const { data: socialProfile } = useQuery({
    queryKey: ['social-profile-me'],
    queryFn: socialAPI.getMySocialProfile,
  });

  useEffect(() => {
    if (!socialProfile) {
      return;
    }

    setHeadline(socialProfile.socialHeadline || '');
    setBio(socialProfile.bio || '');
    setAchievementsInput((socialProfile.achievements || []).join('\n'));
    const worksText = (socialProfile.recentWorks || [])
      .map((work) => `${work.title || ''}|${work.description || ''}|${work.link || ''}`)
      .join('\n');
    setRecentWorksInput(worksText);
  }, [socialProfile]);

  const refreshSocialQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['social-discover'] });
    queryClient.invalidateQueries({ queryKey: ['social-requests'] });
    queryClient.invalidateQueries({ queryKey: ['social-connections'] });
  };

  const sendRequestMutation = useMutation({
    mutationFn: (targetUserId) => socialAPI.sendRequest(targetUserId),
    onMutate: (targetUserId) => {
      setPendingConnectUserId(targetUserId);
    },
    onSuccess: () => {
      refreshSocialQueries();
      showToast.success('Connection request sent successfully.');
    },
    onError: (error) => {
      showToast.error(getErrorMessage(error, 'Failed to send connection request.'));
    },
    onSettled: () => {
      setPendingConnectUserId(null);
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, action }) => socialAPI.respondToRequest(requestId, action),
    onSuccess: (_, variables) => {
      refreshSocialQueries();
      showToast.success(
        variables?.action === 'accept' ? 'Connection request accepted.' : 'Connection request rejected.'
      );
    },
    onError: (error) => {
      showToast.error(getErrorMessage(error, 'Failed to respond to request.'));
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: socialAPI.updateMySocialProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-profile-me'] });
      showToast.success('Social profile saved successfully.');
    },
    onError: (error) => {
      showToast.error(getErrorMessage(error, 'Failed to save social profile.'));
    },
  });

  const visibleUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return discoverUsers;
    }

    return discoverUsers.filter((userItem) => {
      const haystack = [
        userItem.name,
        userItem.socialHeadline,
        userItem.bio,
        ...(userItem.skills || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [discoverUsers, searchTerm]);

  const startConversation = async (targetUserId) => {
    try {
      const room = await chatAPI.createRoom({ userId: targetUserId });
      const roomId = room?._id || room?.id;
      if (roomId) {
        navigate(`/chat/${roomId}`);
      } else {
        showToast.error('Could not open chat room. Please try again.');
      }
    } catch (error) {
      showToast.error(getErrorMessage(error, 'Failed to start conversation.'));
    }
  };

  const submitProfile = (event) => {
    event.preventDefault();

    const achievements = achievementsInput
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    const recentWorks = recentWorksInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title = '', description = '', link = ''] = line.split('|');
        return {
          title: title.trim(),
          description: description.trim(),
          link: link.trim(),
        };
      })
      .filter((work) => work.title);

    updateProfileMutation.mutate({
      socialHeadline: headline,
      bio,
      achievements,
      recentWorks,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/60 dark:from-base dark:via-surface dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-3xl border border-indigo-200/80 dark:border-gray-700 bg-gradient-to-r from-white via-indigo-50/70 to-cyan-50/70 dark:bg-surface p-6 shadow-xl shadow-indigo-200/40">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300 mb-2">
            Socialise
          </p>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Build Your Network</h1>
          <p className="text-slate-600 dark:text-gray-300 max-w-2xl">
            Connect with {user?.role === 'developer' ? 'clients' : 'developers'}, send requests, and start conversations once connected.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-indigo-200/80 dark:border-gray-700 bg-white dark:bg-surface p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Discover</h2>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={`Search ${user?.role === 'developer' ? 'clients' : 'developers'} by name, skill, or bio`}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {discoverLoading && <p className="text-sm text-gray-500">Loading users...</p>}
                {!discoverLoading && !visibleUsers.length && (
                  <p className="text-sm text-gray-500">No users found for your search.</p>
                )}

                {visibleUsers.map((person) => (
                  <div key={person._id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900/60">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{person.name}</h3>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mt-0.5">{person.role}</p>
                        <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">{person.socialHeadline || person.bio || 'No social headline yet'}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(person.skills || []).slice(0, 4).map((skill) => (
                            <span key={skill} className="text-xs rounded-full bg-indigo-100 text-indigo-700 dark:bg-gray-700 dark:text-indigo-200 px-2 py-1">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {(() => {
                          const isSendingThisUser = sendRequestMutation.isPending && pendingConnectUserId === person._id;

                          return (
                            <>
                        {person.connectionStatus === 'none' && (
                          <button
                            onClick={() => sendRequestMutation.mutate(person._id)}
                            disabled={isSendingThisUser}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold"
                          >
                            <UserPlus className="w-4 h-4" />
                            {isSendingThisUser ? 'Sending...' : 'Connect'}
                          </button>
                        )}
                        {person.connectionStatus === 'pending_sent' && (
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">Request Sent</span>
                        )}
                        {person.connectionStatus === 'pending_received' && (
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-2 rounded-lg">Respond in Requests</span>
                        )}
                        {person.connectionStatus === 'connected' && (
                          <button
                            onClick={() => startConversation(person._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                        )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-200/80 dark:border-gray-700 bg-white dark:bg-surface p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Incoming Requests</h2>
              </div>

              <div className="space-y-3">
                {!requestData.incoming?.length && <p className="text-sm text-gray-500">No pending incoming requests.</p>}
                {(requestData.incoming || []).map((request) => (
                  <div key={request._id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{request.requesterId?.name}</p>
                      <p className="text-xs text-gray-500">{request.requesterId?.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => respondMutation.mutate({ requestId: request._id, action: 'accept' })}
                        disabled={respondMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        {respondMutation.isPending ? 'Working...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => respondMutation.mutate({ requestId: request._id, action: 'reject' })}
                        disabled={respondMutation.isPending}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        {respondMutation.isPending ? 'Working...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-indigo-200/80 dark:border-gray-700 bg-white dark:bg-surface p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Connected</h2>
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {!connections.length && <p className="text-sm text-gray-500">No connections yet.</p>}
                {connections.map((connection) => (
                  <div key={connection._id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{connection.user?.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{connection.user?.role}</p>
                    <button
                      onClick={() => startConversation(connection.user?._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Start Chat
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-200/80 dark:border-gray-700 bg-white dark:bg-surface p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Social Profile</h2>
              <form onSubmit={submitProfile} className="space-y-3">
                <input
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  placeholder="Social headline"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                />
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Short bio"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1 inline-flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    Achievements (one per line)
                  </p>
                  <textarea
                    value={achievementsInput}
                    onChange={(event) => setAchievementsInput(event.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1 inline-flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    Recent works (title|description|link per line)
                  </p>
                  <textarea
                    value={recentWorksInput}
                    onChange={(event) => setRecentWorksInput(event.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full rounded-lg bg-primary-600 hover:bg-primary-700 text-white py-2.5 font-semibold disabled:opacity-60"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Social Profile'}
                </button>
                {socialProfile?._id && (
                  <p className="text-xs text-gray-500">Profile linked to your account and visible in discover cards.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
