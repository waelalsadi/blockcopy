'use client';

import { useState } from 'react';
import { Block, StartSectionData } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TipTapEditor } from './tiptap-editor';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  GripVertical,
  Wand2,
  Loader2,
  Sparkles,
  Lightbulb,
  PlusCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { generateContent } from '@/lib/openrouter';

// DnD imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BlocksAccordionProps {
  blocks: Block[];
  onAddBlock: (title: string, content?: string) => void;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
  onReorderBlocks?: (blockIds: string[]) => void;
  aiSettings: {
    apiKey: string;
    selectedModel: string;
    isVerified: boolean;
  };
  startSection?: StartSectionData;
  projectName?: string;
  clientName?: string;
}

// Default suggested sections
const DEFAULT_SUGGESTED_SECTIONS = [
  { id: 'hero', title: 'Hero Section', description: 'القسم الرئيسي والتعريف بالمشروع' },
  { id: 'problem', title: 'مشكلة العميل', description: 'عرض نقاط الألم والتحديات' },
  { id: 'solution', title: 'الحل', description: 'كيف يحل المشروع المشكلة' },
  { id: 'features', title: 'المميزات والفوائد', description: 'ما يميز المشروع والفوائد' },
  { id: 'how-it-works', title: 'كيف يعمل', description: 'خطوات عمل المنتج/الخدمة' },
  { id: 'testimonials', title: 'شهادات العملاء', description: 'آراء وتجارب العملاء' },
  { id: 'pricing', title: 'التسعير', description: 'خطط الأسعار والباقات' },
  { id: 'faq', title: 'الأسئلة الشائعة', description: 'FAQ - الأسئلة المتكررة' },
  { id: 'about', title: 'عن الشركة/الفريق', description: 'من نحن وقصتنا' },
  { id: 'cta', title: 'دعوة للعمل', description: 'Call to Action - ابدأ الآن' },
];

// Sortable Block Item Component
interface SortableBlockItemProps {
  block: Block;
  editingBlock: string | null;
  editTitle: string;
  generating: boolean;
  onStartEdit: (block: Block) => void;
  onSaveEdit: (blockId: string) => void;
  onCancelEdit: () => void;
  onDelete: (blockId: string) => void;
  onUpdateContent: (blockId: string, content: string) => void;
  onGenerateContent: (blockId: string) => void;
  setEditTitle: (title: string) => void;
}

function SortableBlockItem({
  block,
  editingBlock,
  editTitle,
  generating,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onUpdateContent,
  onGenerateContent,
  setEditTitle,
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AccordionItem
        value={block.id}
        className="border rounded-lg px-4 bg-white"
      >
        <AccordionTrigger className="hover:no-underline py-3">
          <div className="flex items-center gap-2 flex-1">
            {/* Drag Handle */}
            <button
              className="p-1 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-5 w-5 text-slate-400 hover:text-slate-600" />
            </button>
            
            {editingBlock === block.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      onSaveEdit(block.id);
                    }
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      onCancelEdit();
                    }
                  }}
                  className="h-8"
                  autoFocus
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveEdit(block.id);
                  }}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelEdit();
                  }}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ) : (
              <>
                <span className="font-medium flex-1 text-right">
                  {block.title}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartEdit(block);
                    }}
                  >
                    <Edit2 className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(block.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pb-4 space-y-3">
            {/* AI Generate Content Button */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-slate-600">
                  توليد محتوى تسويقي للقسم
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => onGenerateContent(block.id)}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 ml-2" />
                    توليد المحتوى
                  </>
                )}
              </Button>
            </div>

            {/* Editor */}
            <TipTapEditor
              content={block.content}
              onChange={(content) => onUpdateContent(block.id, content)}
              placeholder="اكتب محتوى القسم هنا... أو استخدم زر التوليد بالذكاء الاصطناعي"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

