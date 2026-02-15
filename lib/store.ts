'use client';

import { useState, useCallback, useEffect } from 'react';
import { Project, Block } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'project-manager-data';

export function useProjectStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProjects(parsed.map((p: Project) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
            blocks: p.blocks.map((b: Block) => ({
              ...b,
              createdAt: new Date(b.createdAt),
              updatedAt: new Date(b.updatedAt),
            })),
          })));
        } catch (e) {
          console.error('Failed to parse stored projects', e);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever projects change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects, isLoaded]);

  const createProject = useCallback((name: string, clientName: string, description: string = '') => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      clientName,
      description,
      content: '',
      blocks: [],
      files: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject.id;
  }, []);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, ...updates, updatedAt: new Date() }
          : p
      )
    );
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  }, []);

  const getProject = useCallback(
    (projectId: string) => projects.find((p) => p.id === projectId),
    [projects]
  );

  // Block operations
  const addBlock = useCallback((projectId: string, title: string, content: string = '') => {
    const newBlock: Block = {
      id: uuidv4(),
      title,
      content,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const maxOrder = p.blocks.reduce((max, b) => Math.max(max, b.order), -1);
          newBlock.order = maxOrder + 1;
          return {
            ...p,
            blocks: [...p.blocks, newBlock],
            updatedAt: new Date(),
          };
        }
        return p;
      })
    );
    return newBlock.id;
  }, []);

  const updateBlock = useCallback(
    (projectId: string, blockId: string, updates: Partial<Block>) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            return {
              ...p,
              blocks: p.blocks.map((b) =>
                b.id === blockId ? { ...b, ...updates, updatedAt: new Date() } : b
              ),
              updatedAt: new Date(),
            };
          }
          return p;
        })
      );
    },
    []
  );

  const deleteBlock = useCallback((projectId: string, blockId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            blocks: p.blocks.filter((b) => b.id !== blockId),
            updatedAt: new Date(),
          };
        }
        return p;
      })
    );
  }, []);

  const reorderBlocks = useCallback(
    (projectId: string, blockIds: string[]) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            const blocksMap = new Map(p.blocks.map((b) => [b.id, b]));
            const reorderedBlocks = blockIds
              .map((id) => blocksMap.get(id))
              .filter((b): b is Block => b !== undefined)
              .map((b, index) => ({ ...b, order: index }));
            return {
              ...p,
              blocks: reorderedBlocks,
              updatedAt: new Date(),
            };
          }
          return p;
        })
      );
    },
    []
  );

  const updateChat = useCallback((projectId: string, messages: import('./types').ChatMessage[]) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            chat: {
              messages,
              updatedAt: new Date(),
            },
            updatedAt: new Date(),
          };
        }
        return p;
      })
    );
  }, []);

  return {
    projects,
    isLoaded,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    updateChat,
  };
}
