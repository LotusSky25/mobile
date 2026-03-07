import { useContext, createContext, useState, useEffect } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged} from 'firebase/auth'
import { auth, db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
    return (
        useContext(AuthContext)
    )
}

export function AuthProvider(props){

    const {children} = props
    const [ globalUser, setGlobalUser ] = useState(null)
    const [ globalData, setGlobalData ] = useState(null)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ session, setSession ] = useState('')
    //handle registration
    function signUp(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }
    //handle login
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }
    //handle sign out
    function logout(){
        setGlobalData(null)
        setGlobalUser(null)
        return signOut(auth)
    }
    //get Date 
    function getDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth()+1;
        const day = date.getDate();
        const currentDate = `${day}-${month}-${year}`;
        return currentDate
    }
    const value = {
        globalUser,
        globalData,
        setGlobalData,
        isLoading,
        signUp,
        login,
        logout,
        session
    }

    useEffect(()=>{
        //function to listen for users and prevent data leaks
        const unsubscribed = onAuthStateChanged(auth, async (user)=> {
            setGlobalUser(user)
            const currentSession = getDate()
            setSession(currentSession)
            console.log("Current Session: ", currentSession)
            //if no user, return out of function
            if (!user) {
                console.log('No active user')
                return
            }
            //if there IS a user, try to find data in database and, if found, return data and update globalUser
            try {
                setIsLoading(true)
                //create reference to doc (your database exported in firebsae.js, name of doc, unique id)
                const docRef = doc(db, 'users', user.uid)
                //take snapshot of document to see if it contains data
                const docSnap = await getDoc(docRef)
                
                //create empty object
                let firebaseData = {}
                //if document snap contains data, assign data to empty state
                if(docSnap.exists()) {
                    firebaseData = docSnap.data()
                }
                setGlobalData(firebaseData)

            } catch(err){
                console.error('Firebase Error:', err.code, err.message)
                console.error('Full error:', err)
            } finally {
                setIsLoading(false)
            }

        })
        return unsubscribed
    }, [])

    return (
        //pass all things in value down as global state
        <AuthContext.Provider value={value}>
            { children }
        </AuthContext.Provider>
    )
}