export function BlocksAccordion({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  aiSettings,
  startSection,
  projectName,
  clientName,
}: BlocksAccordionProps) {
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<string | null>(null);
  
  // AI Generation states
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [suggestedSections, setSuggestedSections] = useState<typeof DEFAULT_SUGGESTED_SECTIONS>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedBlocks.findIndex((b) => b.id === active.id);
      const newIndex = sortedBlocks.findIndex((b) => b.id === over.id);
      
      const newBlocks = arrayMove(sortedBlocks, oldIndex, newIndex);
      
      // Notify parent about reorder
      if (onReorderBlocks) {
        onReorderBlocks(newBlocks.map(b => b.id));
      }
      
      // Update order for each block
      newBlocks.forEach((block, index) => {
        if (block.order !== index) {
          onUpdateBlock(block.id, { order: index });
        }
      });
    }
  };

  const handleAddBlock = () => {
    if (newBlockTitle.trim()) {
      onAddBlock(newBlockTitle.trim());
      setNewBlockTitle('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (block: Block) => {
    setEditingBlock(block.id);
    setEditTitle(block.title);
  };

  const handleSaveEdit = (blockId: string) => {
    if (editTitle.trim()) {
      onUpdateBlock(blockId, { title: editTitle.trim() });
    }
    setEditingBlock(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingBlock(null);
    setEditTitle('');
  };

  const handleDeleteClick = (blockId: string) => {
    setBlockToDelete(blockId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (blockToDelete) {
      onDeleteBlock(blockToDelete);
      setBlockToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Build context from start section
  const buildContext = () => {
    const ss = startSection;
    if (!ss) return '';
    
    return `
معلومات المشروع:
- اسم المشروع: ${projectName || ''}
- العميل: ${clientName || ''}
- نبذة المشروع: ${ss.projectOverview || ''}

العميل المثالي:
- الديموغرافيا: ${ss.idealClient?.demographics || ''}
- نقاط الألم: ${ss.idealClient?.painPoints || ''}
- الأهداف: ${ss.idealClient?.goals || ''}
- الاعتراضات: ${ss.idealClient?.objections || ''}

فهم المشروع:
- المشكلة: ${ss.projectUnderstanding?.problem || ''}
- الحل: ${ss.projectUnderstanding?.solution || ''}
- القيمة الفريدة: ${ss.projectUnderstanding?.uniqueValue || ''}

الهدف العام: ${ss.generalGoal || ''}
`;
  };

  // Open AI dialog and generate suggestions
  const openAiDialog = async () => {
    if (!aiSettings.isVerified) {
      alert('يرجى إعداد OpenRouter أولاً');
      return;
    }

    setAiDialogOpen(true);
    setGenerating(true);
    setSuggestedSections([]);
    setSelectedSections([]);

    try {
      const context = buildContext();
      const prompt = `${context}

المطلوب: بناءً على المعلومات التالية عن المشروع، اقترح 8-10 أقسام مناسبة لموقع/مشروع يغطي جميع جوانب العرض التسويقي.

الأقسام يجب أن تشمل:
- Hero Section (القسم الرئيسي)
- المشكلة/نقاط الألم
- الحل/المنتج
- المميزات/Benefits
- كيف يعمل
- الشهادات/المراجعات
- التسعير
- الأسئلة الشائعة (FAQ)
- دعوة للعمل (CTA)
- عن الشركة/الفريق

أعد الإجابة كقائمة JSON فقط:
[
  {"id": "hero", "title": "Hero Section", "description": "..."},
  {"id": "problem", "title": "مشكلة العميل", "description": "..."}
]`;

      const systemPrompt = `أنت خبير في تصميم المواقع والتسويق الرقمي. اقترح أسماء أقسام احترافية ومناسبة للموقع. أعد JSON فقط.`;

      const content = await generateContent(
        aiSettings.apiKey,
        aiSettings.selectedModel,
        prompt,
        systemPrompt
      );

      // Parse JSON
      let sections: typeof DEFAULT_SUGGESTED_SECTIONS = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          sections = JSON.parse(jsonMatch[0]);
        } else {
          sections = JSON.parse(content);
        }
      } catch (e) {
        // Fallback to default sections
        sections = DEFAULT_SUGGESTED_SECTIONS;
      }

      setSuggestedSections(sections.slice(0, 10));
    } catch (error) {
      console.error('Generation failed:', error);
      // Use default sections on error
      setSuggestedSections(DEFAULT_SUGGESTED_SECTIONS);
    } finally {
      setGenerating(false);
    }
  };

  // Add selected sections
  const addSelectedSections = () => {
    selectedSections.forEach(sectionId => {
      const section = suggestedSections.find(s => s.id === sectionId);
      if (section) {
        onAddBlock(section.title);
      }
    });
    setAiDialogOpen(false);
    setSelectedSections([]);
  };

  // Toggle section selection
  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Select all sections
  const selectAll = () => {
    setSelectedSections(suggestedSections.map(s => s.id));
  };

  // Deselect all
  const deselectAll = () => {
    setSelectedSections([]);
  };

  // Generate content for a block
  const generateBlockContent = async (blockId: string) => {
    if (!aiSettings.isVerified) {
      alert('يرجى إعداد OpenRouter أولاً');
      return;
    }

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    setGenerating(true);

    try {
      const context = buildContext();
      const prompt = `${context}

المطلوب: اكتب محتوى تسويقي احترافي لقسم "${block.title}" في الموقع.

المتطلبات:
- المحتوى يجب أن يكون مقنعاً ويلائم العميل المثالي
- استخدم لغة عاطفية ومنطقية معاً
- اذكر المميزات والفوائد (Benefits وليس Features فقط)
- أضف دعوة للعمل (CTA) مناسبة في النهاية
- استخدم تنسيق HTML بسيط (<h2>, <p>, <ul>, <strong>)

اكتب المحتوى الآن:`;

      const systemPrompt = `أنت كاتب محتوى تسويقي محترف. اكتب محتوى جذاباً وقصيراً وفعالاً.`;

      const content = await generateContent(
        aiSettings.apiKey,
        aiSettings.selectedModel,
        prompt,
        systemPrompt
      );

      onUpdateBlock(blockId, { content });
    } catch (error) {
      console.error('Generation failed:', error);
      alert('فشل في توليد المحتوى');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Block Options */}
      <div className="grid grid-cols-2 gap-2">
        {!isAdding ? (
          <Button
            variant="outline"
            className="py-6 border-dashed"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة قسم يدوياً
          </Button>
        ) : (
          <div className="flex gap-2 p-2 border rounded-lg bg-slate-50 col-span-2">
            <Input
              placeholder="عنوان القسم..."
              value={newBlockTitle}
              onChange={(e) => setNewBlockTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddBlock();
                if (e.key === 'Escape') setIsAdding(false);
              }}
              autoFocus
            />
            <Button size="icon" onClick={handleAddBlock}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setIsAdding(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {!isAdding && (
          <Button
            variant="outline"
            className="py-6 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50"
            onClick={openAiDialog}
            disabled={!aiSettings.isVerified}
          >
            <Sparkles className="h-4 w-4 ml-2 text-blue-600" />
            توليد أقسام بالذكاء الاصطناعي
          </Button>
        )}
      </div>

      {!aiSettings.isVerified && !isAdding && (
        <p className="text-sm text-amber-600 text-center">
          ⚠️ يرجى إعداد OpenRouter في الإعدادات لاستخدام الذكاء الاصطناعي
        </p>
      )}

      {/* Draggable Blocks Accordion */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedBlocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <Accordion type="multiple" className="space-y-2">
            {sortedBlocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                editingBlock={editingBlock}
                editTitle={editTitle}
                generating={generating}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDelete={handleDeleteClick}
                onUpdateContent={(id, content) => onUpdateBlock(id, { content })}
                onGenerateContent={generateBlockContent}
                setEditTitle={setEditTitle}
              />
            ))}
          </Accordion>
        </SortableContext>
      </DndContext>

      {sortedBlocks.length === 0 && !isAdding && (
        <div className="text-center py-12 text-slate-400 border-2 border-dashed rounded-lg">
          <LayersIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>لا توجد أقسام بعد</p>
          <p className="text-sm">أضف قسماً يدوياً أو استخدم الذكاء الاصطناعي للاقتراحات</p>
        </div>
      )}

      {/* AI Sections Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              اقتراح أقسام الموقع
            </DialogTitle>
            <DialogDescription>
              AI سيحلل بيانات مشروعك ويقترح أقسام مناسبة. اختر الأقسام التي تريد إضافتها.
            </DialogDescription>
          </DialogHeader>

          {generating ? (
            <div className="py-12 text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-slate-600">جاري تحليل المشروع واقتراح الأقسام...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    تحديد الكل
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    إلغاء التحديد
                  </Button>
                </div>
                {selectedSections.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800">
                    {selectedSections.length} قسم محدد
                  </Badge>
                )}
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {suggestedSections.map((section) => (
                  <div
                    key={section.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSections.includes(section.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'hover:bg-slate-50'
                    }`}
                    onClick={() => toggleSection(section.id)}
                  >
                    <Checkbox
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{section.title}</h4>
                      <p className="text-sm text-slate-500">{section.description}</p>
                    </div>
                    {selectedSections.includes(section.id) && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={addSelectedSections}
                  disabled={selectedSections.length === 0}
                >
                  <PlusCircle className="h-4 w-4 ml-2" />
                  إضافة {selectedSections.length} قسم
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف القسم</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا القسم؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
