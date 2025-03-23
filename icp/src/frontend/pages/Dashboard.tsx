import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetAllGuardrails } from "../hooks/useGetAllGaurdRails";
import { useGetHealthStatus } from "../hooks/useGetHealthStatus";
import { useAuth } from "../context/AuthContext";
import { 
  FiFileText, 
  FiTrendingUp, 
  FiCheckSquare, 
  FiStar, 
  FiPlus, 
  FiCheckCircle,
  FiMessageSquare,
  FiList,
  FiArrowRight,
  FiUser,
} from "react-icons/fi";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  link: string;
  description?: string;
}

interface ActivityItemProps {
  type: 'vote' | 'rule' | 'comment';
  description: string;
  timestamp: string;
  impact?: string;
}

const Dashboard = () => {
  const { principal } = useAuth();
  // mutate means to change the data, status is the state of the data
  const { mutate: getAllGuardrails, data} = useGetAllGuardrails();
  // useEffect is a hook that runs after the first render and after every update
  useEffect(() => {
    getAllGuardrails();
  }, []);
  // to get the count of the guardrails, we use the length of the data
  const totalGuardrails = data?.length;
  // to get the count of gaurdrails created this week, we use the filter method
  const guardrailsThisWeek = data?.filter((guardrail) => {
    // to get the date of the guardrail creation
    const createdAt = new Date(Number(guardrail.created_at));
    // to get the current date
    const now = new Date();
    // to get the difference in days between the current date and the guardrail creation date
    const diff = now.getTime() - createdAt.getTime();
    // to get the difference in days
    const diffDays = diff / (1000 * 3600 * 24);
    // to return the guardrails created this week
    return diffDays <= 7;
  }).length;

  // to show the count of approved rules
  const approvedRules = data?.reduce((acc, guardrail) => {
    // to get the count of approved rules
    const approved = guardrail.rules.filter((rule) => rule.status.toString()[0] === "Approved").length;
    return acc + approved;
  }, 0);

  // to get the count of gaurdrails created this today, we use the filter method
  const guardrailsToday = data?.filter((guardrail) => {
    // to get the date of the guardrail creation
    const createdAt = new Date(Number(guardrail.created_at));
    // to get the current date
    const now = new Date();
    // to get the difference in days between the current date and the guardrail creation date
    const diff = now.getTime() - createdAt.getTime();
    // to get the difference in days
    const diffDays = diff / (1000 * 3600 * 24);
    // to return the guardrails created this week
    return diffDays <= 1;
  }).length;

  // to get the health status of the system
  const { data: healthStatus } = useGetHealthStatus();


  const systemStats = {
    totalRules: 142,
    activeProposals: 3,
    totalVotes: 1245,
    userReputation: 85,
  };

  const recentRules = [
    { 
      id: 1, 
      domain: "Healthcare", 
      status: "Active", 
      votes: 45,
      description: "HIPAA compliance and medical terminology filtering",
      lastUpdated: "2 days ago",
      impact: "High"
    },
    { 
      id: 2, 
      domain: "Finance", 
      status: "Pending", 
      votes: 12,
      description: "SEC compliance and financial data protection",
      lastUpdated: "5 hours ago",
      impact: "Medium"
    },
    { 
      id: 3, 
      domain: "Education", 
      status: "Active", 
      votes: 78,
      description: "Content appropriateness for K-12 students",
      lastUpdated: "1 day ago",
      impact: "High"
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left side - Title and Description */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Voters Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor and manage your LLM guardrails</p>
          </div>

          {/* Right side - User Info and System Status */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Principal ID */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <FiUser className="w-4 h-4 text-gray-500" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Principal ID</span>
                <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{principal}</span>
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  healthStatus?.status === 'healthy' 
                    ? 'bg-green-500' 
                    : healthStatus?.status === 'degraded' 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
              />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">System Status</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {healthStatus?.status ?? "Unavailable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rules"
          value={approvedRules || 0}
          icon={<FiFileText className="w-8 h-8" />}
          trend={`+${guardrailsToday} new today`}
          link="/manage-rules"
          description="Active guardrails across all domains"
        />
        <StatCard
          title="Active Proposals"
          value={totalGuardrails || 0}
          icon={<FiTrendingUp className="w-8 h-8" />}
          trend={`+${guardrailsThisWeek} new this week`}
          link="/voting"
          description="Rules pending community review"
        />
        <StatCard
          title="Total Votes"
          value={systemStats.totalVotes}
          icon={<FiCheckSquare className="w-8 h-8" />}
          trend="+45 this week"
          link="/voting"
          description="Cumulative community participation"
        />
        <StatCard
          title="Your Reputation"
          value={`${systemStats.userReputation}/100`}
          icon={<FiStar className="w-8 h-8" />}
          trend="+5 this month"
          link="/profile"
          description="Based on rule contributions and voting"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Rules Overview</h2>
              <p className="text-sm text-gray-600 mt-1">Recently updated guardrails</p>
            </div>
            <Link
              to="/manage-rules"
              className="text-sm flex items-center gap-1 hover:gap-2 transition-all text-gray-600 hover:text-gray-900"
            >
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium flex items-center gap-2 text-gray-900">
                      {rule.domain}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rule.impact === 'High' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}>
                        {rule.impact} Impact
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rule.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {rule.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Last updated: {rule.lastUpdated}</span>
                  <span className="font-medium">{rule.votes} votes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-600 mt-1">Your latest interactions</p>
              </div>
            </div>
            <div className="space-y-4">
              <ActivityItem
                type="vote"
                description="Voted on Healthcare Rule #45"
                timestamp="2 hours ago"
                impact="Helped achieve consensus"
              />
              <ActivityItem
                type="rule"
                description="Created new Finance Rule"
                timestamp="1 day ago"
                impact="Pending community review"
              />
              <ActivityItem
                type="comment"
                description="Commented on Education Proposal"
                timestamp="3 days ago"
                impact="3 replies received"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-600 mt-1">Common tasks and operations</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/create-gaurd"
                className="p-6 border border-gray-200 rounded-lg text-center flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors group"
              >
                <FiPlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium text-gray-900">Create Rule</div>
                  <div className="text-sm text-gray-600">Propose new guardrails</div>
                </div>
              </Link>
              <Link
                to="/voting"
                className="p-6 border border-gray-200 rounded-lg text-center flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors group"
              >
                <FiCheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-medium text-gray-900">Vote Now</div>
                  <div className="text-sm text-gray-600">Review pending proposals</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, link, description }: StatCardProps) => (
  <Link
    to={link}
    className="bg-white border border-gray-200 rounded-lg p-6 transition-colors hover:bg-gray-50 group"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="text-gray-600 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-sm text-gray-600">{trend}</span>
    </div>
    <div>
      <h3 className="text-2xl font-semibold mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  </Link>
);

const ActivityItem = ({ type, description, timestamp, impact }: ActivityItemProps) => {
  const icons = {
    vote: <FiCheckSquare className="w-5 h-5" />,
    rule: <FiList className="w-5 h-5" />,
    comment: <FiMessageSquare className="w-5 h-5" />,
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="flex items-center justify-center w-8 h-8 bg-gray-50 border border-gray-200 rounded-full">
        {icons[type]}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{description}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{timestamp}</p>
          {impact && (
            <>
              <span className="text-xs text-gray-300">•</span>
              <p className="text-xs text-gray-500">{impact}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;