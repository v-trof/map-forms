// InteractionStatus still feels kinda verbose
export type InteractionStatus = 'new' | 'active' | 'wasActive';

export type StoreWithInteractionStatus = { interactionStatus: InteractionStatus };

export const aggregateInteractionStatus = (stores: StoreWithInteractionStatus[]) => {
    const someAreActive = stores.some(source => source.interactionStatus === 'active');
    const someWereActive = stores.some(source => source.interactionStatus === 'wasActive');

    if (someAreActive) {
        return 'active';
    }

    if (someWereActive) {
        return 'wasActive';
    }

    return 'new';
}