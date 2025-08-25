import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { StyleConfig } from '@/types/flowSchema';

interface StyleEditorProps {
  styleConfig: StyleConfig;
  onChange: (updates: Partial<StyleConfig>) => void;
}

export default function StyleEditor({ styleConfig, onChange }: StyleEditorProps) {
  const colorPresets = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Primary Color</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="color"
                value={styleConfig.primaryColor}
                onChange={(e) => onChange({ primaryColor: e.target.value })}
                className="w-16 h-10 p-1 border rounded"
              />
              <div className="flex gap-2">
                {colorPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => onChange({ primaryColor: preset.value })}
                    style={{ backgroundColor: preset.value }}
                    className="w-8 h-8 p-0 border-2"
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label>Background Color</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                type="color"
                value={styleConfig.backgroundColor}
                onChange={(e) => onChange({ backgroundColor: e.target.value })}
                className="w-16 h-10 p-1 border rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Layout & Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Layout Style</Label>
            <Select
              value={styleConfig.layout}
              onValueChange={(value: 'centered' | 'split' | 'full') => 
                onChange({ layout: value })
              }
            >
              <SelectTrigger className="mt-2">
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
            <Label>Button Style</Label>
            <Select
              value={styleConfig.buttonStyle}
              onValueChange={(value: 'rounded' | 'square' | 'pill') => 
                onChange({ buttonStyle: value })
              }
            >
              <SelectTrigger className="mt-2">
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
            <Label>Border Radius</Label>
            <div className="mt-2">
              <Slider
                value={[styleConfig.borderRadius || 8]}
                onValueChange={([value]) => onChange({ borderRadius: value })}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">
                {styleConfig.borderRadius || 8}px
              </div>
            </div>
          </div>

          <div>
            <Label>Shadow Level</Label>
            <Select
              value={styleConfig.shadowLevel}
              onValueChange={(value: 'none' | 'sm' | 'md' | 'lg' | 'xl') => 
                onChange({ shadowLevel: value })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Font Family</Label>
            <Select
              value={styleConfig.fontFamily}
              onValueChange={(value) => onChange({ fontFamily: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader>
          <CardTitle>Images & Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Logo URL</Label>
            <Input
              type="url"
              value={styleConfig.logoUrl || ''}
              onChange={(e) => onChange({ logoUrl: e.target.value || undefined })}
              placeholder="https://example.com/logo.png"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Hero Image URL</Label>
            <Input
              type="url"
              value={styleConfig.heroImageUrl || ''}
              onChange={(e) => onChange({ heroImageUrl: e.target.value || undefined })}
              placeholder="https://example.com/hero.jpg"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Background Image URL</Label>
            <Input
              type="url"
              value={styleConfig.backgroundImageUrl || ''}
              onChange={(e) => onChange({ backgroundImageUrl: e.target.value || undefined })}
              placeholder="https://example.com/background.jpg"
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
