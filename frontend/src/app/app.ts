import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <!-- Sidebar - Only visible if logged in -->
      @if (auth.currentUser() !== undefined && auth.currentUser() !== null) {
        <aside class="sidebar fade-in-left">
          <div class="sidebar-logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">Tracker</span>
          </div>

          <div class="user-profile">
            <div class="user-avatar">{{ (auth.currentUser()?.displayName?.[0] || 'U').toUpperCase() }}</div>
            <div class="user-info">
              <div class="user-name">{{ auth.currentUser()?.displayName || 'User' }}</div>
              <div class="user-email">{{ auth.currentUser()?.email }}</div>
            </div>
          </div>

          <nav class="sidebar-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-item">
              <span class="nav-icon">🏠</span>
              <span>Dashboard</span>
            </a>
            <a routerLink="/items" routerLinkActive="active" class="nav-item">
              <span class="nav-icon">📋</span>
              <span>All Items</span>
            </a>
          </nav>

          <footer class="sidebar-footer">
            <button class="btn btn-ghost btn-block text-left" (click)="auth.logout()">
              <span class="nav-icon">🚪</span>
              <span>Logout</span>
            </button>
            <div class="api-status mt-4">
              <div class="status-dot"></div>
              <span class="text-muted text-xs">API Connected</span>
            </div>
          </footer>
        </aside>
      }

      <!-- Main content -->
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 24px 0;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 20px 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);

      .logo-icon {
        width: 32px;
        height: 32px;
        background: var(--accent);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 0 16px var(--accent-glow);
      }

      .logo-text {
        font-size: 18px;
        font-weight: 800;
        background: linear-gradient(135deg, #fff 40%, var(--accent-light));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 20px;
      margin-bottom: 32px;

      .user-avatar {
        width: 36px;
        height: 36px;
        background: var(--bg-glass-hover);
        border: 1px solid var(--border);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        color: var(--accent-light);
      }

      .user-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
      .user-email { font-size: 11px; color: var(--text-secondary); }
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 0 12px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      transition: all var(--transition);

      .nav-icon { font-size: 16px; }

      &:hover {
        background: var(--bg-glass-hover);
        color: var(--text-primary);
      }

      &.active {
        background: rgba(124, 58, 237, 0.15);
        color: var(--accent-light);
        border: 1px solid rgba(124, 58, 237, 0.25);
      }
    }

    .sidebar-footer {
      padding: 16px 12px 0;
      border-top: 1px solid var(--border);
    }

    .api-status {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 8px 0;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--green);
        box-shadow: 0 0 6px var(--green);
        animation: pulse 2s infinite;
      }
    }

    .mt-4 { margin-top: 16px; }
    .text-xs { font-size: 11px; }
    .text-left { justify-content: flex-start; }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* ── Main ── */
    .main-content {
      flex: 1;
      overflow-y: auto;
      background: var(--bg-primary);
    }

    .fade-in-left {
      animation: fadeInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes fadeInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class App {
  auth = inject(AuthService);
}
