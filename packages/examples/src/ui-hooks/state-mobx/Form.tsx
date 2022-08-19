import { FormControl, FormErrorMessage, FormLabel, Input, InputProps } from "@chakra-ui/react"
import { useMemo } from "react"

let count = 0;
let uniqueId = () => `id-${++count}`;

export const FormInput = ({ id, label, error, ...props}: InputProps & { label: string, error: string | undefined }) => {
    const inputId = useMemo(() => id ?? uniqueId(), [id])

    return (
        <FormControl isInvalid={Boolean(error)}>
            <FormLabel htmlFor={inputId}>{label}</FormLabel>
            <Input
                {...props}
                id={inputId}
                variant="filled"
            />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
        </FormControl>
    )
}