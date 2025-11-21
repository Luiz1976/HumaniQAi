import { Building2, UserPlus, Users, Menu, LogOut, Home, Activity, FileText } from "lucide-react";
import Logo from "@/components/Logo";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";
import { apiService } from "@/services/apiService";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { 
    title: "Home", 
    url: "/empresa/overview", 
    icon: Home,
  },
  { 
    title: "Gerar Convites", 
    url: "/empresa/gerar-convite", 
    icon: UserPlus,
  },
  { 
    title: "Gestão de Colaboradores", 
    url: "/empresa/gestao-colaboradores", 
    icon: Users,
  },
  { 
    title: "Estado Psicossocial da Empresa", 
    url: "/empresa/estado-psicossocial", 
    icon: Activity,
  },
  { 
    title: "PGR", 
    url: "/empresa/pgr", 
    icon: FileText,
  },
];

export function EmpresaSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [empresaLogo, setEmpresaLogo] = useState<string | null>(null);
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchEmpresaData = async () => {
      if (user?.empresaId) {
        setIsLoadingLogo(true);
        try {
          const response = await apiService.obterDadosEmpresa();
          if (response.empresa?.logoBase64) {
            setEmpresaLogo(response.empresa.logoBase64);
          }
        } catch (error) {
          console.error('Erro ao buscar dados da empresa:', error);
        } finally {
          setIsLoadingLogo(false);
        }
      }
    };

    fetchEmpresaData();
  }, [user?.empresaId]);

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r border-gray-200 bg-white"
      collapsible="icon"
    >
      <div className="flex h-full flex-col">
        {/* Header - Logo e Toggle */}
        <div className="flex flex-col py-4 px-6 border-b border-border/10">
          <div className="flex h-16 items-center justify-between">
            {!isCollapsed && (
              <Logo size="xl" showText={true} />
            )}
            {isCollapsed && (
              <div className="flex items-center justify-center w-full">
                <Logo size="lg" showText={false} />
              </div>
            )}
            <SidebarTrigger className="h-8 w-8 hover:bg-accent/50 transition-colors">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
          </div>
          
          {/* Logo da Empresa - apenas se disponível e não estiver colapsado */}
          {empresaLogo && !isCollapsed && (
            <div className="mt-3 flex justify-center">
              <img
                src={empresaLogo}
                alt="Logo da Empresa"
                className="h-12 w-auto max-w-32 object-contain rounded-lg bg-white/50 p-1"
                onError={() => setEmpresaLogo(null)}
              />
            </div>
          )}
          
          {/* Logo da Empresa quando colapsado - versão menor */}
          {empresaLogo && isCollapsed && (
            <div className="mt-2 flex justify-center">
              <img
                src={empresaLogo}
                alt="Logo da Empresa"
                className="h-8 w-auto max-w-8 object-contain rounded bg-white/50 p-1"
                onError={() => setEmpresaLogo(null)}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <SidebarContent className="flex-1 px-4 py-6">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`
                        group relative h-12 w-full justify-start gap-3 rounded-xl px-4 text-sm font-medium transition-all duration-200 hover:bg-accent/50
                        ${isActive(item.url) 
                          ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 shadow-sm border border-blue-200/20' 
                          : 'text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <NavLink to={item.url} className="flex items-center gap-3 w-full">
                        <item.icon 
                          className={`h-5 w-5 transition-colors ${
                            isActive(item.url) ? 'text-blue-600' : 'text-muted-foreground group-hover:text-foreground'
                          }`} 
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.title}</span>
                        )}
                        {isActive(item.url) && (
                          <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-500" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <div className="border-t border-border/10 p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/40"
                title="Sair"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">
                    Sair
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </div>
    </Sidebar>
  );
}