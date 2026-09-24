// Mapa centralizado de iconos Lucide para todos los módulos de viabL
import {
  MapPin,
  Swords,
  DollarSign,
  TrendingUp,
  BarChart3,
  Scale,
  Sparkles,
  FileText,
  Bot,
  ClipboardList,
  Home,
  type LucideIcon,
} from 'lucide-react'

export type ModuleKey =
  | 'home'
  | 'mis-datos'
  | 'ubicacion'
  | 'competencia'
  | 'precios'
  | 'demanda'
  | 'estado-resultados'
  | 'break-even'
  | 'escenarios'
  | 'tramites'
  | 'agente'

export const MODULE_ICONS: Record<ModuleKey, LucideIcon> = {
  'home':              Home,
  'mis-datos':         ClipboardList,
  'ubicacion':         MapPin,
  'competencia':       Swords,
  'precios':           DollarSign,
  'demanda':           TrendingUp,
  'estado-resultados': BarChart3,
  'break-even':        Scale,
  'escenarios':        Sparkles,
  'tramites':          FileText,
  'agente':            Bot,
}
