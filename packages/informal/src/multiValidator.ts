import { Invalid } from './validation';

export const multiValidator = (run: () => Invalid | undefined) => {
    return {
        getError() {
            return run();
        },
    };
};
