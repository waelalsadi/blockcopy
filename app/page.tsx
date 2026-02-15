'use client';

import { useSession, signOut } from 'next-auth/react';
import { useProjectStore } from '@/lib/store';
import { ProjectCard } from '@/components/project-card';
import { CreateProjectDialog } from '@/components/create-project-dialog';
import { OpenRouterSettingsPanel } from '@/components/openrouter-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useCallback } from 'react';
import { Search, FolderOpen, Brain, Settings, LogOut, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { loadOpenRouterSettings, OpenRouterSettings } from '@/lib/openrouter';

export default function Home() {
  const { data: session } = useSession();
  const {
    projects,
    isLoaded,
    createProject,
    deleteProject,
  } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSettings, setAiSettings] = useState<OpenRouterSettings>(loadOpenRouterSettings);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Handle settings changes from the panel
  const handleSettingsChange = useCallback((settings: OpenRouterSettings) => {
    setAiSettings(settings);
  }, []);

  // Handle dialog open change
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (open) {
      // Refresh settings when opening
      setAiSettings(loadOpenRouterSettings());
    }
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <FolderOpen className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">مدير المشاريع</h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Brain className="h-3 w-3" />
                  {aiSettings.isVerified ? (
                    <span className="text-green-600 flex items-center gap-1">
                      AI: {aiSettings.selectedModel.split('/')[1]}
                    </span>
                  ) : (
                    <span className="text-slate-400">AI: غير متصل</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* AI Settings Dialog */}
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className={aiSettings.isVerified ? 'border-green-500 text-green-600' : ''}
                  onClick={() => setDialogOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <DialogContent 
                  className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
                  onPointerDownOutside={(e) => e.preventDefault()}
                >
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      إعدادات الذكاء الاصطناعي
                    </DialogTitle>
                  </DialogHeader>
                  <OpenRouterSettingsPanel 
                    onSettingsChange={handleSettingsChange} 
                  />
                </DialogContent>
              </Dialog>

              <CreateProjectDialog onCreate={createProject} />

              {/* User Menu */}
              {session?.user && (
                <div className="flex items-center gap-2 border-r pr-2 mr-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="h-4 w-4" />
                    <span>{session.user.name || session.user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => signOut()}
                    title="تسجيل الخروج"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="البحث في المشاريع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="bg-white px-4 py-2 rounded-lg border">
              <span className="font-semibold">{projects.length}</span> مشروع
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border">
              <span className="font-semibold text-blue-600">
                {projects.filter((p) => p.status === 'active').length}
              </span>{' '}
              نشط
            </div>
            <div className={`px-4 py-2 rounded-lg border ${aiSettings.isVerified ? 'bg-green-50 border-green-200' : 'bg-slate-50'}`}>
              <span className={`font-semibold ${aiSettings.isVerified ? 'text-green-600' : 'text-slate-400'}`}>
                {aiSettings.isVerified ? 'AI متصل' : 'AI غير متصل'}
              </span>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد مشاريع'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchQuery
                ? 'جرب البحث بكلمات مختلفة'
                : 'ابدأ بإنشاء مشروعك الأول'}
            </p>
            {!searchQuery && (
              <CreateProjectDialog onCreate={createProject} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
