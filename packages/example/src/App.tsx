import { useState } from 'react';

import './App.css';
import { SignIn, createSignInStore } from './examples/1_signIn/SignIn';
import { Select } from 'antd';
// import { SignUp } from './examples/2_signUp/SignUp';
// import { createSignUpStore } from './examples/2_signUp/signUpStore';
// import { FancyPasswordChecks } from './examples/3_fancyPasswordChecks/FancyPasswordChecks';
// import { createFancyPasswordChecksStore } from './examples/3_fancyPasswordChecks/fancyPasswordChecksStore';

const examples = {
    signIn: <SignIn store={createSignInStore()} />,
    // signUp: <SignUp store={createSignUpStore()} />,
    // passwordChecks: (
    //     <FancyPasswordChecks store={createFancyPasswordChecksStore()} />
    // ),
};

function App() {
    const [example, setExample] = useState<keyof typeof examples>('signIn');

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
