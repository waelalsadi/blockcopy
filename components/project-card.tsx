'use client';

import { Project } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar, User, Layers } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

const statusColors = {
  active: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  completed: 'bg-green-100 text-green-800 hover:bg-green-100',
  archived: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

const statusLabels = {
  active: 'نشط',
  completed: 'مكتمل',
  archived: 'مؤرشف',
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const formattedDate = new Date(project.updatedAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/project/${project.id}`}>
              <CardTitle className="text-lg hover:text-blue-600 cursor-pointer">
                {project.name}
              </CardTitle>
            </Link>
            <CardDescription className="mt-1">
              {project.description || 'لا يوجد وصف'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/project/${project.id}`}>
                <DropdownMenuItem>فتح المشروع</DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(project.id)}
              >
                حذف المشروع
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{project.clientName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            <span>{project.blocks.length} أقسام</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <div className="mt-4">
          <Badge className={statusColors[project.status]} variant="secondary">
            {statusLabels[project.status]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
