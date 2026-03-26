import {useState} from 'react'
import Modal1 from './Modal1'
import Auth from './Auth'
export default function Hero(props) {
    const {isAuthenticated} = props
    const [ showModal1, setShowModal1 ] = useState(false)
    return (
        <>
            {showModal1 &&(<Modal1 handleCloseModal={() =>{setShowModal1(false)}}>
                <Auth handleCloseModal={() =>{setShowModal1(false)}}/>
            </Modal1>)}

            <h1>Welcome to GPC Kids!</h1>
            {!isAuthenticated &&(
                <>
                    <p>Please login to view and manage classes</p>
                    <button class="login-button" onClick={()=> {setShowModal1(true)}}><p>Login</p></button>
                </>
            )}
        </>
    )
}