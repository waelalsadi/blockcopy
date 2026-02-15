'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Target,
  Users,
  Lightbulb,
  Settings,
  Sparkles,
  Loader2,
  Wand2,
  FileText,
  File,
  StickyNote,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { generateContent, OpenRouterSettings } from '@/lib/openrouter';
import { ProjectFile, StartSectionData, ProjectUnderstandingFramework } from '@/lib/types';
import { TipTapEditor } from './tiptap-editor';



interface StartSectionProps {
  data: StartSectionData;
  onChange: (data: StartSectionData) => void;
  aiSettings: OpenRouterSettings;
  projectFiles?: ProjectFile[];
  projectName?: string;
  projectDescription?: string;
  clientName?: string;
}

const DEFAULT_FRAMEWORK: ProjectUnderstandingFramework = {
  what: {
    complete: '',
    problemSolved: '',
    mechanism: '',
    features: '',
    price: '',
    requirements: '',
  },
  who: {
    complete: '',
    demographics: '',
    interests: '',
    desires: '',
    challenges: '',
    perspective: '',
  },
  why: {
    complete: '',
    whyBuyProduct: '',
    whyBuyFromYou: '',
    whyNotBuy: '',
    usp: '',
  },
  how: {
    complete: '',
    howItWorks: '',
    valueAdded: '',
    objectionHandling: '',
    faq: '',
  },
};

const DEFAULT_DATA: StartSectionData = {
  projectOverview: '',
  idealClient: {
    demographics: '',
    painPoints: '',
    goals: '',
    objections: '',
  },
  projectUnderstanding: {
    problem: '',
    solution: '',
    uniqueValue: '',
  },
  generalGoal: '',
  framework: DEFAULT_FRAMEWORK,
};

