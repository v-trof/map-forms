export type PoolType = "default" | "training"

export type PoolDTO = {
    id: string;
    type: PoolType;
    title: string;
    publicDescription?: string;
    minPrice: number;
    maxPrice: number;
}