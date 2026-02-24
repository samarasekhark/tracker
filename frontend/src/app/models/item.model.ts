export interface Item {
    id?: string | number;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'done';
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ItemStatus = 'pending' | 'in-progress' | 'done';
