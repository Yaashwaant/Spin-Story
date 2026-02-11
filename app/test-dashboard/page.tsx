"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TestDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const testDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/dashboard", {
        credentials: "include",
      });

      const result = await response.json();
      console.log("Dashboard API response:", result);
      
      if (response.ok) {
        setDashboardData(result.data);
      } else {
        setError(result.error || "Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Dashboard test error:", err);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard Test</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-red-800 font-semibold mb-2">Error:</h2>
            <p className="text-red-700">{error}</p>
          </div>
          <button 
            onClick={testDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard Test</h1>
        
        {dashboardData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">User Info</h2>
              <p><strong>Name:</strong> {dashboardData.user.fullName}</p>
              <p><strong>Email:</strong> {dashboardData.user.email}</p>
              <p><strong>Onboarded:</strong> {dashboardData.user.onboarded ? "Yes" : "No"}</p>
            </div>

            {/* Display styling advice if available */}
            {dashboardData.user.profile?.aiExtractedTraits?.stylingAdvice && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-green-800">Your Personalized Styling Advice</h2>
                <div className="prose prose-sm max-w-none text-green-900">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => (
                        <p className="mb-3 last:mb-0 leading-relaxed text-green-900">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-green-800">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 space-y-1 mb-3 text-green-900">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 space-y-1 mb-3 text-green-900">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed text-green-900">{children}</li>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-3 mt-4 text-green-900">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold mb-2 mt-3 text-green-900">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold mb-2 mt-2 text-green-900">{children}</h3>
                      ),
                    }}
                  >
                    {dashboardData.user.profile.aiExtractedTraits.stylingAdvice}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Statistics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.stats.totalItems}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{dashboardData.stats.recentOutfits}</div>
                  <div className="text-sm text-gray-600">Recent Outfits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{dashboardData.stats.savedOutfits}</div>
                  <div className="text-sm text-gray-600">Saved Outfits</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">Recent Items</h3>
                {dashboardData.recentItems.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardData.recentItems.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded object-cover" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent items</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">Recent Outfits</h3>
                {dashboardData.recentOutfits.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardData.recentOutfits.map((outfit: any) => (
                      <div key={outfit.id} className="flex items-center space-x-3">
                        <img src={outfit.imageUrl} alt={outfit.name} className="w-12 h-12 rounded object-cover" />
                        <div>
                          <p className="font-medium">{outfit.name}</p>
                          <p className="text-sm text-gray-600">{outfit.occasion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recent outfits</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-3">Saved Outfits</h3>
                {dashboardData.savedOutfits.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardData.savedOutfits.map((outfit: any) => (
                      <div key={outfit.id} className="flex items-center space-x-3">
                        <img src={outfit.imageUrl} alt={outfit.name} className="w-12 h-12 rounded object-cover" />
                        <div>
                          <p className="font-medium">{outfit.name}</p>
                          <p className="text-sm text-gray-600">{outfit.occasion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No saved outfits</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button 
            onClick={testDashboard}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Refresh Dashboard Data
          </button>
        </div>
      </div>
    </div>
  );
}