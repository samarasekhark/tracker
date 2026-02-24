import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, RouterLink],
    template: `
    <div class="auth-page">
      <div class="auth-card card fade-in-up">
        <div class="auth-header">
          <div class="logo">🚀</div>
          <h1>Welcome Back</h1>
          <p class="text-muted">Login to manage your tracker</p>
        </div>

        <form (ngSubmit)="onLogin()" #f="ngForm">
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" [(ngModel)]="email" placeholder="you@example.com" required />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" [(ngModel)]="password" placeholder="••••••••" required />
          </div>

          @if (error()) {
            <div class="auth-error">{{ error() }}</div>
          }

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            @if (loading()) { <span class="spinner" style="width:16px;height:16px;"></span> }
            Login
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Register</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .auth-page {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 40px;
      border-radius: 24px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
      .logo { font-size: 48px; margin-bottom: 16px; }
      h1 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
    }
    .auth-error {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
    }
    .btn-block { width: 100%; margin-top: 10px; }
    .auth-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      a { color: var(--accent); font-weight: 600; text-decoration: none; }
    }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; font-size: 14px; }
    input { width: 100%; margin-bottom: 16px; }
  `]
})
export class LoginComponent {
    email = '';
    password = '';
    loading = signal(false);
    error = signal('');

    private authSvc = inject(AuthService);
    private router = inject(Router);

    async onLogin() {
        this.loading.set(true);
        this.error.set('');
        try {
            await this.authSvc.login(this.email, this.password);
            this.router.navigate(['/']);
        } catch (e: any) {
            this.error.set(e.message || 'Login failed');
        } finally {
            this.loading.set(false);
        }
    }
}
