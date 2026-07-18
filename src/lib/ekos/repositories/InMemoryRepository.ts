import { IRepository } from '../core/IRepository';

export class InMemoryRepository<T extends { id: string }> implements IRepository<T> {
    private data: Map<string, T> = new Map();

    constructor(initialData: T[] = []) {
        initialData.forEach(item => this.data.set(item.id, item));
    }

    async findById(id: string): Promise<T | null> {
        return this.data.get(id) || null;
    }

    async findAll(): Promise<T[]> {
        return Array.from(this.data.values());
    }

    async find(predicate: (item: T) => boolean): Promise<T[]> {
        return Array.from(this.data.values()).filter(predicate);
    }

    async save(item: T): Promise<void> {
        this.data.set(item.id, item);
    }
}
