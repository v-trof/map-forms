import { ExtractCurrentValue } from './access';
import { hasSetCurrentValue, setCurrentValue } from './domain';

const autofillDeep = (
    currentSlice: unknown,
    currentSliceValue: unknown
): unknown => {
    if (typeof currentSlice !== 'object' || !currentSlice) {
        return undefined;
    }

    if (hasSetCurrentValue(currentSlice)) {
        return currentSlice[setCurrentValue](currentSliceValue);
    }

    if (Array.isArray(currentSlice) && Array.isArray(currentSliceValue)) {
        return currentSlice.forEach((item, idx) => {
            if (idx < currentSliceValue.length) {
                return autofillDeep(item, currentSliceValue[idx]);
            }
        });
    }

    if (typeof currentSliceValue !== 'object' || !currentSliceValue) {
        return undefined;
    }

    for (const key in currentSlice) {
        if (key in currentSliceValue) {
            const newSlice = currentSlice[key as keyof typeof currentSlice];
            const newValue =
                currentSliceValue[key as keyof typeof currentSliceValue];
            autofillDeep(newSlice, newValue);
        }
    }
};

export const autofill = <Store>(
    store: Store,
    value: ExtractCurrentValue<Store>
) => {
    autofillDeep(store, value);
};
