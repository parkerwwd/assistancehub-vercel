import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Palette, Code, Target } from 'lucide-react';

interface FlowSettingsProps {
  flow: any;
  onUpdate: (updates: any) => void;
}

export default function FlowSettings({ flow, onUpdate }: FlowSettingsProps) {
  const updateStyleConfig = (key: string, value: any) => {
    onUpdate({
      style_config: {
        ...flow.style_config,
        [key]: value
      }
    });
  };

  const updateGoogleAdsConfig = (key: string, value: any) => {
    onUpdate({
      google_ads_config: {
        ...flow.google_ads_config,
        [key]: value
      }
    });
  };

  return (
    <Tabs defaultValue="style" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="style" className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Style
        </TabsTrigger>
        <TabsTrigger value="tracking" className="flex items-center gap-2">
          <Target className="w-4 h-4" />
          Tracking
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          Advanced
        </TabsTrigger>
      </TabsList>

      <TabsContent value="style">
        <Card>
          <CardHeader>
            <CardTitle>Style Configuration</CardTitle>
            <CardDescription>
              Customize the appearance of your flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={flow.style_config?.primaryColor || '#3B82F6'}
                    onChange={(e) => updateStyleConfig('primaryColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={flow.style_config?.primaryColor || '#3B82F6'}
                    onChange={(e) => updateStyleConfig('primaryColor', e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={flow.style_config?.backgroundColor || '#F8FAFC'}
                    onChange={(e) => updateStyleConfig('backgroundColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={flow.style_config?.backgroundColor || '#F8FAFC'}
                    onChange={(e) => updateStyleConfig('backgroundColor', e.target.value)}
                    placeholder="#F8FAFC"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="fontFamily">Font Family</Label>
              <Input
                id="fontFamily"
                value={flow.style_config?.fontFamily || ''}
                onChange={(e) => updateStyleConfig('fontFamily', e.target.value)}
                placeholder="e.g., Inter, Arial, sans-serif"
              />
            </div>

            <div>
              <Label htmlFor="buttonStyle">Button Style</Label>
              <Select
                value={flow.style_config?.buttonStyle || 'rounded'}
                onValueChange={(value) => updateStyleConfig('buttonStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="pill">Pill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="layout">Layout Style</Label>
              <Select
                value={flow.style_config?.layout || 'centered'}
                onValueChange={(value) => updateStyleConfig('layout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="centered">Centered</SelectItem>
                  <SelectItem value="split">Split Screen</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={flow.style_config?.logoUrl || ''}
                onChange={(e) => updateStyleConfig('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <Label htmlFor="backgroundImageUrl">Background Image URL</Label>
              <Input
                id="backgroundImageUrl"
                value={flow.style_config?.backgroundImageUrl || ''}
                onChange={(e) => updateStyleConfig('backgroundImageUrl', e.target.value)}
                placeholder="https://example.com/background.jpg"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tracking">
        <Card>
          <CardHeader>
            <CardTitle>Google Ads Configuration</CardTitle>
            <CardDescription>
              Set up conversion tracking for your Google Ads campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="conversionId">Conversion ID</Label>
              <Input
                id="conversionId"
                value={flow.google_ads_config?.conversionId || ''}
                onChange={(e) => updateGoogleAdsConfig('conversionId', e.target.value)}
                placeholder="AW-XXXXXXXXX"
              />
              <p className="text-sm text-gray-600 mt-1">
                Found in Google Ads under Tools & Settings → Conversions
              </p>
            </div>

            <div>
              <Label htmlFor="conversionLabel">Conversion Label</Label>
              <Input
                id="conversionLabel"
                value={flow.google_ads_config?.conversionLabel || ''}
                onChange={(e) => updateGoogleAdsConfig('conversionLabel', e.target.value)}
                placeholder="AbC-D_efG-h12_34-567"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="remarketingTag">Enable Remarketing</Label>
                <p className="text-sm text-gray-600">
                  Add visitors to remarketing lists
                </p>
              </div>
              <Switch
                id="remarketingTag"
                checked={flow.google_ads_config?.remarketingTag || false}
                onCheckedChange={(checked) => updateGoogleAdsConfig('remarketingTag', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enhancedConversions">Enhanced Conversions</Label>
                <p className="text-sm text-gray-600">
                  Send hashed user data for better attribution
                </p>
              </div>
              <Switch
                id="enhancedConversions"
                checked={flow.google_ads_config?.enhancedConversions || false}
                onCheckedChange={(checked) => updateGoogleAdsConfig('enhancedConversions', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Other Tracking</CardTitle>
            <CardDescription>
              Additional tracking and analytics options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={flow.settings?.facebookPixelId || ''}
                onChange={(e) => onUpdate({
                  settings: { ...flow.settings, facebookPixelId: e.target.value }
                })}
                placeholder="1234567890"
              />
            </div>

            <div>
              <Label htmlFor="gtmContainerId">Google Tag Manager Container ID</Label>
              <Input
                id="gtmContainerId"
                value={flow.settings?.gtmContainerId || ''}
                onChange={(e) => onUpdate({
                  settings: { ...flow.settings, gtmContainerId: e.target.value }
                })}
                placeholder="GTM-XXXXXXX"
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
              <Label htmlFor="redirectUrl">Redirect URL (After Completion)</Label>
              <Input
                id="redirectUrl"
                value={flow.settings?.redirectUrl || ''}
                onChange={(e) => onUpdate({
                  settings: { ...flow.settings, redirectUrl: e.target.value }
                })}
                placeholder="https://example.com/thank-you"
              />
            </div>

            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                value={flow.settings?.webhookUrl || ''}
                onChange={(e) => onUpdate({
                  settings: { ...flow.settings, webhookUrl: e.target.value }
                })}
                placeholder="https://example.com/webhook"
              />
              <p className="text-sm text-gray-600 mt-1">
                POST request will be sent with lead data upon completion
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireCaptcha">Require CAPTCHA</Label>
                <p className="text-sm text-gray-600">
                  Add Google reCAPTCHA to prevent spam
                </p>
              </div>
              <Switch
                id="requireCaptcha"
                checked={flow.settings?.requireCaptcha || false}
                onCheckedChange={(checked) => onUpdate({
                  settings: { ...flow.settings, requireCaptcha: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="saveProgress">Save Progress</Label>
                <p className="text-sm text-gray-600">
                  Allow users to resume incomplete forms
                </p>
              </div>
              <Switch
                id="saveProgress"
                checked={flow.settings?.saveProgress || false}
                onCheckedChange={(checked) => onUpdate({
                  settings: { ...flow.settings, saveProgress: checked }
                })}
              />
            </div>

            <div>
              <Label htmlFor="customCss">Custom CSS</Label>
              <Textarea
                id="customCss"
                value={flow.settings?.customCss || ''}
                onChange={(e) => onUpdate({
                  settings: { ...flow.settings, customCss: e.target.value }
                })}
                placeholder=".custom-class { color: blue; }"
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}