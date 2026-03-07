import {useState} from 'react'
import { useAuth } from '../context/AuthContext'

export default function Auth(props) {
    
    const { handleCloseModal} = props
    const [ isRegistering, setIsRegistering ] = useState(false)
    const [ email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [ isAuthenticating, setIsAuthenticating] = useState(false)
    const [ error, setError ] = useState(null)
    
    const { signUp, login } = useAuth()

    async function handleAuthentication() {
        if (!email || !password || !email.includes('@') || password.length < 6) {return}
        try {
            setIsAuthenticating(true)
            setError(null)
            if(isRegistering){
                await signUp(email, password)
            } else {
                await login(email, password)
            }
            handleCloseModal()
        } catch (err) {
            console.log(err.message)
            setError(err.message)
        } finally {
            setIsAuthenticating(false)
        }
    }

    return (
        <>
            <h2>{isRegistering ? 'Sign Up' : 'Login'}</h2>
            {error && (<p>❌{error}</p>)}
            <p>{isRegistering ? 'Create an account' : 'Login to your account'}</p>
            <input value={email} onChange={(e)=>{setEmail(e.target.value)}} placeholder="Email"/>
            <input value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password" type="password"/>
            <button onClick={handleAuthentication}>{isAuthenticating ? 'Authenticating...' : 'Submit'}</button>
            <hr />
            <p>{isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}</p>
            <button onClick={()=>{setIsRegistering(!isRegistering)}} >{isRegistering ? 'Login' : 'Sign Up'}</button>
        </>
    )
}