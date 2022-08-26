import { field, Field, submit, ValidationResult } from "@informal/state-mobx"
import { autoSubmit, ExtractValues } from "@informal/state-mobx/src/submit";
import { makeAutoObservable, observable } from "mobx";

export type PoolType = "GENERAL" | "TRAINING" | "REHAB"

export type PoolInfoDTO = {
    type: PoolType,
    title: string,
    publicDescription?: string,
    privateDescription?: string
};

export type PoolInfoStore = {
    type: Field<PoolType>;
    title: Field<string>;
    publicDescription: Removable<Field<string>>;
    privateDescription: Removable<Field<string>>;

    _projectDescription: string;
}


export type Removable<T> = ({
    isRemoved: false,
    [submit]: () => ValidationResult<ExtractValues<T>>
} | {
    isRemoved: true,
    [submit]: () => ValidationResult<undefined>
}) & {
    store: T,
    remove: () => void,
    restore: () => void,
    toggle: () => void
};

export const removable = <T>(store: T): Removable<T> => {
    const removableStore = {
        isRemoved: true,
        store: store,
        [submit]: () => {
            if (removableStore.isRemoved) {
                return { isValid: true, value: undefined };
            }

            return autoSubmit(store);
        },
        remove: () => removableStore.isRemoved = true,
        restore: () => removableStore.isRemoved = false,
        toggle: () => removableStore.isRemoved = !removableStore.isRemoved
    } as Removable<T>

    return makeAutoObservable(removableStore, { store: observable.ref });
}

export const createPoolInfoStore = ({ initialValues, project }: { initialValues?: PoolInfoDTO, project: { description: string, title: string } }) => {
    const store: PoolInfoStore = {
        type: field(),
        title: field(),
        publicDescription: removable(field()),
        privateDescription: removable(field()),

        _projectDescription: project.description
    }


    // this way to set initial values is quite lame
    // i'd probably allow encapsulation of sorts if I could
    store.title.value = initialValues?.title ?? project.title;
    store.type.value = initialValues?.type;

    if (initialValues?.publicDescription) {
        store.publicDescription.restore();
        store.publicDescription.store.value = initialValues.publicDescription;
    } else {
        store.publicDescription.store.value = store._projectDescription;
    }

    if (initialValues?.privateDescription) {
        store.privateDescription.restore();
        store.privateDescription.store.value = initialValues.privateDescription;
    }

    return makeAutoObservable(store);
}