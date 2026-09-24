// Mapa centralizado de iconos Lucide para todos los módulos de viabL
import {
  MapPin,
  Swords,
  DollarSign,
  TrendingUp,
  BarChart3,
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
  | 'simulador'
  | 'tramites'
  | 'agente'

export const MODULE_ICONS: Record<ModuleKey, LucideIcon> = {
  'home':       Home,
  'mis-datos':  ClipboardList,
  'ubicacion':  MapPin,
  'competencia':Swords,
  'precios':    DollarSign,
  'demanda':    TrendingUp,
  'simulador':  BarChart3,
  'tramites':   FileText,
  'agente':     Bot,
}
