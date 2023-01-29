import { Select } from '@chakra-ui/react';
import { useState } from 'react';

import './App.css';
import { SignIn } from './examples/1_signIn/SignIn';
import { createSignInStore } from './examples/1_signIn/signInStore';
import { SignUp } from './examples/2_signUp/SignUp';
import { createSignUpStore } from './examples/2_signUp/signUpStore';

const examples = {
    signIn: <SignIn store={createSignInStore()} />,
    signUp: <SignUp store={createSignUpStore()} />,
};

function App() {
    const [example, setExample] = useState<keyof typeof examples>('signUp');

    return (
        <div>
            <Select
                onChange={(e) => setExample(e.target.value as typeof example)}
            >
                {Object.keys(examples).map((x) => (
                    <option key={x} value={x}>
                        {x}
                    </option>
                ))}
            </Select>
            {examples[example]}
        </div>
    );
}

export default App;
