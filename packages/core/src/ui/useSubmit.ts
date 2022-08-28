import { useState } from "react";
import { ExtractValue, submit } from "../accessors/submit";
import { isError } from "../protocol/error";

export const useSubmit = <Store>(store: Store, onSubmit: (values: ExtractValue<Store>) => void | Promise<void>) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return {
        handleSubmit: async (e: React.FormEvent) => {
            e.preventDefault();

            const result = submit(store);

            if (isError(result)) {
                return
            }

            setIsSubmitting(true);
            try {
                await onSubmit(result);
            } finally {
                setIsSubmitting(false);
            }
        },
        isSubmitting
    }
}