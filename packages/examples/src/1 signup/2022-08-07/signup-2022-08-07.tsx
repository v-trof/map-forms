import { useRouter } from "../../fakeNormalAppServices/router";
import { post } from "../../fakeNormalAppServices/transport";
import { useTranslation } from "../../fakeNormalAppServices/useTranslation";

type SignupForm = {
    name: Text;
    password: Text;
}

type SignupDTO = {
    name: string;
    password: string;
}

const useField = <T extends any>() => 0 as any;;
const useCheck: any = 0;
const useForm: any = 0;

export const sigunp = () => {

}

// so propagating state in react is a fuck, so the only typesafe way is to create shape outside 
// and somehow register a field to a form
// using context & rendering! since you only need to show errors when the field itself is visible, and you only need form submit state to decide if errors should be visible
export const Signup = () => {
    const t = useTranslation();
    const router = useRouter();

    const name = useField<string>();
    const password = useField<string>();

    // i like this one 
    const notSame = useCheck(() => {
        if (name === password) {
            return t('error.passwordMustNotEqualName')
        }
    })

    const form = useForm(async () => {
        const newUser = {name, password};
        const response = await post<void>('/api/user', newUser);
        
        if(response.ok) {
            router.navigate('profile');
            return
        }
        
        if(response.error.message === 'usernameTaken') {
            name.setBackendError(t('error.usernameTaken'))
            return
        }

        alert("500, CRAZY BACKEND PROBLEMS")
    }, [name, password, notSame])

    return (
        <form onSubmit={form.onSubmit}>
            <h1>Sign up</h1>

            <input {...name} />
            {name.error && <div className="error">{name.error}</div>}
             
            <input type="password" {...password} />
            {password.error && <div className="error">{password.error}</div>}

            {notSame.error && <div className="error">{notSame.error}</div>}

            <button>Submit</button>
        </form>
    )
}