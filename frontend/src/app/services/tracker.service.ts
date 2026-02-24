import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, take, map } from 'rxjs';
import { Item } from '../models/item.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TrackerService {
    private http = inject(HttpClient);
    private authSvc = inject(AuthService);
    private apiUrl = 'http://localhost:3000/api/items';

    private getAuthHeaders(): Observable<HttpHeaders> {
        return this.authSvc.token$.pipe(
            take(1),
            switchMap(token => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });
                return [headers];
            })
        );
    }

    getAll(): Observable<Item[]> {
        return this.getAuthHeaders().pipe(
            switchMap(headers => this.http.get<any>(this.apiUrl, { headers })),
            map(res => {
                if (Array.isArray(res)) return res;
                if (res && res.data && Array.isArray(res.data)) return res.data;
                return [];
            })
        );
    }

    create(item: Partial<Item>): Observable<Item> {
        return this.getAuthHeaders().pipe(
            switchMap(headers => this.http.post<any>(this.apiUrl, item, { headers })),
            map(res => res && res.data ? res.data : res)
        );
    }

    update(id: string | number, item: Partial<Item>): Observable<Item> {
        return this.getAuthHeaders().pipe(
            switchMap(headers => this.http.put<any>(`${this.apiUrl}/${id}`, item, { headers })),
            map(res => res && res.data ? res.data : res)
        );
    }

    delete(id: string | number): Observable<any> {
        return this.getAuthHeaders().pipe(
            switchMap(headers => this.http.delete<any>(`${this.apiUrl}/${id}`, { headers })),
            map(res => res && res.data ? res.data : res)
        );
    }
}
