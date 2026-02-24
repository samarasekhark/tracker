import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrackerService } from '../../services/tracker.service';
import { Item, ItemStatus } from '../../models/item.model';

type FilterTab = 'all' | ItemStatus;
interface Toast { id: number; msg: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">All Items</h1>
          <p class="page-subtitle">Manage your tasks and jobs</p>
        </div>
        <button class="btn btn-primary" (click)="openCreate()">
          <span>+</span> Add Item
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        @for (tab of tabs; track tab.value) {
          <button
            class="filter-tab"
            [class.active]="activeFilter() === tab.value"
            (click)="activeFilter.set(tab.value)">
            {{ tab.label }}
            <span class="tab-count">{{ countFor(tab.value) }}</span>
          </button>
        }
      </div>

      <!-- List -->
      @if (loading()) {
        <div class="empty-state"><div class="spinner"></div></div>
      } @else if (filtered().length === 0) {
        <div class="empty-state card">
          <div class="empty-icon">📭</div>
          <p>No items here</p>
          <small>{{ activeFilter() === 'all' ? 'Click "+ Add Item" to create one' : 'Switch filter or add a new item' }}</small>
        </div>
      } @else {
        <div class="items-list fade-in-up">
          @for (item of filtered(); track item.id; let i = $index) {
            <div class="item-card card" [style.animation-delay]="i * 40 + 'ms'">
              <div class="item-left">
                <!-- Status toggle dot -->
                <button class="status-toggle" [class]="item.status" (click)="cycleStatus(item)" title="Click to change status">
                  <span class="status-dot-inner"></span>
                </button>

                <div class="item-body">
                  <div class="item-title">{{ item.title }}</div>
                  @if (item.description) {
                    <div class="item-desc text-muted text-sm">{{ item.description }}</div>
                  }
                  <div class="item-meta">
                    <span class="badge" [class]="item.status">{{ item.status }}</span>
                    @if (item.createdAt) {
                      <span class="text-muted text-sm">{{ formatDate(item.createdAt) }}</span>
                    }
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <button class="btn btn-icon" (click)="openEdit(item)" title="Edit">✏️</button>
                <button class="btn btn-icon btn-danger" (click)="confirmDelete(item)" title="Delete">🗑️</button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Add / Edit Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal($event)">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingItem() ? 'Edit Item' : 'New Item' }}</h2>
            <button class="btn btn-icon" (click)="showModal.set(false)">✕</button>
          </div>

          <form (ngSubmit)="saveItem()" #f="ngForm">
            <div style="display:flex;flex-direction:column;gap:16px;">
              <div class="form-group">
                <label>Title *</label>
                <input
                  id="item-title"
                  name="title"
                  [(ngModel)]="form.title"
                  placeholder="e.g. Apply to Google"
                  required
                  autofocus />
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea
                  id="item-desc"
                  name="description"
                  [(ngModel)]="form.description"
                  rows="3"
                  placeholder="Optional details..."></textarea>
              </div>

              <div class="form-group">
                <label>Status</label>
                <select id="item-status" name="status" [(ngModel)]="form.status">
                  <option value="pending">⏳ Pending</option>
                  <option value="in-progress">🔄 In Progress</option>
                  <option value="done">✅ Done</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="showModal.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving() || !form.title?.trim()">
                @if (saving()) { <span class="spinner" style="width:14px;height:14px;border-width:2px"></span> }
                {{ editingItem() ? 'Save Changes' : 'Create Item' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirm Modal -->
    @if (deleteTarget()) {
      <div class="modal-overlay" (click)="deleteTarget.set(null)">
        <div class="modal" style="max-width:380px">
          <div class="modal-header">
            <h2>Delete Item?</h2>
            <button class="btn btn-icon" (click)="deleteTarget.set(null)">✕</button>
          </div>
          <p class="text-muted" style="font-size:14px">
            "<strong style="color:var(--text-primary)">{{ deleteTarget()?.title }}</strong>" will be permanently removed.
          </p>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="deleteTarget.set(null)">Cancel</button>
            <button class="btn btn-danger" (click)="doDelete()">Delete</button>
          </div>
        </div>
      </div>
    }

    <!-- Toasts -->
    <div class="toast-container">
      @for (t of toasts(); track t.id) {
        <div class="toast" [class]="t.type">
          {{ t.type === 'success' ? '✅' : '❌' }} {{ t.msg }}
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      padding: 36px 40px;
      max-width: 820px;
      display: flex;
      flex-direction: column;
      gap: 24px;
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

    .page-subtitle { color: var(--text-secondary); margin-top: 4px; font-size: 14px; }

    /* Filter tabs */
    .filter-tabs {
      display: flex;
      gap: 6px;
      background: var(--bg-glass);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 5px;
    }

    .filter-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      background: transparent;
      transition: all var(--transition);

      &:hover { background: var(--bg-glass-hover); color: var(--text-primary); }

      &.active {
        background: var(--accent);
        color: #fff;
        box-shadow: 0 0 14px var(--accent-glow);
      }

      .tab-count {
        background: rgba(255,255,255,0.15);
        border-radius: 999px;
        padding: 1px 7px;
        font-size: 11px;
      }
    }

    /* Item list */
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .item-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px;
      animation: fadeInUp 0.3s ease both;
    }

    .item-left {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      flex: 1;
      min-width: 0;
    }

    /* Clickable status toggle */
    .status-toggle {
      margin-top: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: transparent;
      border: 2px solid;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition);

      .status-dot-inner {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      &.pending {
        border-color: var(--yellow);
        .status-dot-inner { background: var(--yellow); }
        &:hover { background: rgba(234,179,8,0.15); }
      }
      &.in-progress {
        border-color: var(--blue);
        .status-dot-inner { background: var(--blue); box-shadow: 0 0 6px var(--blue); }
        &:hover { background: rgba(59,130,246,0.15); }
      }
      &.done {
        border-color: var(--green);
        .status-dot-inner { background: var(--green); box-shadow: 0 0 6px var(--green); }
        &:hover { background: rgba(34,197,94,0.15); }
      }
    }

    .item-body { flex: 1; min-width: 0; }
    .item-title { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-desc  { margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-meta  { display: flex; align-items: center; gap: 10px; margin-top: 8px; }

    .item-actions {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
      opacity: 0;
      transition: opacity var(--transition);
    }

    .item-card:hover .item-actions { opacity: 1; }
  `]
})
export class ItemsComponent implements OnInit {
  items = signal<Item[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingItem = signal<Item | null>(null);
  deleteTarget = signal<Item | null>(null);
  activeFilter = signal<FilterTab>('all');
  toasts = signal<Toast[]>([]);

  form: Partial<Item> = { title: '', description: '', status: 'pending' };

  tabs = [
    { label: 'All', value: 'all' as FilterTab },
    { label: 'Pending', value: 'pending' as FilterTab },
    { label: 'In Progress', value: 'in-progress' as FilterTab },
    { label: 'Done', value: 'done' as FilterTab },
  ];

  filtered = computed(() => {
    const list = this.items();
    if (!Array.isArray(list)) return [];
    return this.activeFilter() === 'all'
      ? list
      : list.filter(i => i.status === this.activeFilter());
  });

  countFor(tab: FilterTab) {
    const list = this.items();
    if (!Array.isArray(list)) return 0;
    return tab === 'all'
      ? list.length
      : list.filter(i => i.status === tab).length;
  }

  constructor(private svc: TrackerService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: items => {
        console.log('Items received:', items);
        // Defensive check: Ensure items is an array
        const itemsArray = Array.isArray(items) ? items : [];
        this.items.set(itemsArray);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load items:', err);
        this.items.set([]);
        this.loading.set(false);
        this.toast('Failed to load items', 'error');
      }
    });
  }

  openCreate() {
    this.editingItem.set(null);
    this.form = { title: '', description: '', status: 'pending' };
    this.showModal.set(true);
  }

  openEdit(item: Item) {
    this.editingItem.set(item);
    this.form = { title: item.title, description: item.description, status: item.status };
    this.showModal.set(true);
  }

  saveItem() {
    if (!this.form.title?.trim()) return;
    this.saving.set(true);
    const editing = this.editingItem();

    const obs = editing
      ? this.svc.update(editing.id!, this.form)
      : this.svc.create(this.form);

    obs.subscribe({
      next: saved => {
        if (editing) {
          this.items.update(list => list.map(i => i.id === saved.id ? saved : i));
          this.toast('Item updated!', 'success');
        } else {
          this.items.update(list => [...list, saved]);
          this.toast('Item created!', 'success');
        }
        this.saving.set(false);
        this.showModal.set(false);
      },
      error: () => { this.saving.set(false); this.toast('Something went wrong', 'error'); }
    });
  }

  confirmDelete(item: Item) { this.deleteTarget.set(item); }

  doDelete() {
    const target = this.deleteTarget();
    if (!target?.id) return;
    this.svc.delete(target.id).subscribe({
      next: () => {
        this.items.update(list => list.filter(i => i.id !== target.id));
        this.toast('Item deleted', 'success');
        this.deleteTarget.set(null);
      },
      error: () => this.toast('Delete failed', 'error')
    });
  }

  cycleStatus(item: Item) {
    const order: ItemStatus[] = ['pending', 'in-progress', 'done'];
    const next = order[(order.indexOf(item.status) + 1) % order.length];
    this.svc.update(item.id!, { status: next }).subscribe({
      next: updated => {
        this.items.update(list => list.map(i => i.id === updated.id ? updated : i));
      }
    });
  }

  closeModal(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay'))
      this.showModal.set(false);
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  toast(msg: string, type: 'success' | 'error') {
    const id = Date.now();
    this.toasts.update(t => [...t, { id, msg, type }]);
    setTimeout(() => this.toasts.update(t => t.filter(x => x.id !== id)), 3000);
  }
}
