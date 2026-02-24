import { Injectable, signal, inject } from '@angular/core';
import {
    Auth,
    user,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    User as FirebaseUser,
    idToken
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);

    // Observable for auth state
    user$ = user(this.auth);
    token$ = idToken(this.auth);

    // Signal for simplified UI checks
    currentUser = signal<FirebaseUser | null | undefined>(undefined);

    constructor() {
        this.user$.subscribe(u => this.currentUser.set(u));
    }

    async login(email: string, pass: string) {
        return signInWithEmailAndPassword(this.auth, email, pass);
    }

    async register(email: string, pass: string, name: string) {
        const cred = await createUserWithEmailAndPassword(this.auth, email, pass);
        if (cred.user) {
            await updateProfile(cred.user, { displayName: name });
        }
        return cred;
    }

    async logout() {
        await signOut(this.auth);
        this.router.navigate(['/login']);
    }

    getToken(): Observable<string | null> {
        return this.token$.pipe(take(1));
    }
}
