import Modal1 from "./Modal1"
import Auth from "./Auth"
import download from "../assets/download.png"
import {useAuth}from '../context/AuthContext'

export default function Layout(props) {
    const { children } = props
    const { globalUser, logout} = useAuth()
    const header = (
        <header>
            <div>
                <h1>GPC Kids</h1>
                <p>The attendance tracker for Glendowie Presbyterian Church </p>
                {globalUser ? (<button onClick={logout}>Logout</button>):''}
            </div>
            <img src={download}/>
        </header>
    )

    const footer = (
        <footer>
            <p>Footer</p>
        </footer>
    )
    return (
        <>
            { header }
            <main>
                { children }
            </main>
            { footer }
        </>
    )
}