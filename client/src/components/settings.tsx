import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function Settings() {
  const { toast } = useToast();
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  const [settings, setSettings] = useState({
    notifications: true,
    weeklyReports: false,
    theme: 'light',
    defaultVisualization: 'calendar',
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const response = await apiRequest('PATCH', '/api/user/settings', { settings: newSettings });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  return (
    <div className="h-full p-6 overflow-y-auto" data-testid="settings">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Settings</h3>
          
          <div className="space-y-6">
            {/* Notification Preferences */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Notification Preferences
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                    data-testid="checkbox-notifications"
                  />
                  <Label htmlFor="notifications" className="text-sm text-gray-600">
                    Daily streak reminders
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weeklyReports"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                    data-testid="checkbox-weekly-reports"
                  />
                  <Label htmlFor="weeklyReports" className="text-sm text-gray-600">
                    Weekly progress reports
                  </Label>
                </div>
              </div>
            </div>

            {/* Theme */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Theme
              </Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => handleSettingChange('theme', value)}
              >
                <SelectTrigger className="w-full" data-testid="select-theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Default Visualization */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Default Visualization
              </Label>
              <Select
                value={settings.defaultVisualization}
                onValueChange={(value) => handleSettingChange('defaultVisualization', value)}
              >
                <SelectTrigger className="w-full" data-testid="select-visualization">
                  <SelectValue placeholder="Select visualization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="calendar">Calendar Heatmap</SelectItem>
                  <SelectItem value="circle">Circular Progress</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Stats */}
            {user && (
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-4">Account Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Member since</div>
                    <div className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total Points</div>
                    <div className="font-medium text-accent">{user.totalPoints}</div>
                  </div>
                </div>
              </div>
            )}

            {updateSettingsMutation.isPending && (
              <div className="text-sm text-gray-500">Saving settings...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
