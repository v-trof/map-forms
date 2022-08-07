import {ChangeEvent, FC, useEffect, useRef, useState} from 'react';
import { Field, useField } from "./field";

export const useNumber = (field: Field<number | undefined>) => {
    const { value, error, onChange, onParsingError, onInteractionStart, onInteractionEnd } = useField(field);

    const [stringValue, setStringValue] = useState('');
    const lastParsedValue = useRef<number | undefined>(value);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStringValue(value);

        const parsedValue = parseInt(value, 10);

        if(Number.isNaN(parsedValue)) {
            lastParsedValue.current = undefined;
            onParsingError({ message: 'parseFalied', fallbackValue: undefined });
        } else {
            lastParsedValue.current = parsedValue;
            onChange(parsedValue);
        }
    }

    useEffect(() => {
        if(value !== lastParsedValue.current) {
            lastParsedValue.current = value;
            setStringValue(value ? value.toString() : '');
        }
    }, [value])

    return { value: stringValue, onChange: handleChange, onFocus: onInteractionStart, onBlur: onInteractionEnd, error }
}

export const Numeric: FC<{field: Field<number | undefined>}> = ({ field }) => {
    const { value, error, onChange, onParsingError, onInteractionStart, onInteractionEnd } = useField(field);

    const [stringValue, setStringValue] = useState('');
    const lastParsedValue = useRef<number | undefined>(value);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setStringValue(value);

        const parsedValue = parseInt(value, 10);

        if(Number.isNaN(parsedValue)) {
            lastParsedValue.current = undefined;
            onParsingError({ message: 'parseFalied', fallbackValue: undefined });
        } else {
            lastParsedValue.current = parsedValue;
            onChange(parsedValue);
        }
    }

    useEffect(() => {
        if(value !== lastParsedValue.current) {
            lastParsedValue.current = value;
            setStringValue(value ? value.toString() : '');
        }
    }, [value])

    return <div>
        <input 
            value={stringValue} 
            onChange={handleChange} 
            onFocus={onInteractionStart} 
            onBlur={onInteractionEnd} />
        
        {error && <div style={{color: 'red'}}>{error.message}</div>}
    </div>
}