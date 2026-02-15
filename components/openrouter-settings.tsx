'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Key,
  Check,
  X,
  Loader2,
  Sparkles,
  ExternalLink,
  Brain,
} from 'lucide-react';
import {
  OpenRouterSettings,
  verifyOpenRouterKey,
  loadOpenRouterSettings,
  saveOpenRouterSettings,
  MARKETING_MODELS,
} from '@/lib/openrouter';

interface OpenRouterSettingsProps {
  onSettingsChange?: (settings: OpenRouterSettings) => void;
}

export function OpenRouterSettingsPanel({ onSettingsChange }: OpenRouterSettingsProps) {
  const [settings, setSettings] = useState<OpenRouterSettings>(loadOpenRouterSettings);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showKey, setShowKey] = useState(false);
  const isInitialMount = useRef(true);

  // Only notify parent after initial mount and when settings actually change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const handleVerify = async () => {
    if (!settings.apiKey.trim()) return;

    setIsVerifying(true);
    setVerifyStatus('idle');

    const isValid = await verifyOpenRouterKey(settings.apiKey);

    setIsVerifying(false);
    setVerifyStatus(isValid ? 'success' : 'error');

    if (isValid) {
      const newSettings = { ...settings, isVerified: true };
      setSettings(newSettings);
      saveOpenRouterSettings(newSettings);
    }
  };

  const updateSettings = (updates: Partial<OpenRouterSettings>) => {
    const newSettings = { ...settings, ...updates, isVerified: false };
    setSettings(newSettings);
    saveOpenRouterSettings(newSettings);
    setVerifyStatus('idle');
  };

  return (
    <TooltipProvider>
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">OpenRouter AI</CardTitle>
                <CardDescription>
                  تكامل مع الذكاء الاصطناعي لمساعدتك في كتابة المحتوى
                </CardDescription>
              </div>
            </div>
            {settings.isVerified && (
              <Badge className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 ml-1" />
                متصل
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="api-key" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                مفتاح API
              </Label>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      احصل على مفتاح
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>فتح موقع OpenRouter</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  placeholder="sk-or-v1-..."
                  className="font-mono text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <X className="h-4 w-4" /> : <Key className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="show-key"
                checked={showKey}
                onCheckedChange={setShowKey}
              />
              <Label htmlFor="show-key" className="text-xs text-slate-500">
                إظهار المفتاح
              </Label>
            </div>
          </div>

          {/* Verify Button */}
          {settings.apiKey && !settings.isVerified && (
            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full"
              variant={verifyStatus === 'error' ? 'destructive' : 'default'}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التحقق...
                </>
              ) : verifyStatus === 'success' ? (
                <>
                  <Check className="h-4 w-4 ml-2" />
                  تم التحقق
                </>
              ) : verifyStatus === 'error' ? (
                <>
                  <X className="h-4 w-4 ml-2" />
                  فشل التحقق - أعد المحاولة
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 ml-2" />
                  اختبار الاتصال
                </>
              )}
            </Button>
          )}

          {/* Model Selection */}
          {settings.isVerified && (
            <div className="space-y-2">
              <Label htmlFor="model" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                نموذج الذكاء الاصطناعي
              </Label>
              <Select
                value={settings.selectedModel}
                onValueChange={(value) => updateSettings({ selectedModel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر النموذج" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {MARKETING_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-slate-500">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                النماذج مرتبة حسب القوة في كتابة المحتوى التسويقي
              </p>
            </div>
          )}

          {/* Status Messages */}
          {verifyStatus === 'error' && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              فشل التحقق من المفتاح. تأكد من صحة المفتاح وأن لديك رصيد كافي في OpenRouter.
            </div>
          )}
          {settings.isVerified && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
              ✅ تم الاتصال بنجاح! يمكنك الآن استخدام الذكاء الاصطناعي لمساعدتك في كتابة المحتوى.
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
