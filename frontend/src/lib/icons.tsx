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
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'

export type ModuleKey =
  | 'home'
  | 'mis-datos'
  | 'ubicacion'
  | 'competencia'
  | 'mercado'
  | 'simulador'
  | 'tramites'
  | 'agente'

export const MODULE_ICONS: Record<ModuleKey, LucideIcon> = {
  'home':        Home,
  'mis-datos':   ClipboardList,
  'ubicacion':   MapPin,
  'competencia': Swords,
  'mercado':     ShoppingBag,
  'simulador':   BarChart3,
  'tramites':    FileText,
  'agente':      Bot,
}
