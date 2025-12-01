<div className="flex h-20 items-center justify-between px-6 border-b border-border/10">
  {!isCollapsed && (
    <Logo size="xl" showText={true} />
  )}
  {isCollapsed && (
    <div className="flex items-center justify-center w-full">
      <Logo size="lg" showText={false} />
    </div>
  )}
  <SidebarTrigger className="h-9 w-9 hover:bg-accent/50 rounded-xl transition-colors" />
</div>

{/* Identificação do Usuário */ }
{
  !isCollapsed && (
    <div className="px-6 py-4 border-b border-border/10">
      {loadingColaborador ? (
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-20 w-20 rounded-full bg-muted"></div>
          <div className="text-center">
            <div className="h-4 bg-muted rounded mb-1 w-24"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => setShowAvatarSelector(true)}
            className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 hover:from-primary/30 hover:to-primary/20 transition-all duration-200 cursor-pointer"
            title="Clique para alterar avatar"
          >
            {(colaborador?.avatar || localAvatar) ? (
              <img
                src={colaborador?.avatar || localAvatar || ''}
                alt={colaborador.nome}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-primary" />
            )}
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground truncate">
              {colaborador?.nome || user?.name || 'Carregando...'}
            </p>
            <p className="text-xs text-muted-foreground truncate mb-2">
              {colaborador?.cargo || 'Cargo não informado'}
            </p>
            <div
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors border border-primary/20"
              onClick={() => setShowAvatarSelector(true)}
              title="Clique para alterar avatar"
            >
              Trocar avatar
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

{/* Navigation */ }
<SidebarContent className="flex-1 px-4 py-6">
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu className="space-y-2">
        {menuItems.map((item) => {
          const active = isActive(item.url);
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className={`group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${active
                    ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    }`}
                  title={item.title}
                >
                  <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"
                    }`} />
                  {!isCollapsed && (
                    <span className="font-medium text-sm">
                      {item.title}
                    </span>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</SidebarContent>

{/* Footer */ }
<div className="p-4 border-t border-border/10">
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
    </div >

  {/* AvatarSelector Modal */ }
{
  showAvatarSelector && colaborador && (
    <AvatarSelector
      currentAvatar={colaborador.avatar}
      onAvatarChange={handleAvatarUpdate}
      onClose={() => setShowAvatarSelector(false)}
      isOnline={isOnline}
    />
  )
}
  </Sidebar >
);
}
