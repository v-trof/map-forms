import { field, Field, isRemoved, minLength, Removable } from "@informal/core"
import { makeAutoObservable } from "mobx";

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
    publicDescription: Field<string> & Removable;
    privateDescription: Field<string | undefined> & Removable;

    _projectDescription: string;
};

export const createPoolInfoStore = ({ initialValues, project }: { initialValues?: PoolInfoDTO, project: { description: string, title: string } }) => {
    const store: PoolInfoStore = {
        type: field(),
        title: field(),
        publicDescription: field.removable(minLength(4)),
        privateDescription: field.optional.removable(),

        _projectDescription: project.description
    }

    store.title.value = initialValues?.title ?? project.title;
    store.type.value = initialValues?.type;

    if (initialValues?.publicDescription) {
        store.publicDescription.value = initialValues.publicDescription;
    } else {
        store.publicDescription[isRemoved] = true;
    }

    if (initialValues?.privateDescription) {
        store.privateDescription.value = initialValues.privateDescription;
    } else {
        store.privateDescription[isRemoved] = true;
    }

    return makeAutoObservable(store);
}