'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Bot, User, Trash2, Sparkles } from 'lucide-react';
import { ChatMessage, ProjectFile, StartSectionData } from '@/lib/types';
import { generateContent } from '@/lib/openrouter';
import { v4 as uuidv4 } from 'uuid';

interface ProjectChatProps {
  projectId: string;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  aiSettings: {
    apiKey: string;
    selectedModel: string;
    isVerified: boolean;
  };
  projectName?: string;
  projectDescription?: string;
  clientName?: string;
  startSection?: StartSectionData;
  projectFiles?: ProjectFile[];
}

export function ProjectChat({
  messages,
  onMessagesChange,
  aiSettings,
  projectName,
  projectDescription,
  clientName,
  startSection,
  projectFiles = [],
}: ProjectChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const buildSystemContext = () => {
    const ss = startSection;
    const filesContext = projectFiles.length > 0 
      ? `\n\nملفات المشروع:\n${projectFiles.map(f => 
          f.fileType === 'text' 
            ? `- ${f.name}: ${f.content?.substring(0, 500)}...` 
            : `- ${f.name} (${f.type})`
        ).join('\n')}`
      : '';

    return `أنت مساعد ذكي متخصص في إدارة المشاريع والتسويق الرقمي. 
أنت تساعد في مشروع: "${projectName || 'غير محدد'}"

معلومات المشروع:
- العميل: ${clientName || 'غير محدد'}
- الوصف: ${projectDescription || 'غير متوفر'}
- النبذة: ${ss?.projectOverview || 'غير متوفر'}

العميل المثالي:
${ss?.idealClient ? `
- الديموغرافيا: ${ss.idealClient.demographics}
- نقاط الألم: ${ss.idealClient.painPoints}
- الأهداف: ${ss.idealClient.goals}
` : 'غير متوفر'}

فهم المشروع:
${ss?.projectUnderstanding ? `
- المشكلة: ${ss.projectUnderstanding.problem}
- الحل: ${ss.projectUnderstanding.solution}
- القيمة الفريدة: ${ss.projectUnderstanding.uniqueValue}
` : 'غير متوفر'}${filesContext}

أجب بشكل احترافي ومفيد. استخدم معلومات المشروع في إجاباتك.`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!aiSettings.isVerified) {
      alert('يرجى إعداد OpenRouter أولاً');
      return;
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    const newMessages = [...messages, userMessage];
    onMessagesChange(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history
      const conversationHistory = newMessages
        .slice(-10) // Last 10 messages for context
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const systemPrompt = buildSystemContext();

      const response = await generateContent(
        aiSettings.apiKey,
        aiSettings.selectedModel,
        input.trim(),
        `${systemPrompt}\n\nسياق المحادثة السابقة محفوظ. أجب على آخر رسالة فقط.`
      );

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response,
        createdAt: new Date(),
      };

      onMessagesChange([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى.',
        createdAt: new Date(),
      };
      onMessagesChange([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (confirm('هل أنت متأكد من مسح المحادثة؟')) {
      onMessagesChange([]);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] min-h-[500px] bg-white rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">مساعد المشروع</h3>
            <p className="text-xs text-slate-500">
              {aiSettings.isVerified 
                ? `متصل بـ ${aiSettings.selectedModel.split('/')[1]}` 
                : 'غير متصل'}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4 ml-1" />
            مسح المحادثة
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-medium mb-2">ابدأ المحادثة</h4>
              <p className="text-sm max-w-md mx-auto mb-4">
                اسأل عن أي شيء يتعلق بالمشروع. المساعد يعرف كل تفاصيل المشروع وملفاته.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInput('اكتب لي محتوى Hero Section')}
                >
                  <Sparkles className="h-3 w-3 ml-1" />
                  اكتب لي محتوى Hero Section
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInput('ما هي نقاط الألم الرئيسية للعميل؟')}
                >
                  نقاط ألم العميل
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInput('اقترح improvements للمشروع')}
                >
                  اقتراحات تحسين
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'assistant' ? 'bg-slate-50' : ''
                } p-4 rounded-lg`}
              >
                <Avatar className={message.role === 'assistant' ? 'bg-blue-600' : 'bg-slate-600'}>
                  <AvatarFallback>
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.role === 'assistant' ? 'المساعد' : 'أنت'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 p-4">
              <Avatar className="bg-blue-600">
                <AvatarFallback>
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">المساعد</span>
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">جاري الكتابة...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-slate-50">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              aiSettings.isVerified 
                ? 'اكتب رسالتك هنا... (Enter للإرسال, Shift+Enter لسطر جديد)' 
                : 'يرجى إعداد OpenRouter أولاً'
            }
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={!aiSettings.isVerified || isLoading}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !aiSettings.isVerified}
            className="h-auto px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          المساعد يعرف كل تفاصيل المشروع: {projectFiles.length} ملف، بيانات البداية، والمعلومات الأساسية
        </p>
      </div>
    </div>
  );
}