export function StartSection({ 
  data, 
  onChange, 
  aiSettings, 
  projectFiles = [],
  projectName = '',
  projectDescription = '',
  clientName = '',
}: StartSectionProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [generating, setGenerating] = useState<string | null>(null);
  const [frameworkActiveTab, setFrameworkActiveTab] = useState('what');

  const currentData = { ...DEFAULT_DATA, ...data };
  const currentFramework = currentData.framework || DEFAULT_FRAMEWORK;

  // Build context from project info
  const buildProjectContext = useCallback(() => {
    return `
معلومات المشروع:
- اسم المشروع: ${projectName}
- العميل: ${clientName}
- وصف المشروع: ${projectDescription}
- نبذة عامة: ${currentData.projectOverview}

البيانات الحالية:
- المشكلة: ${currentData.projectUnderstanding.problem}
- الحل: ${currentData.projectUnderstanding.solution}
- العميل المثالي: ${currentData.idealClient.demographics}
- نقاط الألم: ${currentData.idealClient.painPoints}
- الأهداف: ${currentData.idealClient.goals}
`;
  }, [projectName, clientName, projectDescription, currentData]);

  // Get content from ALL project files automatically
  const getAllFilesContent = useCallback(() => {
    if (projectFiles.length === 0) return '';
    
    const filesContent = projectFiles
      .map(f => {
        if (f.fileType === 'text') {
          return `=== ${f.name} ===\n${f.content || ''}`;
        }
        return `=== ${f.name} (ملف: ${f.type}) ===`;
      })
      .join('\n\n---\n\n');
    
    return `\n\n=== ملفات المشروع (${projectFiles.length} ملف) ===\n${filesContent}\n\n=== نهاية الملفات ===\n`;
  }, [projectFiles]);

  const updateField = (field: string, value: any) => {
    onChange({ ...currentData, [field]: value });
  };

  const updateNestedField = (parent: 'idealClient' | 'projectUnderstanding', field: string, value: string) => {
    const parentData = currentData[parent];
    onChange({
      ...currentData,
      [parent]: {
        ...parentData,
        [field]: value,
      } as typeof parentData,
    });
  };

  const updateFrameworkField = (
    section: keyof ProjectUnderstandingFramework,
    field: string,
    value: string
  ) => {
    onChange({
      ...currentData,
      framework: {
        ...currentFramework,
        [section]: {
          ...currentFramework[section],
          [field]: value,
        },
      },
    });
  };

  const handleAIGenerate = async (field: string, customPrompt?: string) => {
    if (!aiSettings.isVerified || !aiSettings.apiKey) {
      alert('يرجى إعداد OpenRouter أولاً من الإعدادات');
      return;
    }

    setGenerating(field);

    try {
      const systemPrompt = `أنت خبير تسويقي متخصص في تحليل المشاريع وكتابة المحتوى التسويقي. 
أجب باللغة العربية بشكل احترافي وواضح. قدم إجابات مفصلة وعملية.`;

      const projectContext = buildProjectContext();
      const filesContext = getAllFilesContent();
    const fullPrompt = customPrompt || `${projectContext}${filesContext}\n\nالمطلوب: قدم إجابة شاملة ومفصلة.`;

      const content = await generateContent(
        aiSettings.apiKey,
        aiSettings.selectedModel,
        fullPrompt,
        systemPrompt
      );

      // Handle framework fields
      if (field.includes('framework.')) {
        const parts = field.split('.');
        if (parts.length === 3) {
          const section = parts[1] as keyof ProjectUnderstandingFramework;
          const fieldName = parts[2];
          updateFrameworkField(section, fieldName, content);
        }
      } else if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (parent === 'idealClient' || parent === 'projectUnderstanding') {
          updateNestedField(parent, child, content);
        }
      } else {
        updateField(field, content);
      }
    } catch (error) {
      console.error('AI Generation failed:', error);
      alert('فشل في توليد المحتوى. تأكد من صحة مفتاح API.');
    } finally {
      setGenerating(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const generateFrameworkSection = async (section: keyof ProjectUnderstandingFramework) => {
    const fieldMap: Record<string, Record<string, string>> = {
      what: {
        problemSolved: 'المشكلة',
        mechanism: 'الآلية',
        features: 'المميزات',
        price: 'السعر',
        requirements: 'المتطلبات',
      },
      who: {
        demographics: 'الديموغرافيا',
        interests: 'الاهتمامات',
        desires: 'الرغبات',
        challenges: 'التحديات',
        perspective: 'وجهة النظر',
      },
      why: {
        whyBuyProduct: 'لماذا يشتري المنتج',
        whyBuyFromYou: 'لماذا منك أنت',
        whyNotBuy: 'لماذا قد لا يشتري',
        usp: 'العرض الفريد USP',
      },
      how: {
        howItWorks: 'كيف يعمل',
        valueAdded: 'القيمة المضافة',
        objectionHandling: 'معالجة الاعتراضات',
        faq: 'الأسئلة الشائعة',
      },
    };

    const promptIntro: Record<string, string> = {
      what: 'What - ما المنتج',
      who: 'Who - لمن',
      why: 'Why - لماذا',
      how: 'How - كيف',
    };

    const fields = fieldMap[section];
    const fieldsList = Object.entries(fields).map(([key, label]) => `${key}: ${label}`).join('\n');

    const prompt = `${buildProjectContext()}${getAllFilesContent()}

المطلوب: قم بتحليل المشروع واملأ بيانات قسم "${promptIntro[section]}".

المطلوب ملء الحقول التالية:
${fieldsList}

أعد الإجابة بالتنسيق التالي (JSON):
{
${Object.keys(fields).map(k => `  "${k}": "..."`).join(',\n')}
}

تأكد من أن الإجابات مفصلة وعملية.`;

    setGenerating(`framework.${section}.complete`);

    try {
      const systemPrompt = `أنت خبير تسويقي متخصص في تحليل المشاريع. أجب باللغة العربية بشكل احترافي وواضح. قدم إجابات مفصلة وعملية. أعد الإجابة بتنسيق JSON فقط.`;

      const content = await generateContent(
        aiSettings.apiKey,
        aiSettings.selectedModel,
        prompt,
        systemPrompt
      );

      // Try to parse JSON from response
      let parsed: Record<string, string> = {};
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(content);
        }
      } catch (e) {
        // If JSON parsing fails, save complete text and show error
        updateFrameworkField(section, 'complete', content);
        alert('لم يتمكن AI من إرجاع JSON منظم. تم حفظ النص الكامل في حقل "النص الكامل".');
        return;
      }

      // Update all fields
      Object.entries(parsed).forEach(([key, value]) => {
        if (fields[key]) {
          updateFrameworkField(section, key, value as string);
        }
      });

      // Also save complete text
      const completeText = Object.entries(parsed)
        .map(([key, value]) => `${fields[key]}:\n${value}`)
        .join('\n\n');
      updateFrameworkField(section, 'complete', completeText);

    } catch (error) {
      console.error('AI Generation failed:', error);
      alert('فشل في توليد المحتوى. تأكد من صحة مفتاح API.');
    } finally {
      setGenerating(null);
    }
  };

  const AIButton = ({ 
    field, 
    prompt,
    label = 'توليد بالذكاء الاصطناعي',
    size = 'sm' as const,
  }: { 
    field: string; 
    prompt?: string;
    label?: string;
    size?: 'sm' | 'default';
  }) => (
    <Button
      variant="outline"
      size={size}
      onClick={() => handleAIGenerate(field, prompt)}
      disabled={generating === field || !aiSettings.isVerified}
      className="mt-2"
    >
      {generating === field ? (
        <>
          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
          جاري التوليد...
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4 ml-2" />
          {label}
        </>
      )}
    </Button>
  );

  // Project Context Info Component - Shows files used as reference
  const ProjectContextInfo = () => (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">سياق المشروع</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {projectFiles.length} ملف مرجعي
          </Badge>
        </div>
        <CardDescription>
          جميع ملفات ونصوص المشروع تُستخدم تلقائياً كمرجع للذكاء الاصطناعي في جميع الأقسام
        </CardDescription>
      </CardHeader>
      {projectFiles.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {projectFiles.slice(0, 8).map((file) => (
              <Badge key={file.id} variant="outline" className="bg-white/80">
                {file.fileType === 'text' ? (
                  <StickyNote className="h-3 w-3 text-amber-500 ml-1" />
                ) : (
                  <File className="h-3 w-3 text-blue-500 ml-1" />
                )}
                {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
              </Badge>
            ))}
            {projectFiles.length > 8 && (
              <Badge variant="outline">+{projectFiles.length - 8} المزيد</Badge>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Project Context - Shows files used as reference for AI */}
      <ProjectContextInfo />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            نبذة المشروع
          </TabsTrigger>
          <TabsTrigger value="client" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            العميل المثالي
          </TabsTrigger>
          <TabsTrigger value="framework" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            إطار التحليل
          </TabsTrigger>
          <TabsTrigger value="goal" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            الهدف العام
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                نبذة عامة عن المشروع
              </CardTitle>
              <CardDescription>
                وصف مختصر للمشروع وما يقدمه
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TipTapEditor
                content={currentData.projectOverview}
                onChange={(content) => updateField('projectOverview', content)}
                placeholder="اكتب وصفاً عاماً للمشروع..."
              />
              <AIButton
                field="projectOverview"
                prompt={`${buildProjectContext()}${getAllFilesContent()}

المطلوب: بناءً على معلومات المشروع وملفاته، اكتب نبذة تسويقية قصيرة وجذابة توضح قيمة المشروع والمشكلة التي يحلها في 3-5 أسطر.`}
                label="تحسين بالذكاء الاصطناعي"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Tab */}
        <TabsContent value="client">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                العميل المثالي (Persona)
              </CardTitle>
              <CardDescription>
                حدد من هو عميلك المثالي بدقة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>الديموغرافيا والبيانات الأساسية</Label>
                <Textarea
                  value={currentData.idealClient.demographics}
                  onChange={(e) => updateNestedField('idealClient', 'demographics', e.target.value)}
                  placeholder="العمر، الجنس، الموقع الجغرافي، المهنة، الدخل..."
                  rows={3}
                />
                <AIButton
                  field="idealClient.demographics"
                  prompt={`${buildProjectContext()}${getAllFilesContent()}

المطلوب: بناءً على ملفات المشروع، حدد الديموغرافيا المستهدفة (العمر، الجنس، الموقع، المهنة، الدخل) للعميل المثالي.`}
                />
              </div>

              <div className="space-y-2">
                <Label>نقاط الألم (Pain Points)</Label>
                <Textarea
                  value={currentData.idealClient.painPoints}
                  onChange={(e) => updateNestedField('idealClient', 'painPoints', e.target.value)}
                  placeholder="ما هي المشاكل التي يواجهها العميل؟"
                  rows={3}
                />
                <AIButton
                  field="idealClient.painPoints"
                  prompt={`${buildProjectContext()}${getAllFilesContent()}

المطلوب: استناداً إلى ملفات المشروع، ما هي نقاط الألم الرئيسية التي يعاني منها العميل المستهدف؟`}
                />
              </div>

              <div className="space-y-2">
                <Label>الأهداف والرغبات</Label>
                <Textarea
                  value={currentData.idealClient.goals}
                  onChange={(e) => updateNestedField('idealClient', 'goals', e.target.value)}
                  placeholder="ما الذي يريد تحقيقه العميل؟"
                  rows={3}
                />
                <AIButton
                  field="idealClient.goals"
                  prompt={`${buildProjectContext()}${getAllFilesContent()}

المطلوب: بناءً على تحليل ملفات المشروع، ما هي أهداف ورغبات العميل المثالي؟`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Framework Tab - What/Who/Why/How */}
        <TabsContent value="framework">
          <div className="space-y-4">

            {/* Generate All Button */}
            <div className="flex gap-2">
              <Button
                onClick={() => generateFrameworkSection('what')}
                disabled={generating === 'framework.what.complete' || !aiSettings.isVerified}
                className="flex-1"
              >
                {generating === 'framework.what.complete' ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 ml-2" />
                )}
                توليد What
              </Button>
              <Button
                onClick={() => generateFrameworkSection('who')}
                disabled={generating === 'framework.who.complete' || !aiSettings.isVerified}
                className="flex-1"
              >
                {generating === 'framework.who.complete' ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 ml-2" />
                )}
                توليد Who
              </Button>
              <Button
                onClick={() => generateFrameworkSection('why')}
                disabled={generating === 'framework.why.complete' || !aiSettings.isVerified}
                className="flex-1"
              >
                {generating === 'framework.why.complete' ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 ml-2" />
                )}
                توليد Why
              </Button>
              <Button
                onClick={() => generateFrameworkSection('how')}
                disabled={generating === 'framework.how.complete' || !aiSettings.isVerified}
                className="flex-1"
              >
                {generating === 'framework.how.complete' ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 ml-2" />
                )}
                توليد How
              </Button>
            </div>

            <Tabs value={frameworkActiveTab} onValueChange={setFrameworkActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="what" className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  What
                </TabsTrigger>
                <TabsTrigger value="who" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Who
                </TabsTrigger>
                <TabsTrigger value="why" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  Why
                </TabsTrigger>
                <TabsTrigger value="how" className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-600" />
                  How
                </TabsTrigger>
              </TabsList>

              {/* What Tab */}
              <TabsContent value="what">
                <Card>
                  <CardHeader>
                    <CardTitle>What - ما المنتج؟</CardTitle>
                    <CardDescription>
                      الأساس المنطقي للعرض التسويقي
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentFramework.what.complete && (
                      <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                        <Label className="text-slate-600">النص الكامل</Label>
                        <Textarea
                          value={currentFramework.what.complete}
                          onChange={(e) => updateFrameworkField('what', 'complete', e.target.value)}
                          rows={4}
                          className="text-sm bg-white"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>ما المشكلة التي يحلها؟</Label>
                      <Textarea
                        value={currentFramework.what.problemSolved}
                        onChange={(e) => updateFrameworkField('what', 'problemSolved', e.target.value)}
                        placeholder="المشكلة الأساسية..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ما الآلية (Mechanism)؟</Label>
                      <Textarea
                        value={currentFramework.what.mechanism}
                        onChange={(e) => updateFrameworkField('what', 'mechanism', e.target.value)}
                        placeholder="كيف يعمل المنتج؟"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ما المميزات؟</Label>
                      <Textarea
                        value={currentFramework.what.features}
                        onChange={(e) => updateFrameworkField('what', 'features', e.target.value)}
                        placeholder="قائمة المميزات..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>السعر/النموذج التجاري</Label>
                        <Input
                          value={currentFramework.what.price}
                          onChange={(e) => updateFrameworkField('what', 'price', e.target.value)}
                          placeholder="التسعير..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>متطلبات التشغيل</Label>
                        <Input
                          value={currentFramework.what.requirements}
                          onChange={(e) => updateFrameworkField('what', 'requirements', e.target.value)}
                          placeholder="ما المطلوب؟"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Who Tab */}
              <TabsContent value="who">
                <Card>
                  <CardHeader>
                    <CardTitle>Who - لمن؟</CardTitle>
                    <CardDescription>
                      صوت العميل المثالي
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentFramework.who.complete && (
                      <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                        <Label className="text-slate-600">النص الكامل</Label>
                        <Textarea
                          value={currentFramework.who.complete}
                          onChange={(e) => updateFrameworkField('who', 'complete', e.target.value)}
                          rows={4}
                          className="text-sm bg-white"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>الديموغرافيا</Label>
                      <Textarea
                        value={currentFramework.who.demographics}
                        onChange={(e) => updateFrameworkField('who', 'demographics', e.target.value)}
                        placeholder="العمر، الجنس، الموقع..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الاهتمامات</Label>
                      <Textarea
                        value={currentFramework.who.interests}
                        onChange={(e) => updateFrameworkField('who', 'interests', e.target.value)}
                        placeholder="ما يهتم به العميل..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الرغبات</Label>
                      <Textarea
                        value={currentFramework.who.desires}
                        onChange={(e) => updateFrameworkField('who', 'desires', e.target.value)}
                        placeholder="ما يرغب في تحقيقه..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>التحديات</Label>
                      <Textarea
                        value={currentFramework.who.challenges}
                        onChange={(e) => updateFrameworkField('who', 'challenges', e.target.value)}
                        placeholder="العقبات التي يواجهها..."
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>وجهة النظر</Label>
                      <Textarea
                        value={currentFramework.who.perspective}
                        onChange={(e) => updateFrameworkField('who', 'perspective', e.target.value)}
                        placeholder="كيف يرى المشكلة؟"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Why Tab */}
              <TabsContent value="why">
                <Card>
                  <CardHeader>
                    <CardTitle>Why - لماذا؟</CardTitle>
                    <CardDescription>
                      الجوانب النفسية والتميز
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentFramework.why.complete && (
                      <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                        <Label className="text-slate-600">النص الكامل</Label>
                        <Textarea
                          value={currentFramework.why.complete}
                          onChange={(e) => updateFrameworkField('why', 'complete', e.target.value)}
                          rows={4}
                          className="text-sm bg-white"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>لماذا يشتري المنتج؟</Label>
                      <Textarea
                        value={currentFramework.why.whyBuyProduct}
                        onChange={(e) => updateFrameworkField('why', 'whyBuyProduct', e.target.value)}
                        placeholder="الدوافع العاطفية والمنطقية..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>لماذا منك أنت؟</Label>
                      <Textarea
                        value={currentFramework.why.whyBuyFromYou}
                        onChange={(e) => updateFrameworkField('why', 'whyBuyFromYou', e.target.value)}
                        placeholder="ما يميزك عن المنافسين..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>لماذا قد لا يشتري؟</Label>
                      <Textarea
                        value={currentFramework.why.whyNotBuy}
                        onChange={(e) => updateFrameworkField('why', 'whyNotBuy', e.target.value)}
                        placeholder="الاعتراضات المحتملة..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الـ USP (العرض الفريد)</Label>
                      <Textarea
                        value={currentFramework.why.usp}
                        onChange={(e) => updateFrameworkField('why', 'usp', e.target.value)}
                        placeholder="ما الذي يجعل عرضك فريداً..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* How Tab */}
              <TabsContent value="how">
                <Card>
                  <CardHeader>
                    <CardTitle>How - كيف؟</CardTitle>
                    <CardDescription>
                      التنفيذ والإقناع
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentFramework.how.complete && (
                      <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                        <Label className="text-slate-600">النص الكامل</Label>
                        <Textarea
                          value={currentFramework.how.complete}
                          onChange={(e) => updateFrameworkField('how', 'complete', e.target.value)}
                          rows={4}
                          className="text-sm bg-white"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>كيف يحقق النتيجة؟</Label>
                      <Textarea
                        value={currentFramework.how.howItWorks}
                        onChange={(e) => updateFrameworkField('how', 'howItWorks', e.target.value)}
                        placeholder="خطوات العمل..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>كيف يضيف قيمة؟</Label>
                      <Textarea
                        value={currentFramework.how.valueAdded}
                        onChange={(e) => updateFrameworkField('how', 'valueAdded', e.target.value)}
                        placeholder="القيمة الفعلية للعميل..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>معالجة الاعتراضات</Label>
                      <Textarea
                        value={currentFramework.how.objectionHandling}
                        onChange={(e) => updateFrameworkField('how', 'objectionHandling', e.target.value)}
                        placeholder="الرد على: ما عندي وقت، أخاف ما ينجح..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الأسئلة الشائعة (FAQ)</Label>
                      <Textarea
                        value={currentFramework.how.faq}
                        onChange={(e) => updateFrameworkField('how', 'faq', e.target.value)}
                        placeholder="الأسئلة المتكررة والإجابات..."
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Goal Tab */}
        <TabsContent value="goal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-600" />
                الهدف العام من الموقع
              </CardTitle>
              <CardDescription>
                ما هو الهدف الرئيسي من هذا الموقع/المشروع؟
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TipTapEditor
                content={currentData.generalGoal}
                onChange={(content) => updateField('generalGoal', content)}
                placeholder="مثال: زيادة المبيعات بنسبة 30%، جذب 1000 عميل جديد..."
              />
              <AIButton
                field="generalGoal"
                prompt={`${buildProjectContext()}${getAllFilesContent()}

المطلوب: بناءً على ملفات ومعلومات المشروع، اقترح هدف SMART محدد وقابل للقياس للموقع.`}
                label="اقتراح بالذكاء الاصطناعي"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
