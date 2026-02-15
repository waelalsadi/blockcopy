'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload,
  File,
  Image as ImageIcon,
  FileText,
  X,
  Download,
  Loader2,
  StickyNote,
  Plus,
  Edit2,
  Check,
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { ProjectFile } from '@/lib/types';

interface FileUploadProps {
  projectId: string;
  files: ProjectFile[];
  onFilesChange: (files: ProjectFile[]) => void;
}

export function FileUpload({ projectId, files, onFilesChange }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [textDialogOpen, setTextDialogOpen] = useState(false);
  const [editingText, setEditingText] = useState<ProjectFile | null>(null);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    setProgress(0);

    const newFiles: ProjectFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          newFiles.push(data.file);
        }

        setProgress(((i + 1) / fileList.length) * 100);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    onFilesChange([...files, ...newFiles]);
    setUploading(false);
    setProgress(0);
  };

  const handleDelete = async (file: ProjectFile) => {
    try {
      const response = await fetch(`/api/upload?id=${file.id}&type=${file.fileType}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onFilesChange(files.filter((f) => f.id !== file.id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  const getFileIcon = (file: ProjectFile) => {
    if (file.fileType === 'text') return <StickyNote className="h-5 w-5 text-amber-500" />;
    if (file.type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (file.type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-slate-500" />;
  };

  const handleSaveText = () => {
    if (!textTitle.trim()) return;

    if (editingText) {
      // Update existing text
      onFilesChange(
        files.map((f) =>
          f.id === editingText.id
            ? { ...f, name: textTitle, content: textContent }
            : f
        )
      );
    } else {
      // Add new text
      const newTextFile: ProjectFile = {
        id: `text-${Date.now()}`,
        url: '',
        name: textTitle,
        size: textContent.length,
        type: 'text/plain',
        fileType: 'text',
        content: textContent,
        createdAt: new Date(),
      };
      onFilesChange([...files, newTextFile]);
    }

    setTextDialogOpen(false);
    setTextTitle('');
    setTextContent('');
    setEditingText(null);
  };

  const openAddText = () => {
    setEditingText(null);
    setTextTitle('');
    setTextContent('');
    setTextDialogOpen(true);
  };

  const openEditText = (file: ProjectFile) => {
    setEditingText(file);
    setTextTitle(file.name);
    setTextContent(file.content || '');
    setTextDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Add Options */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            رفع ملف
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            إضافة نص
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          {/* Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors duration-200
              ${dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }
            `}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
            />
            
            {uploading ? (
              <div className="space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-slate-600">جاري الرفع...</p>
                <Progress value={progress} className="w-48 mx-auto" />
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 mx-auto text-slate-400" />
                <p className="text-sm font-medium text-slate-700">
                  اضغط أو اسحب الملفات هنا
                </p>
                <p className="text-xs text-slate-500">
                  يدعم الصور، PDF، Word، وغيرها
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="text">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <StickyNote className="h-10 w-10 mx-auto text-amber-400 mb-2" />
            <p className="text-sm font-medium text-slate-700 mb-4">
              أضف ملاحظة نصية أو رابط أو أي معلومة
            </p>
            <Button onClick={openAddText}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة نص جديد
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">
            الملفات والنصوص ({files.length})
          </h4>
          <div className="grid gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-white border rounded-lg group hover:border-blue-300 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {file.fileType === 'text' 
                      ? 'ملاحظة نصية' 
                      : formatFileSize(file.size)
                    }
                    {' • '}
                    {new Date(file.createdAt).toLocaleDateString('ar-SA')}
                  </p>
                  {file.fileType === 'text' && file.content && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {file.content.substring(0, 100)}
                      {file.content.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.fileType === 'text' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditText(file)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>لا توجد ملفات أو نصوص بعد</p>
          <p className="text-sm">أضف ملفاً أو نصاً للبدء</p>
        </div>
      )}

      {/* Text Dialog */}
      <Dialog open={textDialogOpen} onOpenChange={setTextDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-amber-500" />
              {editingText ? 'تعديل الملاحظة' : 'إضافة ملاحظة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">العنوان</label>
              <Input
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="مثال: ملاحظات الاجتماع، رابط الموقع..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">المحتوى</label>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="اكتب محتوى الملاحظة هنا..."
                rows={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setTextDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveText} disabled={!textTitle.trim()}>
                <Check className="h-4 w-4 ml-2" />
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
