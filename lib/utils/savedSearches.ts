/**
 * Gerenciamento de buscas salvas
 * 
 * Por enquanto usa localStorage, mas a estrutura está preparada
 * para migrar para backend/API quando necessário.
 */

import type { SearchState } from "@/lib/types/search";
import { serializeSearchState } from "./searchParams";

export interface SavedSearch {
  id: string;
  searchState: SearchState;
  savedAt: string; // ISO date string
  label?: string; // Nome personalizado (futuro)
}

const STORAGE_KEY = "navo_saved_searches";

/**
 * Gera um ID único para a busca baseado nos parâmetros
 */
function generateSearchId(searchState: SearchState): string {
  const key = serializeSearchState(searchState);
  // Hash simples para criar ID estável
  return btoa(key).replace(/[^a-zA-Z0-9]/g, "").substring(0, 16);
}

/**
 * Obtém todas as buscas salvas
 */
export function getSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("[SavedSearches] Error reading from localStorage:", error);
    return [];
  }
}

/**
 * Verifica se uma busca já está salva
 */
export function isSearchSaved(searchState: SearchState): boolean {
  const saved = getSavedSearches();
  const searchId = generateSearchId(searchState);
  return saved.some((s) => s.id === searchId);
}

/**
 * Salva uma busca
 */
export function saveSearch(searchState: SearchState): SavedSearch | null {
  if (typeof window === "undefined") return null;
  
  try {
    const saved = getSavedSearches();
    const searchId = generateSearchId(searchState);
    
    // Verifica se já existe
    const existing = saved.find((s) => s.id === searchId);
    if (existing) {
      return existing; // Já está salva
    }
    
    // Cria nova busca salva
    const newSearch: SavedSearch = {
      id: searchId,
      searchState,
      savedAt: new Date().toISOString(),
    };
    
    saved.push(newSearch);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    
    return newSearch;
  } catch (error) {
    console.error("[SavedSearches] Error saving to localStorage:", error);
    return null;
  }
}

/**
 * Remove uma busca salva
 */
export function removeSearch(searchState: SearchState): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const saved = getSavedSearches();
    const searchId = generateSearchId(searchState);
    
    const filtered = saved.filter((s) => s.id !== searchId);
    
    if (filtered.length === saved.length) {
      return false; // Não encontrou para remover
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("[SavedSearches] Error removing from localStorage:", error);
    return false;
  }
}

/**
 * Limpa todas as buscas salvas (útil para testes)
 */
export function clearAllSearches(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("[SavedSearches] Error clearing localStorage:", error);
  }
}

