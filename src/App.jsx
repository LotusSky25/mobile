import Auth from "./components/Auth";
import Hero from "./components/Hero";
import Input from "./components/Input";
import Layout from "./components/Layout";
import Stats from "./components/Stats";
import { useAuth } from './context/AuthContext'

function App() {
  
  const { globalUser, globalData, isLoading } = useAuth()
  const isAuthenticated = globalUser
  //isData is only true if a) globalData exists and b) the length of that data is greater than 0. !! forces it to be boolean
  const isData = globalData && !!Object.keys(globalData || {}).length
  
  const authenticatedContent = (
    <Input/>
  )
  return (
    <>
      <Layout>
        <Hero isAuthenticated={isAuthenticated}/>
        
        {isAuthenticated && (authenticatedContent)}
      </Layout>
    </>
  )
}

export default App
