import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Layout, Gift, Shield, Sparkles, Settings } from 'lucide-react';
import { presetSteps } from '../components/NumberedSteps';
import { presetTrustBadges } from '../components/TrustBadges';
import { presetBenefits } from '../components/BenefitsList';

interface SinglePageLandingEditorProps {
  step: any;
  onUpdate: (updates: any) => void;
}

export default function SinglePageLandingEditor({ step, onUpdate }: SinglePageLandingEditorProps) {
  const settings = step.settings || {};

  const updateSetting = (key: string, value: any) => {
    onUpdate({
      settings: {
        ...settings,
        [key]: value
      }
    });
  };

  const applyCompetitorPreset = () => {
    onUpdate({
      settings: {
        ...settings,
        layoutType: 'centered',
        formLayout: 'stacked',
        showProgressSteps: true,
        showBenefits: true,
        stepsPreset: 'section8Housing',
        benefitPreset: 'section8',
        benefitsTitle: 'What Do I Get When Signing Up?',
        buttonText: 'Download Application Guide',
        buttonColor: '#AF1E3F',
        primaryColor: '#0891B2',
        accentColor: '#10B981',
        trustBadgePreset: 'standard'
      }
    });
  };

  return (
    <Tabs defaultValue="layout" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="layout" className="flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Layout
        </TabsTrigger>
        <TabsTrigger value="content" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Content
        </TabsTrigger>
        <TabsTrigger value="style" className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Style
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Advanced
        </TabsTrigger>
      </TabsList>

      <TabsContent value="layout">
        <Card>
          <CardHeader>
            <CardTitle>Layout Configuration</CardTitle>
            <CardDescription>
              Configure the overall layout and structure
            </CardDescription>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={applyCompetitorPreset}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Apply Competitor Style Preset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="layoutType">Layout Type</Label>
              <Select
                value={settings.layoutType || 'centered'}
                onValueChange={(value) => updateSetting('layoutType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centered">Centered (Competitor Style)</SelectItem>
                  <SelectItem value="heroSplit">Hero Split (Image + Form)</SelectItem>
                  <SelectItem value="minimal">Minimal (Form Only)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Centered layout matches competitor design with hero background
              </p>
            </div>

            <div>
              <Label htmlFor="formLayout">Form Layout</Label>
              <Select
                value={settings.formLayout || 'stacked'}
                onValueChange={(value) => updateSetting('formLayout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stacked">Stacked (Vertical)</SelectItem>
                  <SelectItem value="grid">Grid (2 Columns)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="heroImage">Hero Image URL</Label>
              <Input
                id="heroImage"
                value={settings.heroImage || ''}
                onChange={(e) => updateSetting('heroImage', e.target.value)}
                placeholder="https://example.com/hero-image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                value={settings.logo || ''}
                onChange={(e) => updateSetting('logo', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="content">
        <div className="space-y-4">
          {/* Steps Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Progress Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Progress Steps</Label>
                  <p className="text-sm text-gray-600">Display numbered steps to users</p>
                </div>
                <Switch
                  checked={settings.showProgressSteps !== false}
                  onCheckedChange={(checked) => updateSetting('showProgressSteps', checked)}
                />
              </div>

              <div>
                <Label htmlFor="stepsPreset">Steps Preset</Label>
                <Select
                  value={settings.stepsPreset || 'section8Housing'}
                  onValueChange={(value) => updateSetting('stepsPreset', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section8Housing">Section 8 Housing</SelectItem>
                    <SelectItem value="generalApplication">General Application</SelectItem>
                    <SelectItem value="custom">Custom Steps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Benefits List
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Benefits</Label>
                  <p className="text-sm text-gray-600">Display what users will receive</p>
                </div>
                <Switch
                  checked={settings.showBenefits !== false}
                  onCheckedChange={(checked) => updateSetting('showBenefits', checked)}
                />
              </div>

              <div>
                <Label htmlFor="benefitsTitle">Benefits Section Title</Label>
                <Input
                  id="benefitsTitle"
                  value={settings.benefitsTitle || 'What Do I Get When Signing Up?'}
                  onChange={(e) => updateSetting('benefitsTitle', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="benefitPreset">Benefits Preset</Label>
                <Select
                  value={settings.benefitPreset || 'section8'}
                  onValueChange={(value) => updateSetting('benefitPreset', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section8">Section 8 Benefits</SelectItem>
                    <SelectItem value="general">General Benefits</SelectItem>
                    <SelectItem value="premium">Premium Benefits</SelectItem>
                    <SelectItem value="custom">Custom Benefits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Trust Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trustBadgePreset">Trust Badge Preset</Label>
                <Select
                  value={settings.trustBadgePreset || 'standard'}
                  onValueChange={(value) => updateSetting('trustBadgePreset', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (Secure + SPAM Free)</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="government">Government/HUD Focused</SelectItem>
                    <SelectItem value="custom">Custom Badges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="style">
        <Card>
          <CardHeader>
            <CardTitle>Style Configuration</CardTitle>
            <CardDescription>
              Customize colors and appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.primaryColor || '#1E40AF'}
                    onChange={(e) => updateSetting('primaryColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.primaryColor || '#1E40AF'}
                    onChange={(e) => updateSetting('primaryColor', e.target.value)}
                    placeholder="#1E40AF"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accentColor">Accent Color (Checkmarks)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.accentColor || '#10B981'}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.accentColor || '#10B981'}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    placeholder="#10B981"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="buttonColor">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.buttonColor || '#3B82F6'}
                    onChange={(e) => updateSetting('buttonColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={settings.buttonColor || '#3B82F6'}
                    onChange={(e) => updateSetting('buttonColor', e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={settings.buttonText || 'Download Application Guide'}
                onChange={(e) => updateSetting('buttonText', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="advanced">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Additional configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customCss">Custom CSS</Label>
              <Textarea
                id="customCss"
                value={settings.customCss || ''}
                onChange={(e) => updateSetting('customCss', e.target.value)}
                placeholder=".custom-class { color: blue; }"
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label>Quick Presets</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateSetting('stepsPreset', 'section8Housing');
                    updateSetting('benefitPreset', 'section8');
                    updateSetting('trustBadgePreset', 'government');
                    updateSetting('primaryColor', '#1E40AF');
                    updateSetting('buttonText', 'Download Application Guide');
                  }}
                >
                  <Badge className="mr-2">Section 8</Badge>
                  Apply Section 8 Theme
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateSetting('stepsPreset', 'generalApplication');
                    updateSetting('benefitPreset', 'general');
                    updateSetting('trustBadgePreset', 'standard');
                    updateSetting('primaryColor', '#3B82F6');
                    updateSetting('buttonText', 'Get Started');
                  }}
                >
                  <Badge className="mr-2">General</Badge>
                  Apply General Theme
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}