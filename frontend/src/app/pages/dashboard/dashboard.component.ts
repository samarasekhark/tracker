import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrackerService } from '../../services/tracker.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back! Here's your overview.</p>
        </div>
        <a routerLink="/items" class="btn btn-primary">
          <span>+</span> Add Item
        </a>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid fade-in-up">
        <div class="stat-card total">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <span class="stat-value">{{ total() }}</span>
            <span class="stat-label">Total Items</span>
          </div>
        </div>
        <div class="stat-card pending">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <span class="stat-value">{{ pendingCount() }}</span>
            <span class="stat-label">Pending</span>
          </div>
        </div>
        <div class="stat-card in-progress">
          <div class="stat-icon">🔄</div>
          <div class="stat-info">
            <span class="stat-value">{{ inProgressCount() }}</span>
            <span class="stat-label">In Progress</span>
          </div>
        </div>
        <div class="stat-card done">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">{{ doneCount() }}</span>
            <span class="stat-label">Done</span>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      @if (total() > 0) {
        <div class="card progress-card fade-in-up">
          <div class="progress-header">
            <span class="font-semibold">Overall Progress</span>
            <span class="progress-pct">{{ progressPct() }}% complete</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="progressPct()"></div>
          </div>
        </div>
      }

      <!-- Recent Items -->
      <div class="fade-in-up">
        <div class="section-header">
          <h2 class="section-title">Recent Items</h2>
          <a routerLink="/items" class="btn btn-ghost btn-sm">View all →</a>
        </div>

        @if (loading()) {
          <div class="empty-state"><div class="spinner"></div></div>
        } @else if (recentItems().length === 0) {
          <div class="empty-state card">
            <div class="empty-icon">📭</div>
            <p>No items yet</p>
            <small>Click "Add Item" to get started</small>
          </div>
        } @else {
          <div class="recent-list">
            @for (item of recentItems(); track item.id) {
              <div class="recent-item card">
                <div class="recent-item-left">
                  <span class="status-dot-sm" [class]="item.status"></span>
                  <div>
                    <div class="recent-title">{{ item.title }}</div>
                    @if (item.description) {
                      <div class="recent-desc text-muted text-sm">{{ item.description }}</div>
                    }
                  </div>
                </div>
                <span class="badge" [class]="item.status">{{ item.status }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page {
      padding: 36px 40px;
      max-width: 900px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .page-title {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 60%, var(--accent-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .page-subtitle {
      color: var(--text-secondary);
      margin-top: 4px;
      font-size: 14px;
    }

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .stat-card {
      padding: 22px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      overflow: hidden;
      transition: transform var(--transition), box-shadow var(--transition);

      &:hover { transform: translateY(-2px); box-shadow: var(--shadow); }

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        opacity: 0.05;
        background: radial-gradient(circle at 10% 10%, white, transparent 60%);
      }

      &.total      { background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.2); }
      &.pending    { background: rgba(234,179,8,0.08); border-color: rgba(234,179,8,0.2); }
      &.in-progress{ background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.2); }
      &.done       { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.2); }

      .stat-icon { font-size: 28px; }
      .stat-value { font-size: 30px; font-weight: 800; display: block; line-height: 1; }
      .stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; display: block; }
    }

    /* Progress */
    .progress-card { padding: 20px 24px; }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .progress-pct { font-size: 13px; color: var(--accent-light); font-weight: 600; }
    .progress-track {
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--accent-light));
      border-radius: 3px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Section */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .section-title { font-size: 17px; font-weight: 700; }

    /* Recent items */
    .recent-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .recent-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
    }

    .recent-item-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-dot-sm {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      &.pending     { background: var(--yellow); box-shadow: 0 0 6px var(--yellow); }
      &.in-progress { background: var(--blue);   box-shadow: 0 0 6px var(--blue); }
      &.done        { background: var(--green);  box-shadow: 0 0 6px var(--green); }
    }

    .recent-title { font-size: 14px; font-weight: 500; }
    .recent-desc  { margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px; }
  `]
})
export class DashboardComponent implements OnInit {
  items = signal<Item[]>([]);
  loading = signal(true);

  total = computed(() => {
    const list = this.items();
    return Array.isArray(list) ? list.length : 0;
  });
  pendingCount = computed(() => {
    const list = this.items();
    return Array.isArray(list) ? list.filter(i => i.status === 'pending').length : 0;
  });
  inProgressCount = computed(() => {
    const list = this.items();
    return Array.isArray(list) ? list.filter(i => i.status === 'in-progress').length : 0;
  });
  doneCount = computed(() => {
    const list = this.items();
    return Array.isArray(list) ? list.filter(i => i.status === 'done').length : 0;
  });
  progressPct = computed(() =>
    this.total() === 0 ? 0 : Math.round((this.doneCount() / this.total()) * 100)
  );
  recentItems = computed(() => {
    const list = this.items();
    if (!Array.isArray(list)) return [];
    return [...list].reverse().slice(0, 5);
  });

  constructor(private svc: TrackerService) { }

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: items => {
        console.log('Dashboard items received:', items);
        this.items.set(Array.isArray(items) ? items : []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
