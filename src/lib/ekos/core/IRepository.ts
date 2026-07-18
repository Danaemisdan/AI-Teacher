export interface IRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    find(predicate: (item: T) => boolean): Promise<T[]>;
    save(item: T): Promise<void>;
}
