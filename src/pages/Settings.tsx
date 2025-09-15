import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building, Shield, Bell, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const [companyProfile, setCompanyProfile] = useState({
    name: 'Acme Corporation',
    address: '123 Business St, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'contact@acme.com'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false
  });

  const [integrations, setIntegrations] = useState({
    slack: false,
    google: true,
    microsoft: false,
    zapier: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleCompanyProfileUpdate = () => {
    toast({
      title: "Success",
      description: "Company profile updated successfully"
    });
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Password changed successfully"
    });

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNotificationUpdate = () => {
    toast({
      title: "Success",
      description: "Notification settings updated"
    });
  };

  const handleIntegrationToggle = (integration: string, enabled: boolean) => {
    setIntegrations(prev => ({ ...prev, [integration]: enabled }));
    toast({
      title: enabled ? "Integration Enabled" : "Integration Disabled",
      description: `${integration.charAt(0).toUpperCase() + integration.slice(1)} integration ${enabled ? 'connected' : 'disconnected'}`
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and preferences</p>
      </div>

      {/* Company Profile */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Company Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-card-foreground">Company Name</Label>
              <Input
                id="companyName"
                value={companyProfile.name}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail" className="text-card-foreground">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={companyProfile.email}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, email: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress" className="text-card-foreground">Address</Label>
              <Input
                id="companyAddress"
                value={companyProfile.address}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, address: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone" className="text-card-foreground">Phone</Label>
              <Input
                id="companyPhone"
                value={companyProfile.phone}
                onChange={(e) => setCompanyProfile(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
          <Button onClick={handleCompanyProfileUpdate} className="bg-primary hover:bg-primary/90">
            Update Profile
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-card-foreground">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-card-foreground">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-card-foreground">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
            <Button onClick={handlePasswordChange} className="bg-primary hover:bg-primary/90">
              Change Password
            </Button>
          </div>

          <Separator className="bg-border" />

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">Two-Factor Authentication</h3>
              <p className="text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Active Sessions */}
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Active Sessions</h3>
            <p className="text-muted-foreground mb-4">Current session: Web Browser (This device)</p>
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
              Sign Out All Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-card-foreground">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={notificationSettings.email}
              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email: checked }))}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-card-foreground">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
            </div>
            <Switch
              checked={notificationSettings.sms}
              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, sms: checked }))}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          <Button onClick={handleNotificationUpdate} className="bg-primary hover:bg-primary/90">
            Update Notifications
          </Button>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-semibold text-card-foreground">Slack</h4>
                <p className="text-sm text-muted-foreground">Team communication</p>
              </div>
              <Switch
                checked={integrations.slack}
                onCheckedChange={(checked) => handleIntegrationToggle('slack', checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-semibold text-card-foreground">Google Workspace</h4>
                <p className="text-sm text-muted-foreground">Calendar and email sync</p>
              </div>
              <Switch
                checked={integrations.google}
                onCheckedChange={(checked) => handleIntegrationToggle('google', checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-semibold text-card-foreground">Microsoft Teams</h4>
                <p className="text-sm text-muted-foreground">Video conferencing</p>
              </div>
              <Switch
                checked={integrations.microsoft}
                onCheckedChange={(checked) => handleIntegrationToggle('microsoft', checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-semibold text-card-foreground">Zapier</h4>
                <p className="text-sm text-muted-foreground">Workflow automation</p>
              </div>
              <Switch
                checked={integrations.zapier}
                onCheckedChange={(checked) => handleIntegrationToggle('zapier', checked)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}