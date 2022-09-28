import { InteractionStatus } from "./interactionStatus";

export type AccessContext = {
    type: 'none' | 'check' | 'submit',
    onAccess: (interactionStatus: InteractionStatus, isValid: boolean) => void;
}

export const accessContext: AccessContext = {
    type: 'none',
    onAccess: () => 0
}

export const createAccessContext = (type: AccessContext['type'], onAccess?: AccessContext['onAccess']) => {
    const lastContext = { ...accessContext };
    const newContext = { type, onAccess };
    Object.assign(accessContext, newContext);

    const releaseAccessContext = () => {
        Object.assign(accessContext, lastContext);
    }

    return releaseAccessContext;
}