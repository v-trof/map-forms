import {ChangeEvent, FC} from 'react';
import { Field, useField } from "./field";

export const Text: FC<{field: Field<string | undefined>}> = ({ field }) => {
    const {value, error, onChange, onInteractionStart, onInteractionEnd} = useField(field);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value.trim() || undefined);
    }

    return <div>
        <input 
            value={value} 
            onChange={handleChange} 
            onFocus={onInteractionStart} 
            onBlur={onInteractionEnd} />
        
        {error && <div style={{color: 'red'}}>{error.message}</div>}
    </div>
}