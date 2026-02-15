'use client';

import { useParams } from 'next/navigation';
import { useProjectStore } from '@/lib/store';
import { TipTapEditor } from '@/components/tiptap-editor';
import { BlocksAccordion } from '@/components/blocks-accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  Calendar,
  User,
  Clock,
  FileText,
  LayoutGrid,
  Save,
  FolderOpen,
  Rocket,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/file-upload';
import { StartSection } from '@/components/start-section';
import { ProjectChat } from '@/components/project-chat';
import { loadOpenRouterSettings, OpenRouterSettings } from '@/lib/openrouter';
import { ChatMessage } from '@/lib/types';

const statusOptions = [
  { value: 'active', label: 'نشط', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'مكتمل', color: 'bg-green-100 text-green-800' },
  { value: 'archived', label: 'مؤرشف', color: 'bg-gray-100 text-gray-800' },
];

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const {
    getProject,
    updateProject,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    updateChat,
  } = useProjectStore();

  const project = getProject(projectId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedClient, setEditedClient] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'start' | 'editor' | 'blocks' | 'chat' | 'files'>('start');
  const [aiSettings, setAiSettings] = useState<OpenRouterSettings>(loadOpenRouterSettings);

  // Load AI settings on mount
  useEffect(() => {
    setAiSettings(loadOpenRouterSettings());
  }, []);

  useEffect(() => {
    if (project) {
      setEditedName(project.name);
      setEditedClient(project.clientName);
      setEditedDescription(project.description);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-700 mb-2">
            المشروع غير موجود
          </h1>
          <p className="text-slate-500 mb-4">المشروع الذي تبحث عنه غير موجود</p>
          <Link href="/">
            <Button>العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProjectInfo = () => {
    updateProject(projectId, {
      name: editedName,
      clientName: editedClient,
      description: editedDescription,
    });
    setIsEditing(false);
  };

  const formattedDate = new Date(project.createdAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusOption = statusOptions.find((s) => s.value === project.status);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowRight className="h-4 w-4 ml-1" />
                رجوع
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="max-w-xs"
                />
                <Button size="sm" onClick={handleSaveProjectInfo}>
                  <Save className="h-4 w-4 ml-1" />
                  حفظ
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditedName(project.name);
                    setEditedClient(project.clientName);
                    setEditedDescription(project.description);
                    setIsEditing(false);
                  }}
                >
                  إلغاء
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1">
                <h1
                  className="text-xl font-bold cursor-pointer hover:text-blue-600"
                  onClick={() => setIsEditing(true)}
                >
                  {project.name}
                </h1>
                <Badge className={statusOption?.color} variant="secondary">
                  {statusOption?.label}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Project Info */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500 mb-1 block">
                  اسم العميل
                </label>
                <Input
                  value={editedClient}
                  onChange={(e) => setEditedClient(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1 block">
                  حالة المشروع
                </label>
                <Select
                  value={project.status}
                  onValueChange={(value: any) =>
                    updateProject(projectId, { status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-500 mb-1 block">
                  وصف المشروع
                </label>
                <Input
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">العميل:</span>
                <span className="font-medium">{project.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">تاريخ الإنشاء:</span>
                <span className="font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">آخر تحديث:</span>
                <span className="font-medium">
                  {new Date(project.updatedAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
              {project.description && (
                <div className="w-full mt-2 text-slate-600">
                  {project.description}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('start')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'start'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Rocket className="h-4 w-4" />
              البداية
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'editor'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              المحرر
            </button>
            <button
              onClick={() => setActiveTab('blocks')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'blocks'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              الأقسام ({project.blocks.length})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              المحادثات
              {project.chat?.messages && project.chat.messages.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {project.chat.messages.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'files'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              الملفات ({project.files?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'start' ? (
          <div className="space-y-4">
            <StartSection
              data={project.startSection || {
                projectOverview: '',
                idealClient: { demographics: '', painPoints: '', goals: '', objections: '' },
                projectUnderstanding: { problem: '', solution: '', uniqueValue: '' },
                generalGoal: '',
              }}
              onChange={(data) => updateProject(projectId, { startSection: data })}
              aiSettings={aiSettings}
              projectFiles={project.files || []}
              projectName={project.name}
              projectDescription={project.description}
              clientName={project.clientName}
            />
          </div>
        ) : activeTab === 'editor' ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm">
              <TipTapEditor
                content={project.content}
                onChange={(content) => updateProject(projectId, { content })}
                placeholder="اكتب ملاحظاتك وأفكارك هنا..."
              />
            </div>
          </div>
        ) : activeTab === 'blocks' ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">أقسام المشروع</h2>
              <p className="text-slate-500 text-sm">
                قم بإنشاء أقسام لتنظيم محتوى الموقع. كل قسم يمكن أن يحتوي على
                محتوى منفصل.
              </p>
            </div>
            <BlocksAccordion
              blocks={project.blocks}
              onAddBlock={(title) => addBlock(projectId, title)}
              onUpdateBlock={(blockId, updates) =>
                updateBlock(projectId, blockId, updates)
              }
              onDeleteBlock={(blockId) => deleteBlock(projectId, blockId)}
              onReorderBlocks={(blockIds) => reorderBlocks(projectId, blockIds)}
              aiSettings={aiSettings}
              startSection={project.startSection}
              projectName={project.name}
              clientName={project.clientName}
            />
          </div>
        ) : activeTab === 'chat' ? (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-2">محادثات المشروع</h2>
              <p className="text-slate-500 text-sm mb-4">
                تحدث مع AI عن المشروع. المساعد يعرف كل تفاصيل المشروع وملفاته ويمكنه مساعدتك في أي شيء.
              </p>
            </div>
            <ProjectChat
              projectId={projectId}
              messages={project.chat?.messages || []}
              onMessagesChange={(messages) => updateChat(projectId, messages)}
              aiSettings={aiSettings}
              projectName={project.name}
              projectDescription={project.description}
              clientName={project.clientName}
              startSection={project.startSection}
              projectFiles={project.files || []}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">ملفات المشروع</h2>
              <p className="text-slate-500 text-sm">
                ارفع ملفات العميل (صور، ملفات Word, PDF, إلخ)
              </p>
            </div>
            <FileUpload
              projectId={projectId}
              files={project.files || []}
              onFilesChange={(files) =>
                updateProject(projectId, { files })
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
