import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/Header';
import {
  LayoutGrid, BarChart3, TestTube, Users, Plug, Brain, 
  Sparkles, Database, Megaphone, UserCheck, Settings,
  Zap, Target, GitBranch
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = "Admin Dashboard", 
  description = "Manage your lead flow system" 
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const adminMenuItems = [
    {
      category: "Flow Management",
      items: [
        {
          name: "Lead Flows",
          path: "/admin/flows",
          icon: Megaphone,
          description: "Create and manage lead capture flows",
          isActive: location.pathname.startsWith("/admin/flows")
        },
        {
          name: "Leads",
          path: "/admin/leads",
          icon: UserCheck,
          description: "View and manage captured leads",
          isActive: location.pathname === "/admin/leads"
        },
        {
          name: "Data Import",
          path: "/data-admin",
          icon: Database,
          description: "Import housing and PHA data",
          isActive: location.pathname === "/data-admin"
        }
      ]
    },
    {
      category: "Intelligence & Optimization",
      items: [
        {
          name: "Analytics",
          path: "/admin/analytics",
          icon: BarChart3,
          description: "Conversion funnels and performance metrics",
          isActive: location.pathname.startsWith("/admin/analytics"),
          badge: "Enterprise"
        },
        {
          name: "A/B Testing",
          path: "/admin/ab-testing",
          icon: TestTube,
          description: "Statistical testing and optimization",
          isActive: location.pathname === "/admin/ab-testing",
          badge: "Enterprise"
        },
        {
          name: "AI Optimization",
          path: "/admin/ai-optimization",
          icon: Sparkles,
          description: "AI-powered optimization and lead scoring",
          isActive: location.pathname.startsWith("/admin/ai-optimization"),
          badge: "AI"
        }
      ]
    },
    {
      category: "Advanced Features",
      items: [
        {
          name: "Logic Builder",
          path: "/admin/logic-builder",
          icon: GitBranch,
          description: "Visual business rules and personalization",
          isActive: location.pathname.startsWith("/admin/logic-builder"),
          badge: "Pro",
          disabled: true // Requires flow selection
        },
        {
          name: "Integrations",
          path: "/admin/integrations",
          icon: Plug,
          description: "CRM and third-party integrations",
          isActive: location.pathname === "/admin/integrations",
          badge: "Enterprise"
        }
      ]
    },
    {
      category: "Team & Security",
      items: [
        {
          name: "Team Management",
          path: "/admin/team",
          icon: Users,
          description: "User roles, permissions, and collaboration",
          isActive: location.pathname === "/admin/team",
          badge: "Enterprise"
        }
      ]
    }
  ];

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Enterprise': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AI': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Pro': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-4">
                <div className="space-y-6">
                  {adminMenuItems.map((category) => (
                    <div key={category.category}>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        {category.category}
                      </h3>
                      <div className="space-y-1">
                        {category.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Button
                              key={item.path}
                              variant={item.isActive ? "default" : "ghost"}
                              className={`
                                w-full justify-start h-auto p-3 
                                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                ${item.isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}
                              `}
                              onClick={() => !item.disabled && navigate(item.path)}
                              disabled={item.disabled}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-3">
                                  <Icon className="w-4 h-4" />
                                  <div className="text-left">
                                    <div className="text-sm font-medium">{item.name}</div>
                                  </div>
                                </div>
                                {item.badge && (
                                  <Badge 
                                    className={`text-xs ${getBadgeColor(item.badge)}`}
                                    variant="outline"
                                  >
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                      {category !== adminMenuItems[adminMenuItems.length - 1] && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Quick Stats */}
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">System Status</span>
                  </div>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex justify-between">
                      <span>Analytics</span>
                      <span className="font-medium">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Models</span>
                      <span className="font-medium">Ready</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Integrations</span>
                      <span className="font-medium">2 Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
